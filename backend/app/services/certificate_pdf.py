"""Olynixx Praxis certificate PDF — visual twin of the official RiseUp credential layout."""

from __future__ import annotations

import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas

# Palette sampled from Omar_MSFit_Certificate master
CREAM = HexColor("#faf7f0")
INK = HexColor("#222222")
MUTED = HexColor("#555555")
SOFT = HexColor("#777777")
ACCENT = HexColor("#c75c43")
GOLD = HexColor("#c5a059")
GOLD_LINE = HexColor("#b8954a")

STORAGE_DIR = Path(os.environ.get("CERTIFICATE_STORAGE_DIR", "storage/certificates"))
TEMPLATE_VERSION = "v9"
VALIDITY_YEARS = 2
SIGNATORY_NAME = "Jef Louis M. Geys"
SIGNATORY_TITLE = "Founder & Credential Authority · Olynixx Praxis"
TAGLINE = "A well-rested body is the base of good health."
PROGRAMME_LINE = "Professional Certification in Human Readiness · Recovery · Performance Intelligence"
REQUIREMENTS_LINE = (
    "Written examination · Practical assessment PASS · Dual-gate competency · Coaching conversation"
)
ISSUING_BODY = "Olynixx Praxis · UAE"


def certificate_storage_path(verification_code: str) -> Path:
    # Alnum-only filename; TEMPLATE_VERSION busts cache when layout changes.
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    safe = "".join(ch for ch in verification_code if ch.isalnum())
    return STORAGE_DIR / f"{safe}-{TEMPLATE_VERSION}.pdf"


def _add_years(dt: datetime, years: int) -> datetime:
    try:
        return dt.replace(year=dt.year + years)
    except ValueError:
        # Feb 29 → Feb 28 on non-leap target years.
        return dt.replace(year=dt.year + years, day=28)


def _fmt_date(dt: datetime) -> str:
    local = dt.astimezone() if dt.tzinfo else dt
    return local.strftime("%d %B %Y")


def _credential_display(certification_level: str) -> str:
    return (certification_level or "Level 1: Human Readiness Coach").strip()


def _seal_credential(certification_level: str) -> str:
    """Title only for the seal — strip Level N prefixes and keep inside the ring."""
    raw = _credential_display(certification_level)
    bare = re.match(r"(?i)^level\s*(\d+)\s*$", raw.strip())
    if bare:
        raw = {
            "1": "Human Readiness Coach",
            "2": "Recovery Coach",
            "3": "Performance Intelligence Coach",
        }.get(bare.group(1), "Praxis Coach")
    else:
        raw = re.sub(r"(?i)^level\s*\d+\s*[:\-–—]\s*", "", raw).strip()
        if ":" in raw:
            raw = raw.split(":", 1)[1].strip()
        raw = re.sub(r"(?i)^LEVEL\s*\d+\s*", "", raw).strip(" -–—")
    raw = re.sub(r"\s+", " ", raw).upper()
    return raw or "PRAXIS COACH"


def _fit_seal_lines(credential: str, max_width: float, font: str = "Helvetica-Bold") -> list[tuple[str, float]]:
    """Wrap/scale seal credential so every line fits inside the ring."""
    words = credential.split()
    if not words:
        return [("PRAXIS COACH", 7.0)]

    def width_at(text: str, size: float) -> float:
        return pdfmetrics.stringWidth(text, font, size)

    # Try 1–3 line layouts, shrink font until each line fits the ring.
    candidates: list[list[str]] = []
    if len(words) == 1:
        candidates.append([words[0]])
    elif len(words) == 2:
        candidates.append([" ".join(words)])
        candidates.append(words)
    else:
        candidates.append([" ".join(words[:-1]), words[-1]])
        mid = len(words) // 2
        candidates.append([" ".join(words[:mid]), " ".join(words[mid:])])
        if len(words) >= 3:
            candidates.append([words[0], " ".join(words[1:-1]), words[-1]])

    for lines in candidates:
        for size in (7.2, 6.6, 6.0, 5.4, 5.0):
            if all(width_at(line, size) <= max_width for line in lines):
                return [(line, size) for line in lines]

    # Last resort: single truncated line
    size = 5.0
    text = credential
    while width_at(text, size) > max_width and len(text) > 8:
        text = text[:-2]
    return [(text.rstrip() + "…", size)] if text != credential else [(text, size)]


def _draw_spaced_centered(
    c: canvas.Canvas,
    text: str,
    y: float,
    font: str,
    size: float,
    color: Color,
    cx: float,
    tracking: float = 2.8,
) -> None:
    c.setFont(font, size)
    c.setFillColor(color)
    chars = list(text.upper())
    widths = [pdfmetrics.stringWidth(ch, font, size) for ch in chars]
    total = sum(widths) + tracking * max(0, len(chars) - 1)
    x = cx - total / 2
    for ch, w in zip(chars, widths):
        c.drawString(x, y, ch)
        x += w + tracking


