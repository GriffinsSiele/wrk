from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_active_admin, get_current_user
from app.db.models import (
    AgreementType,
    CoachAgreement,
    PracticalAssessment,
    PracticalResult,
    User,
)
from app.db.session import get_db
from app.schemas.compliance import (
    CoachAgreementResponse,
    CoachAgreementSign,
    PracticalAssessmentCreate,
    PracticalAssessmentResponse,
)
from app.services.certification import (
    ensure_mandatory_agreement_rows,
    refresh_placement_eligibility,
    try_issue_certificate,
)

router = APIRouter()


@router.get("/practical-assessments", response_model=List[PracticalAssessmentResponse])
async def list_practical_assessments(
    user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    query = select(PracticalAssessment).order_by(PracticalAssessment.assessed_at.desc())
    if user_id is not None:
        query = query.where(PracticalAssessment.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/practical-assessments/me", response_model=List[PracticalAssessmentResponse])
async def my_practical_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PracticalAssessment)
        .where(PracticalAssessment.user_id == current_user.id)
        .order_by(PracticalAssessment.assessed_at.desc())
    )
    return result.scalars().all()


@router.post("/practical-assessments", response_model=PracticalAssessmentResponse)
async def create_practical_assessment(
    payload: PracticalAssessmentCreate,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    result_value = payload.result.upper()
    if result_value not in ("PASS", "FAIL"):
        raise HTTPException(status_code=400, detail="result must be PASS or FAIL")

    user_result = await db.execute(select(User).where(User.id == payload.user_id))
    if not user_result.scalars().first():
        raise HTTPException(status_code=404, detail="User not found")

    assessment = PracticalAssessment(
        user_id=payload.user_id,
        assessor_id=admin.id,
        certification_level=payload.certification_level,
        checklist_result=payload.checklist_result or {},
        result=PracticalResult(result_value),
        notes=payload.notes,
        assessed_at=datetime.now(timezone.utc),
    )
    db.add(assessment)
    await db.flush()

    cert = None
    if result_value == "PASS":
        cert = await try_issue_certificate(db, payload.user_id, payload.certification_level)

    await db.commit()
    await db.refresh(assessment)
    # Attach issuance hint via response headers is awkward; keep body clean and let cert endpoint show result
    if cert:
        # ensure placement refreshed
        await refresh_placement_eligibility(db, payload.user_id)
        await db.commit()
    return assessment


@router.get("/agreements/me", response_model=List[CoachAgreementResponse])
async def my_agreements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await ensure_mandatory_agreement_rows(db, current_user.id)
    await db.commit()
    result = await db.execute(
        select(CoachAgreement).where(CoachAgreement.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/agreements/me/sign", response_model=CoachAgreementResponse)
async def sign_my_agreement(
    payload: CoachAgreementSign,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        agreement_type = AgreementType(payload.agreement_type.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agreement_type. Use NDA or CODE_OF_CONDUCT.")

    await ensure_mandatory_agreement_rows(db, current_user.id)
    result = await db.execute(
        select(CoachAgreement).where(
            CoachAgreement.user_id == current_user.id,
            CoachAgreement.agreement_type == agreement_type,
        )
    )
    agreement = result.scalars().first()
    if not agreement:
        agreement = CoachAgreement(
            user_id=current_user.id,
            agreement_type=agreement_type,
            version=payload.version,
        )
        db.add(agreement)

    agreement.version = payload.version
    agreement.signed_at = datetime.now(timezone.utc)
    await db.flush()
    await refresh_placement_eligibility(db, current_user.id)
    await db.commit()
    await db.refresh(agreement)
    return agreement


@router.get("/agreements", response_model=List[CoachAgreementResponse])
async def list_agreements(
    user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    query = select(CoachAgreement)
    if user_id is not None:
        query = query.where(CoachAgreement.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/placement/{user_id}")
async def placement_status(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    eligible = await refresh_placement_eligibility(db, user_id)
    await db.commit()
    result = await db.execute(
        select(User)
        .options(selectinload(User.coach_attributes), selectinload(User.coach_agreements))
        .where(User.id == user_id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    attrs = user.coach_attributes
    return {
        "user_id": user_id,
        "placement_eligible": eligible,
        "availability_status": attrs.availability_status if attrs else None,
        "certification_level": attrs.certification_level if attrs else None,
        "agreements": [
            {
                "agreement_type": a.agreement_type.value if hasattr(a.agreement_type, "value") else str(a.agreement_type),
                "signed_at": a.signed_at,
                "version": a.version,
            }
            for a in (user.coach_agreements or [])
        ],
    }
