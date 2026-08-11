from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timezone

from app.db.session import get_db
from app.db.models import Certificate, User, CertificateStatus
from app.schemas.certificate import CertificateResponse, CertificateVerifyResponse
from app.api.deps import get_current_user, get_current_active_admin
from app.services.certificate_pdf import ensure_certificate_pdf

router = APIRouter()


def _holder_name(user: Optional[User]) -> str:
    if not user:
        return "Certificate Holder"
    if user.full_name:
        return user.full_name
    p = user.profile
    if p and (p.first_name or p.last_name):
        return f"{p.first_name or ''} {p.last_name or ''}".strip()
    return user.email or "Certificate Holder"


def _with_pdf_url(cert: Certificate) -> Certificate:
    """Ensure API clients always receive a downloadable PDF route."""
    if not cert.pdf_url:
        cert.pdf_url = f"/api/certificates/{cert.id}/pdf"
    return cert


@router.get("/me", response_model=List[CertificateResponse])
async def get_my_certificates(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Certificate).where(Certificate.user_id == current_user.id))
    return [_with_pdf_url(c) for c in result.scalars().all()]


@router.get("/{certificate_id}/pdf")
async def download_certificate_pdf(
    certificate_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Certificate)
        .options(selectinload(Certificate.user).selectinload(User.profile))
        .where(Certificate.id == certificate_id)
    )
    cert = result.scalars().first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    is_owner = cert.user_id == current_user.id
    role = getattr(current_user.role, "value", str(current_user.role)).lower()
    is_admin = role == "admin"
    # PDF download: owner or admin only.
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="Not authorised to download this certificate")

    path = ensure_certificate_pdf(
        holder_name=_holder_name(cert.user),
        certification_level=cert.certification_level,
        verification_code=cert.verification_code,
        issued_at=cert.issued_at or datetime.now(timezone.utc),
    )
    if not cert.pdf_url:
        cert.pdf_url = f"/api/certificates/{cert.id}/pdf"
        await db.commit()

    filename = f"olynixx-praxis-{cert.verification_code}.pdf"
    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=filename,
        content_disposition_type="inline",
    )


@router.post("/{certificate_id}/regenerate-pdf")
async def regenerate_certificate_pdf(
    certificate_id: int,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    # Admin-only; force=True rewrites on-disk PDF (template version bumps need this).
    _ = admin
    result = await db.execute(
        select(Certificate)
        .options(selectinload(Certificate.user).selectinload(User.profile))
        .where(Certificate.id == certificate_id)
    )
    cert = result.scalars().first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    path = ensure_certificate_pdf(
        holder_name=_holder_name(cert.user),
        certification_level=cert.certification_level,
        verification_code=cert.verification_code,
        issued_at=cert.issued_at or datetime.now(timezone.utc),
        force=True,
    )
    cert.pdf_url = f"/api/certificates/{cert.id}/pdf"
    await db.commit()
    return {"message": "PDF regenerated", "pdf_url": cert.pdf_url, "path": str(path)}


@router.get("/verify/{code}", response_model=CertificateVerifyResponse)
async def verify_certificate(code: str, db: AsyncSession = Depends(get_db)):
    """Public verification — no auth. Inactive certs return valid=False without holder name."""
    result = await db.execute(
        select(Certificate)
        .options(selectinload(Certificate.user).selectinload(User.profile))
        .where(Certificate.verification_code == code)
    )
    cert = result.scalars().first()
    if not cert:
        return CertificateVerifyResponse(valid=False)
    status = cert.status.value if hasattr(cert.status, "value") else str(cert.status)
    if status != CertificateStatus.ACTIVE.value:
        return CertificateVerifyResponse(
            valid=False,
            holder_name=None,
            certification_level=cert.certification_level,
            issued_at=cert.issued_at,
            status=status,
        )
    return CertificateVerifyResponse(
        valid=True,
        holder_name=_holder_name(cert.user),
        certification_level=cert.certification_level,
        issued_at=cert.issued_at,
        status=status,
    )