def _draw_frame(c: canvas.Canvas, width: float, height: float) -> None:
    outer = 9 * mm
    c.setStrokeColor(ACCENT)
    c.setLineWidth(1.25)
    c.rect(outer, outer, width - 2 * outer, height - 2 * outer, stroke=1, fill=0)
    inner = outer + 2.2 * mm
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.6)
    c.rect(inner, inner, width - 2 * inner, height - 2 * inner, stroke=1, fill=0)


def _hrule(c: canvas.Canvas, y: float, cx: float, half_w: float) -> None:
    c.setStrokeColor(GOLD_LINE)
    c.setLineWidth(0.6)
    c.line(cx - half_w, y, cx + half_w, y)


def _draw_ring_seal(
    c: canvas.Canvas,
    cx: float,
    cy: float,
    r: float,
    credential: str,
    year_line: str,
) -> None:
    c.setStrokeColor(ACCENT)
    c.setLineWidth(1.65)
    c.circle(cx, cy, r, stroke=1, fill=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.circle(cx, cy, r - 2.0 * mm, stroke=1, fill=0)

    # Keep all text inside the inner ring with a safety inset
    max_w = (r - 4.5 * mm) * 2

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 6.4)
    c.drawCentredString(cx, cy + 7.2 * mm, "OLYNIXX PRAXIS")

    c.setStrokeColor(GOLD_LINE)
    c.setLineWidth(0.5)
    c.line(cx - 9 * mm, cy + 4.6 * mm, cx + 9 * mm, cy + 4.6 * mm)

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 5.8)
    c.drawCentredString(cx, cy + 1.2 * mm, "CERTIFIED")

    lines = _fit_seal_lines(credential, max_w)
    y = cy - 3.2 * mm
    for text, size in lines:
        c.setFont("Helvetica-Bold", size)
        c.drawCentredString(cx, y, text)
        y -= size + 1.6

    # Year stays above the lower arc, clear of the signature
    c.setFillColor(SOFT)
    c.setFont("Helvetica-Oblique", 5.6)
    c.drawCentredString(cx, cy - r + 5.5 * mm, year_line)


def _draw_signature(c: canvas.Canvas, cx: float, y: float) -> None:
    """Compact flourish placed fully below the seal (does not enter the ring)."""
    c.setStrokeColor(INK)
    c.setLineCap(1)
    c.setLineJoin(1)
    c.setLineWidth(1.25)
    p = c.beginPath()
    p.moveTo(cx - 24 * mm, y)
    p.curveTo(cx - 16 * mm, y + 5 * mm, cx - 10 * mm, y - 4 * mm, cx - 2 * mm, y + 1.5 * mm)
    p.curveTo(cx + 5 * mm, y + 5.5 * mm, cx + 10 * mm, y - 4.5 * mm, cx + 18 * mm, y + 1 * mm)
    p.curveTo(cx + 22 * mm, y + 3.5 * mm, cx + 24 * mm, y - 1 * mm, cx + 26 * mm, y + 0.5 * mm)
    c.drawPath(p, stroke=1, fill=0)
    c.setLineWidth(0.8)
    p2 = c.beginPath()
    p2.moveTo(cx - 12 * mm, y - 2.8 * mm)
    p2.curveTo(cx - 2 * mm, y - 4.5 * mm, cx + 8 * mm, y - 1.5 * mm, cx + 16 * mm, y - 3.2 * mm)
    c.drawPath(p2, stroke=1, fill=0)


def _meta_col(c: canvas.Canvas, x: float, y: float, label: str, value: str, col_w: float) -> None:
    c.setFillColor(SOFT)
    c.setFont("Helvetica", 6.5)
    c.drawString(x, y + 7 * mm, label)
    c.setFillColor(INK)
    c.setFont("Times-Bold", 9.5)
    display = value
    max_w = col_w - 4 * mm
    while pdfmetrics.stringWidth(display, "Times-Bold", 9.5) > max_w and len(display) > 5:
        display = display[:-2] + "…"
    c.drawString(x, y, display)


