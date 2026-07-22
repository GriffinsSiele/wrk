from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timezone
from app.db.session import get_db
from app.db.models import User, UserRole, CoachAttribute, ProjectAssignment, AssignmentStatus, Project
from app.schemas.coach import CoachResponse, CoachAttributeBase
from app.schemas.project import AssignmentResponse, AssignmentStatusUpdate
from app.schemas.admin import CoachDashboardResponse, SeriesPoint, TalentMixSegment
from app.api.deps import get_current_user, get_current_active_admin
from app.services.certification import ensure_mandatory_agreement_rows, refresh_placement_eligibility
from app.services.analytics import weekly_bucket_counts, sparkline_from_weeks, checklist_score

router = APIRouter()

@router.get("/", response_model=List[CoachResponse])
async def get_coaches(
    emirate: Optional[str] = None,
    availability: Optional[bool] = None,
    specialty: Optional[str] = None,
    placement_eligible: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile), selectinload(User.coach_attributes))
        .where(User.role == UserRole.COACH, User.deleted_at.is_(None))
    )
    coaches = result.scalars().all()
    if emirate:
        coaches = [c for c in coaches if c.coach_attributes and c.coach_attributes.emirate == emirate]
    if availability is not None:
        coaches = [c for c in coaches if c.coach_attributes and c.coach_attributes.availability_status == availability]
    if specialty:
        coaches = [c for c in coaches if c.coach_attributes and c.coach_attributes.specialty == specialty]
    if placement_eligible is not None:
        coaches = [
            c for c in coaches
            if c.coach_attributes and c.coach_attributes.placement_eligible == placement_eligible
        ]
    return coaches

@router.patch("/me/profile")
async def update_coach_profile(updates: CoachAttributeBase, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CoachAttribute).where(CoachAttribute.user_id == current_user.id))
    attrs = result.scalars().first()
    if not attrs:
        raise HTTPException(status_code=404, detail="Coach profile not found")
    # Placement is server-computed; strip so coaches cannot self-grant it.
    data = updates.model_dump(exclude_none=True)
    data.pop("placement_eligible", None)
    for field, value in data.items():
        setattr(attrs, field, value)
    await refresh_placement_eligibility(db, current_user.id)
    await db.commit()
    return {"message": "Coach profile updated"}

