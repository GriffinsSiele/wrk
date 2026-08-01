"""Olynixx Praxis certificate PDF template (landscape A4)."""

from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

# Praxis brand tokens
INK = HexColor("#0c0f12")
CREAM = HexColor("#f2ede3")
GOLD = HexColor("#d9ac4a")
GOLD_BRIGHT = HexColor("#e5c06a")
BRONZE = HexColor("#96762b")
OCHRE = HexColor("#c9962e")
TEAL_DEEP = HexColor("#0d3b3e")
MINT = HexColor("#2aa187")
MUTED = HexColor("#5c635c")

STORAGE_DIR = Path(os.environ.get("CERTIFICATE_STORAGE_DIR", "storage/certificates"))


def certificate_storage_path(verification_code: str) -> Path:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    safe = "".join(ch for ch in verification_code if ch.isalnum())
    return STORAGE_DIR / f"{safe}.pdf"


def _draw_double_frame(c: canvas.Canvas, width: float, height: float) -> None:
    margin = 12 * mm
    # Outer cream field already set as fill; draw gold/bronze rules
    c.setStrokeColor(GOLD)
    c.setLineWidth(2.2)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin, stroke=1, fill=0)

    c.setStrokeColor(BRONZE)
    c.setLineWidth(0.6)
    inset = margin + 3.5 * mm
    c.rect(inset, inset, width - 2 * inset, height - 2 * inset, stroke=1, fill=0)

    # Corner ticks
    tick = 8 * mm
    c.setStrokeColor(GOLD_BRIGHT)
    c.setLineWidth(1.1)
    for x, y, dx, dy in ((inset, inset, tick, 0),
        (inset, inset, 0, tick),
        (width - inset, inset, -tick, 0),
        (width - inset, inset, 0, tick),
        (inset, height - inset, tick, 0),
        (inset, height - inset, 0, -tick),
        (width - inset, height - inset, -tick, 0),
        (width - inset, height - inset, 0, -tick),):
        c.line(x, y, x + dx, y + dy)


def _centered(c: canvas.Canvas, text: str, y: float, font: str, size: float, color: Color, width: float) -> None:
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawCentredString(width / 2, y, text)


def render_certificate_pdf(*,
    holder_name: str,
    certification_level: str,
    verification_code: str,
    issued_at: datetime,
    output_path: Optional[Path] = None,) -> Path:
    """
    Render a landscape A4 Praxis specialisation certificate.
    Returns the absolute path to the written PDF.
    """
    path = output_path or certificate_storage_path(verification_code)
    path.parent.mkdir(parents=True, exist_ok=True)

    width, height = landscape(A4)
    c = canvas.Canvas(str(path), pagesize=landscape(A4))
    c.setTitle(f"Olynixx Praxis, {certification_level}")
    c.setAuthor("Olynixx Praxis")
    c.setSubject("Certificate of Specialisation")

    # Cream ground
    c.setFillColor(CREAM)
    c.rect(0, 0, width, height, stroke=0, fill=1)

    # Soft teal band at top (brand atmosphere, not a card stack)
    c.setFillColor(TEAL_DEEP)
    c.rect(0, height - 28 * mm, width, 28 * mm, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(0, height - 29.2 * mm, width, 1.2 * mm, stroke=0, fill=1)

    _draw_double_frame(c, width, height)

    # Brand in top band
    _centered(c, "OLYNIXX", height - 14 * mm, "Times-Bold", 16, CREAM, width)
    c.setFillColor(GOLD_BRIGHT)
    c.setFont("Helvetica", 9)
    c.drawCentredString(width / 2, height - 21 * mm, "P  R  A  X  I  S")

    # Document title
    _centered(c, "CERTIFICATE OF SPECIALISATION", height - 48 * mm, "Times-Bold", 22, INK, width)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    line_w = 55 * mm
    c.line(width / 2 - line_w / 2, height - 52 * mm, width / 2 + line_w / 2, height - 52 * mm)

    _centered(c,
        "This certifies that",
        height - 64 * mm,
        "Helvetica-Oblique",
        11,
        MUTED,
        width,)

    # Holder name
    name = (holder_name or "Certificate Holder").strip()
    _centered(c, name, height - 78 * mm, "Times-BoldItalic", 28, INK, width)

    _centered(c,
        "has completed the dual-gate pathway and is awarded",
        height - 92 * mm,
        "Helvetica",
        11,
        MUTED,
        width,)

    # Level
    level = certification_level or "Level 1: Human Readiness Coach"
    _centered(c, level, height - 108 * mm, "Times-Bold", 18, TEAL_DEEP, width)

    # Dual-gate note
    _centered(c,
        "Written examination  ·  Practical assessment PASS",
        height - 120 * mm,
        "Helvetica",
        10,
        BRONZE,
        width,)

    # Meta row
    issued = issued_at.astimezone().strftime("%d %B %Y") if issued_at.tzinfo else issued_at.strftime("%d %B %Y")
    meta_y = 42 * mm

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(28 * mm, meta_y + 10 * mm, "ISSUED")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(28 * mm, meta_y, issued)

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawRightString(width - 28 * mm, meta_y + 10 * mm, "VERIFICATION CODE")
    c.setFillColor(OCHRE)
    c.setFont("Courier-Bold", 11)
    c.drawRightString(width - 28 * mm, meta_y, verification_code)

    # Centre seal
    seal_x, seal_y, seal_r = width / 2, 48 * mm, 14 * mm
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.4)
    c.circle(seal_x, seal_y, seal_r, stroke=1, fill=0)
    c.setStrokeColor(BRONZE)
    c.setLineWidth(0.5)
    c.circle(seal_x, seal_y, seal_r - 2.2 * mm, stroke=1, fill=0)
    c.setFillColor(TEAL_DEEP)
    c.setFont("Times-Bold", 9)
    c.drawCentredString(seal_x, seal_y + 1.5 * mm, "OX")
    c.setFillColor(BRONZE)
    c.setFont("Helvetica", 6)
    c.drawCentredString(seal_x, seal_y - 4 * mm, "PRAXIS")

    # Footer
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawCentredString(width / 2,
        18 * mm,
        "Verify authenticity via the Olynixx Praxis certificate verification service  ·  olynixx.com",)
    c.setFillColor(MINT)
    c.setFont("Helvetica", 7)
    c.drawCentredString(width / 2, 13 * mm, "ACTIVE  ·  Dual-gate specialisation")

    c.showPage()
    c.save()
    return path.resolve()


def ensure_certificate_pdf(*,
    holder_name: str,
    certification_level: str,
    verification_code: str,
    issued_at: datetime,
    force: bool = False,) -> Path:
    path = certificate_storage_path(verification_code)
    if path.exists() and not force:
        return path.resolve()
    return render_certificate_pdf(holder_name=holder_name,
        certification_level=certification_level,
        verification_code=verification_code,
        issued_at=issued_at,
        output_path=path,)