def render_certificate_pdf(
    *,
    holder_name: str,
    certification_level: str,
    verification_code: str,
    issued_at: datetime,
    valid_until: Optional[datetime] = None,
    cohort_line: Optional[str] = None,
    output_path: Optional[Path] = None,
) -> Path:
    """
    Landscape A4 twin of the official RiseUp certificate.
    Vertical positions are percentage-matched to Omar_MSFit master bands.
    """
    path = output_path or certificate_storage_path(verification_code)
    path.parent.mkdir(parents=True, exist_ok=True)

    expiry = valid_until or _add_years(issued_at, VALIDITY_YEARS)
    width, height = landscape(A4)
    cx = width / 2
    c = canvas.Canvas(str(path), pagesize=landscape(A4))
    c.setTitle(f"Olynixx Praxis · {certification_level}")
    c.setAuthor("Olynixx Praxis")
    c.setSubject("Professional Certification")

    c.setFillColor(CREAM)
    c.rect(0, 0, width, height, stroke=0, fill=1)
    _draw_frame(c, width, height)

    level = _credential_display(certification_level)
    name = (holder_name or "Certificate Holder").strip()
    code = (verification_code or "").strip().upper()
    year = str((issued_at.astimezone() if issued_at.tzinfo else issued_at).year)
    seal_cred = _seal_credential(level)
    cohort = (cohort_line or "").strip()

    # Vertical layout matched to official RiseUp credential ink bands.
    def y_from_top(pct: float) -> float:
        return height * (1.0 - pct)

    _draw_spaced_centered(
        c, "OLYNIXX PRAXIS", y_from_top(0.105), "Helvetica-Bold", 15, ACCENT, cx, tracking=3.4
    )
    c.setFillColor(MUTED)
    c.setFont("Times-Italic", 9.5)
    c.drawCentredString(cx, y_from_top(0.135), PROGRAMME_LINE)

    c.setFillColor(MUTED)
    c.setFont("Times-Roman", 11)
    c.drawCentredString(cx, y_from_top(0.215), "This is to certify that")

    c.setFillColor(ACCENT)
    c.setFont("Times-Bold", 26)
    c.drawCentredString(cx, y_from_top(0.280), name)
    _hrule(c, y_from_top(0.315), cx, 68 * mm)

    c.setFillColor(MUTED)
    c.setFont("Times-Roman", 10)
    c.drawCentredString(
        cx,
        y_from_top(0.365),
        "has successfully completed all requirements for the credential of",
    )

    c.setFillColor(INK)
    c.setFont("Times-Bold", 17)
    c.drawCentredString(cx, y_from_top(0.412), level)
    c.setFillColor(MUTED)
    c.setFont("Times-Italic", 9.5)
    c.drawCentredString(cx, y_from_top(0.455), "(Olynixx Praxis)")

    # Optional cohort only when provided (avoids duplicating the seal year).
    c.setFillColor(INK)
    c.setFont("Helvetica", 7.6)
    c.drawCentredString(cx, y_from_top(0.520), REQUIREMENTS_LINE)
    if cohort:
        c.setFillColor(SOFT)
        c.setFont("Times-Italic", 8)
        c.drawCentredString(cx, y_from_top(0.545), cohort)

    meta_y = y_from_top(0.600)
    meta_w = 245 * mm
    meta_left = cx - meta_w / 2
    col_w = meta_w / 4
    _meta_col(c, meta_left + 0 * col_w, meta_y, "ISSUED", _fmt_date(issued_at), col_w)
    _meta_col(c, meta_left + 1 * col_w, meta_y, "VALID UNTIL", _fmt_date(expiry), col_w)
    _meta_col(c, meta_left + 2 * col_w, meta_y, "CERTIFICATE No.", code, col_w)
    _meta_col(c, meta_left + 3 * col_w, meta_y, "ISSUING BODY", ISSUING_BODY, col_w)

    # Keep seal/signature/footer inside the double border (~11.2mm inset).
    seal_cy = y_from_top(0.710)
    seal_r = 18.5 * mm
    _draw_ring_seal(c, cx, seal_cy, seal_r, seal_cred, f"UAE · {year}")

    # Signature must sit fully below the ring (overlap with seal text was a past bug).
    sig_y = seal_cy - seal_r - 3.2 * mm
    _draw_signature(c, cx, sig_y)

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawCentredString(cx, sig_y - 8 * mm, SIGNATORY_NAME)
    c.setFillColor(SOFT)
    c.setFont("Times-Italic", 7.2)
    c.drawCentredString(cx, sig_y - 12.5 * mm, SIGNATORY_TITLE)

    c.setFillColor(ACCENT)
    c.setFont("Times-Italic", 8)
    c.drawCentredString(cx, sig_y - 17.5 * mm, TAGLINE)

    c.setFillColor(SOFT)
    c.setFont("Helvetica", 6.2)
    c.drawCentredString(
        cx,
        14.5 * mm,
        "Issued under Olynixx Praxis governance · Verify at olynixx.com quoting Certificate No.",
    )

    c.showPage()
    c.save()
    return path.resolve()


def ensure_certificate_pdf(
    *,
    holder_name: str,
    certification_level: str,
    verification_code: str,
    issued_at: datetime,
    valid_until: Optional[datetime] = None,
    cohort_line: Optional[str] = None,
    force: bool = False,
) -> Path:
    path = certificate_storage_path(verification_code)
    # Skip regen unless force=True (admin regenerate or template bump via new path).
    if path.exists() and not force:
        return path.resolve()
    return render_certificate_pdf(
        holder_name=holder_name,
        certification_level=certification_level,
        verification_code=verification_code,
        issued_at=issued_at,
        valid_until=valid_until,
        cohort_line=cohort_line,
        output_path=path,
    )
