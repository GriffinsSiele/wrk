"""Dual-gate certification.

A certificate is issued only when both gates are complete for the same level:
1. Written exam passed and admin-approved (`ExamAttempt.approved_at`).
2. Practical assessment recorded as PASS.

Placement eligibility is computed separately: active certificate + signed NDA
and Code of Conduct + availability. Coaches cannot self-grant placement.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import (AgreementType,
    Certificate,
    CertificateStatus,
    CoachAgreement,
    CoachAttribute,
    ExamAttempt,
    PracticalAssessment,
    PracticalResult,
    User,
    UserRole,)
from app.services.certificate_pdf import ensure_certificate_pdf
from sqlalchemy.orm import selectinload

LEVEL_ORDER = {
    "level 1": 1,
    "l1": 1,
    "human readiness": 1,
    "level 2": 2,
    "l2": 2,
    "recovery": 2,
    "recovery intelligence": 2,  # legacy label
    "level 3": 3,
    "l3": 3,
    "performance intelligence": 3,
    "performance systems": 3,  # legacy label
}

MANDATORY_AGREEMENTS = (AgreementType.NDA, AgreementType.CODE_OF_CONDUCT)


def normalize_level(level: Optional[str]) -> int:
    # Substring match so "Level 1: Human Readiness Coach" and "L1" both map.
    if not level:
        return 0
    key = level.strip().lower()
    for token, value in LEVEL_ORDER.items():
        if token in key:
            return value
    return 0


def level_label(level_num: int) -> str:
    return {
        1: "Level 1: Human Readiness Coach",
        2: "Level 2: Recovery Coach",
        3: "Level 3: Performance Intelligence Coach",
    }.get(level_num, f"Level {level_num}")


async def get_active_certificate_level(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(select(Certificate).where(Certificate.user_id == user_id,
            Certificate.status == CertificateStatus.ACTIVE,))
    certs = result.scalars().all()
    return max((normalize_level(c.certification_level) for c in certs), default=0)


async def has_passed_written(db: AsyncSession, user_id: int, level: str) -> Tuple[bool, Optional[ExamAttempt]]:
    """Scored pass + admin approval. Level arg unused until multi-level written banks ship."""
    _ = normalize_level(level)  # reserved for future level-scoped attempts
    result = await db.execute(select(ExamAttempt).where(ExamAttempt.user_id == user_id,
            ExamAttempt.passed.is_(True),
            ExamAttempt.approved_at.isnot(None),).order_by(ExamAttempt.submitted_at.desc()))
    attempt = result.scalars().first()
    return (True, attempt) if attempt else (False, None)


async def has_passed_practical(db: AsyncSession, user_id: int, level: str) -> Tuple[bool, Optional[PracticalAssessment]]:
    target = normalize_level(level)
    result = await db.execute(select(PracticalAssessment)
        .where(PracticalAssessment.user_id == user_id,
            PracticalAssessment.result == PracticalResult.PASS,)
        .order_by(PracticalAssessment.assessed_at.desc()))
    assessments = result.scalars().all()
    for assessment in assessments:
        # Level 0 = unset/legacy rows; treat as L1 so older seed data still qualifies.
        if normalize_level(assessment.certification_level) == target or (target <= 1 and normalize_level(assessment.certification_level) in (0, 1)):
            return True, assessment
    return False, None


async def prerequisite_satisfied(db: AsyncSession, user_id: int, target_level: str) -> bool:
    """L2+ needs an active cert at the previous level (not just a prior attempt)."""
    target = normalize_level(target_level)
    if target <= 1:
        return True
    active = await get_active_certificate_level(db, user_id)
    return active >= (target - 1)


async def agreements_fully_signed(db: AsyncSession, user_id: int) -> bool:
    result = await db.execute(select(CoachAgreement).where(CoachAgreement.user_id == user_id,
            CoachAgreement.signed_at.is_not(None),))
    signed = {a.agreement_type for a in result.scalars().all()}
    return all(req in signed for req in MANDATORY_AGREEMENTS)


async def refresh_placement_eligibility(db: AsyncSession, user_id: int) -> bool:
    """Eligible only if: active cert + NDA & CoC signed + availability open."""
    ca_result = await db.execute(select(CoachAttribute).where(CoachAttribute.user_id == user_id))
    attrs = ca_result.scalars().first()
    if not attrs:
        return False
    has_active_cert = await get_active_certificate_level(db, user_id) >= 1
    signed = await agreements_fully_signed(db, user_id)
    attrs.placement_eligible = bool(has_active_cert and signed and attrs.availability_status)
    await db.flush()
    return attrs.placement_eligible


def _holder_name(user: Optional[User]) -> str:
    if not user:
        return "Certificate Holder"
    if user.full_name:
        return user.full_name
    p = user.profile
    if p and (p.first_name or p.last_name):
        return f"{p.first_name or ''} {p.last_name or ''}".strip()
    return user.email or "Certificate Holder"


async def try_issue_certificate(db: AsyncSession,
    user_id: int,
    certification_level: str = "Level 1",) -> Optional[Certificate]:
    """Dual-gate: written pass + practical PASS. Admin approve is handled by the exam endpoint."""
    if not await prerequisite_satisfied(db, user_id, certification_level):
        return None

    written_ok, attempt = await has_passed_written(db, user_id, certification_level)
    practical_ok, practical = await has_passed_practical(db, user_id, certification_level)
    if not (written_ok and practical_ok and attempt and practical):
        return None

    # Reuse existing active cert at this level; only backfill PDF if missing.
    existing_level = await get_active_certificate_level(db, user_id)
    target = normalize_level(certification_level)
    if existing_level >= target:
        result = await db.execute(select(Certificate)
            .options(selectinload(Certificate.user).selectinload(User.profile))
            .where(Certificate.user_id == user_id,
                Certificate.status == CertificateStatus.ACTIVE,))
        for cert in result.scalars().all():
            if normalize_level(cert.certification_level) == target:
                if not cert.pdf_url:
                    ensure_certificate_pdf(holder_name=_holder_name(cert.user),
                        certification_level=cert.certification_level,
                        verification_code=cert.verification_code,
                        issued_at=cert.issued_at or datetime.now(timezone.utc),)
                    cert.pdf_url = f"/api/certificates/{cert.id}/pdf"
                    await db.flush()
                return cert

    user_result = await db.execute(select(User).options(selectinload(User.profile)).where(User.id == user_id))
    user = user_result.scalars().first()
    if not user:
        return None

    code = str(uuid.uuid4()).replace("-", "")[:16].upper()
    level_text = level_label(target) if target else certification_level
    cert = Certificate(user_id=user_id,
        attempt_id=attempt.id,
        practical_assessment_id=practical.id,
        verification_code=code,
        certification_level=level_text,
        status=CertificateStatus.ACTIVE,
        issued_at=datetime.now(timezone.utc),)
    db.add(cert)

    # Dual-gate success places the specialist in the coach pool.
    if user.role == UserRole.LEARNER:
        user.role = UserRole.COACH

    ca_result = await db.execute(select(CoachAttribute).where(CoachAttribute.user_id == user_id))
    attrs = ca_result.scalars().first()
    if not attrs:
        attrs = CoachAttribute(user_id=user_id,
            certification_level=f"Level {target or 1}",
            placement_eligible=False,
            cec_credits=0,
            cec_status="Current",)
        db.add(attrs)
    else:
        attrs.certification_level = f"Level {target or 1}"

    await db.flush()

    ensure_certificate_pdf(holder_name=_holder_name(user),
        certification_level=cert.certification_level,
        verification_code=cert.verification_code,
        issued_at=cert.issued_at or datetime.now(timezone.utc),)
    cert.pdf_url = f"/api/certificates/{cert.id}/pdf"
    await db.flush()

    await refresh_placement_eligibility(db, user_id)
    return cert


async def ensure_mandatory_agreement_rows(db: AsyncSession, user_id: int) -> None:
    result = await db.execute(select(CoachAgreement).where(CoachAgreement.user_id == user_id))
    existing = {a.agreement_type for a in result.scalars().all()}
    for agreement_type in MANDATORY_AGREEMENTS:
        if agreement_type not in existing:
            db.add(CoachAgreement(user_id=user_id,
                    agreement_type=agreement_type,
                    version="1.0",
                    signed_at=None,))
    await db.flush()
