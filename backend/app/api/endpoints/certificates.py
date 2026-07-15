from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from app.db.session import get_db
from app.db.models import Certificate, User, CertificateStatus
from app.schemas.certificate import CertificateResponse, CertificateVerifyResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=List[CertificateResponse])
async def get_my_certificates(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Certificate).where(Certificate.user_id == current_user.id))
    return result.scalars().all()

@router.get("/verify/{code}", response_model=CertificateVerifyResponse)
async def verify_certificate(code: str, db: AsyncSession = Depends(get_db)):
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
    p = cert.user.profile if cert.user else None
    holder = cert.user.full_name if cert.user and cert.user.full_name else (
        f"{p.first_name} {p.last_name}" if p else "Unknown"
    )
    return CertificateVerifyResponse(
        valid=True,
        holder_name=holder,
        certification_level=cert.certification_level,
        issued_at=cert.issued_at,
        status=status,
    )