@router.get("/me/dashboard", response_model=CoachDashboardResponse)
async def coach_dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ensure_mandatory_agreement_rows(db, current_user.id)
    await refresh_placement_eligibility(db, current_user.id)
    await db.commit()

    result = await db.execute(
        select(User)
        .options(
            selectinload(User.profile),
            selectinload(User.coach_attributes),
            selectinload(User.coach_agreements),
        )
        .where(User.id == current_user.id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    attrs = user.coach_attributes
    profile = user.profile
    first_name = profile.first_name if profile else (user.full_name or "Coach").split()[0]

    board = []
    assignment_rows = []
    if attrs:
        rows = (
            await db.execute(
                select(ProjectAssignment, Project)
                .join(Project, Project.id == ProjectAssignment.project_id)
                .where(ProjectAssignment.coach_id == attrs.id)
            )
        ).all()
        assignment_rows = [assignment for assignment, _project in rows]
        board = [
            {
                "id": assignment.id,
                "project_title": project.title,
                "project_type": project.project_type,
                "client_name": project.client_name,
                "status": assignment.status.value if hasattr(assignment.status, "value") else str(assignment.status),
                "notes": assignment.notes,
            }
            for assignment, project in rows
        ]

    pending = [b for b in board if b["status"] in ("pending", "offered")]
    accepted = [b for b in board if b["status"] == "accepted"]
    completed = [b for b in board if b["status"] == "completed"]
    declined = [b for b in board if b["status"] == "declined"]
    active_assignments = pending + accepted
    # Utilisation = accepted share of actionable assignments (0 if none).
    actionable = len(accepted) + len(declined) + len(pending)
    utilisation = round((len(accepted) / actionable) * 100) if actionable else 0

    agreements = user.coach_agreements or []
    signed_types = {
        (a.agreement_type.value if hasattr(a.agreement_type, "value") else str(a.agreement_type))
        for a in agreements
        if a.signed_at
    }
    has_nda = "NDA" in signed_types
    has_coc = "CODE_OF_CONDUCT" in signed_types
    has_cert = bool(attrs and attrs.certification_level)
    available = bool(attrs and attrs.availability_status)
    placement_score = checklist_score([has_cert, has_nda, has_coc, available])
    placement_eligible = bool(attrs.placement_eligible) if attrs else False

    # Weekly completed assignments (honest throughput).
    completed_dates = [
        a.responded_at or a.assigned_at
        for a in assignment_rows
        if a.status == AssignmentStatus.COMPLETED
    ]
    throughput = weekly_bucket_counts(completed_dates, weeks=5)
    # If fewer labels desired for bar chart, keep weekly series as-is with W1..W5
    throughput_bars = [
        SeriesPoint(label=p.label, value=p.value) for p in throughput
    ]

    delivery_mix = [
        TalentMixSegment(label="Pending", value=len(pending), color_key="accent"),
        TalentMixSegment(label="Accepted", value=len(accepted), color_key="blue"),
        TalentMixSegment(label="Completed", value=len(completed), color_key="indigo"),
        TalentMixSegment(label="Declined", value=len(declined), color_key="muted"),
    ]

    placement_spark = sparkline_from_weeks(
        [a.assigned_at for a in assignment_rows],
        weeks=6,
    )

    return CoachDashboardResponse(
        first_name=first_name,
        utilisation=utilisation,
        placement_score=placement_score,
        placement_eligible=placement_eligible,
        nps=None,
        certification_level=attrs.certification_level if attrs else None,
        cec_credits=attrs.cec_credits if attrs else 0,
        cec_status=attrs.cec_status if attrs else None,
        pending_count=len(pending),
        active_count=len(active_assignments),
        accepted_count=len(accepted),
        completed_count=len(completed),
        declined_count=len(declined),
        active_assignments=active_assignments,
        active_assignment=active_assignments[0] if active_assignments else None,
        throughput=throughput_bars,
        delivery_mix=delivery_mix,
        nps_spark=[],
        placement_spark=placement_spark,
        throughput_values=[p.value for p in throughput_bars],
    )

@router.get("/me/profile")
async def get_my_coach_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ensure_mandatory_agreement_rows(db, current_user.id)
    await refresh_placement_eligibility(db, current_user.id)
    await db.commit()
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile), selectinload(User.coach_attributes))
        .where(User.id == current_user.id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    attrs = user.coach_attributes
    profile = user.profile
    return {
        "id": user.id,
        "email": user.email,
        "first_name": profile.first_name if profile else None,
        "last_name": profile.last_name if profile else None,
        "bio": profile.bio if profile else None,
        "phone": profile.phone if profile else None,
        "avatar_url": profile.avatar_url if profile else None,
        "coach_attributes": {
            "specialty": attrs.specialty if attrs else None,
            "focus_area": attrs.focus_area if attrs else None,
            "emirate": attrs.emirate if attrs else None,
            "languages": attrs.languages if attrs else [],
            "availability_status": attrs.availability_status if attrs else None,
            "travel_willingness": attrs.travel_willingness if attrs else None,
            "certification_level": attrs.certification_level if attrs else None,
            "placement_eligible": attrs.placement_eligible if attrs else False,
            "cec_credits": attrs.cec_credits if attrs else 0,
            "cec_status": attrs.cec_status if attrs else None,
        },
    }

@router.patch("/me/availability")
async def toggle_availability(available: bool, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CoachAttribute).where(CoachAttribute.user_id == current_user.id))
    attrs = result.scalars().first()
    if not attrs:
        raise HTTPException(status_code=404, detail="Coach profile not found")
    attrs.availability_status = available
    await refresh_placement_eligibility(db, current_user.id)
    await db.commit()
    return {"available": available, "placement_eligible": attrs.placement_eligible}

@router.get("/assignments", response_model=List[AssignmentResponse])
async def get_my_assignments(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    ca_result = await db.execute(select(CoachAttribute).where(CoachAttribute.user_id == current_user.id))
    attrs = ca_result.scalars().first()
    if not attrs:
        return []
    result = await db.execute(select(ProjectAssignment).where(ProjectAssignment.coach_id == attrs.id))
    return result.scalars().all()

@router.get("/assignments/board")
async def get_my_assignment_board(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    ca_result = await db.execute(select(CoachAttribute).where(CoachAttribute.user_id == current_user.id))
    attrs = ca_result.scalars().first()
    if not attrs:
        return []
    result = await db.execute(
        select(ProjectAssignment, Project)
        .join(Project, Project.id == ProjectAssignment.project_id)
        .where(ProjectAssignment.coach_id == attrs.id)
    )
    rows = result.all()
    return [
        {
            "id": assignment.id,
            "project_id": assignment.project_id,
            "project_title": project.title,
            "project_type": project.project_type,
            "client_name": project.client_name,
            "status": assignment.status.value if hasattr(assignment.status, "value") else str(assignment.status),
            "notes": assignment.notes,
            "assigned_at": assignment.assigned_at,
            "responded_at": assignment.responded_at,
        }
        for assignment, project in rows
    ]

@router.patch("/assignments/{assignment_id}")
async def respond_to_assignment(assignment_id: int, update: AssignmentStatusUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    ca_result = await db.execute(select(CoachAttribute).where(CoachAttribute.user_id == current_user.id))
    attrs = ca_result.scalars().first()
    result = await db.execute(select(ProjectAssignment).where(ProjectAssignment.id == assignment_id, ProjectAssignment.coach_id == attrs.id))
    assignment = result.scalars().first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    status_value = update.status.lower()
    # Legacy client status name → current enum value.
    if status_value == "offered":
        status_value = "pending"
    try:
        assignment.status = AssignmentStatus(status_value)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {update.status}")
    assignment.responded_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": status_value}
