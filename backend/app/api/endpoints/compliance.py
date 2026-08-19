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
    PracticalChecklistTemplate,
    PracticalResult,
    User,
)
from app.db.session import get_db
from app.schemas.compliance import (
    CoachAgreementResponse,
    CoachAgreementSign,
    PracticalAssessmentCreate,
    PracticalAssessmentResponse,
    PracticalChecklistTemplateCreate,
    PracticalChecklistTemplateResponse,
    PracticalChecklistTemplateUpdate,
)
from app.services.certification import (
    ensure_mandatory_agreement_rows,
    refresh_placement_eligibility,
    try_issue_certificate,
)

router = APIRouter()


def _evaluate_practical_result(
    template: Optional[PracticalChecklistTemplate],
    checklist_result: dict,
    requested: str,
) -> str:
    """If template has criteria, derive PASS/FAIL; otherwise honour admin requested result."""
    result_value = requested.upper()
    if result_value not in ("PASS", "FAIL"):
        raise HTTPException(status_code=400, detail="result must be PASS or FAIL")
    if not template or not template.items:
        return result_value
    items = template.items if isinstance(template.items, list) else []
    required_keys = [i.get("key") for i in items if isinstance(i, dict) and i.get("required", True) and i.get("key")]
    checked = sum(1 for k in required_keys if checklist_result.get(k))
    if template.min_required_pass is not None:
        auto_pass = checked >= int(template.min_required_pass)
    else:
        auto_pass = checked >= len(required_keys) and len(required_keys) > 0
    return "PASS" if auto_pass else "FAIL"


@router.get("/checklist-templates", response_model=List[PracticalChecklistTemplateResponse])
async def list_checklist_templates(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    rows = (
        await db.execute(select(PracticalChecklistTemplate).order_by(PracticalChecklistTemplate.id))
    ).scalars().all()
    return rows


@router.get("/checklist-templates/active", response_model=Optional[PracticalChecklistTemplateResponse])
async def get_active_checklist_template(
    certification_level: str = "Level 1",
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    result = await db.execute(
        select(PracticalChecklistTemplate)
        .where(
            PracticalChecklistTemplate.is_active.is_(True),
            PracticalChecklistTemplate.certification_level == certification_level,
        )
        .order_by(PracticalChecklistTemplate.id.desc())
    )
    return result.scalars().first()


@router.post("/checklist-templates", response_model=PracticalChecklistTemplateResponse)
async def create_checklist_template(
    payload: PracticalChecklistTemplateCreate,
    _: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Checklist must include at least one item")
    tpl = PracticalChecklistTemplate(
        name=payload.name,
        certification_level=payload.certification_level,
        is_active=payload.is_active,
        items=[i.model_dump() for i in payload.items],
        min_required_pass=payload.min_required_pass,
        version=1,
    )
    db.add(tpl)
    await db.commit()
    await db.refresh(tpl)
    return tpl


@router.patch("/checklist-templates/{template_id}", response_model=PracticalChecklistTemplateResponse)
async def update_checklist_template(
    template_id: int,
    payload: PracticalChecklistTemplateUpdate,
    _: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PracticalChecklistTemplate).where(PracticalChecklistTemplate.id == template_id))
    tpl = result.scalars().first()
    if not tpl:
        raise HTTPException(status_code=404, detail="Checklist template not found")
    data = payload.model_dump(exclude_none=True)
    if "items" in data and data["items"] is not None:
        data["items"] = [i if isinstance(i, dict) else i for i in data["items"]]
    criteria_changed = False
    if "items" in data and data["items"] != (tpl.items or []):
        criteria_changed = True
    if "min_required_pass" in data and data["min_required_pass"] != tpl.min_required_pass:
        criteria_changed = True
    for field, value in data.items():
        setattr(tpl, field, value)
    if criteria_changed:
        tpl.version = int(tpl.version or 1) + 1
    tpl.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(tpl)
    return tpl


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
    user_result = await db.execute(select(User).where(User.id == payload.user_id))
    if not user_result.scalars().first():
        raise HTTPException(status_code=404, detail="User not found")

    template = None
    if payload.template_id:
        tpl_result = await db.execute(
            select(PracticalChecklistTemplate).where(PracticalChecklistTemplate.id == payload.template_id)
        )
        template = tpl_result.scalars().first()
    else:
        tpl_result = await db.execute(
            select(PracticalChecklistTemplate)
            .where(
                PracticalChecklistTemplate.is_active.is_(True),
                PracticalChecklistTemplate.certification_level == payload.certification_level,
            )
            .order_by(PracticalChecklistTemplate.id.desc())
        )
        template = tpl_result.scalars().first()

    checklist = payload.checklist_result or {}
    result_value = _evaluate_practical_result(template, checklist, payload.result)
    snapshot = None
    if template:
        snapshot = {
            "id": template.id,
            "name": template.name,
            "version": int(template.version or 1),
            "certification_level": template.certification_level,
            "items": template.items,
            "min_required_pass": template.min_required_pass,
        }

    assessment = PracticalAssessment(
        user_id=payload.user_id,
        assessor_id=admin.id,
        certification_level=payload.certification_level,
        checklist_result=checklist,
        result=PracticalResult(result_value),
        notes=payload.notes,
        assessed_at=datetime.now(timezone.utc),
        template_id=template.id if template else None,
        template_version=int(template.version or 1) if template else None,
        template_snapshot=snapshot,
    )
    db.add(assessment)
    await db.flush()

    # Mirror of exam-approve: either gate finishing second can issue the certificate.
    cert = None
    if result_value == "PASS":
        cert = await try_issue_certificate(db, payload.user_id, payload.certification_level)

    await db.commit()
    await db.refresh(assessment)
    if cert:
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
