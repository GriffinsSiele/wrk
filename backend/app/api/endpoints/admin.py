from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from app.db.session import get_db
from app.db.models import (AssignmentStatus,
    Certificate,
    CoachAttribute,
    Course,
    Lead,
    LearnerProfile,
    PasswordResetToken,
    Profile,
    Project,
    ProjectAssignment,
    User,
    UserRole,)
from app.schemas.admin import (AdminDashboardResponse,
    AdminPasswordSet,
    AdminUserCreate,
    CoachSnapshot,
    DispatchTrack,
    RoleUpdate,
    StatsResponse,
    TalentMixSegment,
    UserAdminResponse,)
from app.api.deps import get_current_active_admin
from app.core.security import get_password_hash
from app.services.analytics import (count_since,
    period_change,
    sparkline_from_weeks,
    weekly_bucket_counts,)

router = APIRouter()

DEMO_EMAILS = {
    "learner@olynixx.com",
    "coach@olynixx.com",
    "admin@olynixx.com",
    "maya@olynixx.com",
}


async def _build_stats(db: AsyncSession) -> StatsResponse:
    users = (await db.execute(select(User).where(User.deleted_at.is_(None)))).scalars().all()
    courses = (await db.execute(select(Course))).scalars().all()
    projects = (await db.execute(select(Project).where(Project.status == "active"))).scalars().all()
    leads = (await db.execute(select(Lead))).scalars().all()
    certs = (await db.execute(select(Certificate))).scalars().all()
    return StatsResponse(total_users=len(users),
        total_learners=sum(1 for u in users if u.role == UserRole.LEARNER),
        total_coaches=sum(1 for u in users if u.role == UserRole.COACH),
        total_admins=sum(1 for u in users if u.role == UserRole.ADMIN),
        total_courses=len(courses),
        total_active_projects=len(projects),
        total_leads=len(leads),
        total_certificates=len(certs),)


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    return await _build_stats(db)


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    stats = await _build_stats(db)
    now = datetime.now(timezone.utc)
    this_start = now - timedelta(days=7)
    prev_start = now - timedelta(days=14)

    users = (await db.execute(select(User).where(User.deleted_at.is_(None)))).scalars().all()
    coaches = (await db.execute(select(User)
            .options(selectinload(User.profile), selectinload(User.coach_attributes))
            .where(User.role == UserRole.COACH, User.deleted_at.is_(None)))).scalars().all()

    placement_ok = sum(1 for c in coaches if c.coach_attributes and c.coach_attributes.placement_eligible)
    available_only = sum(1
        for c in coaches
        if c.coach_attributes
        and c.coach_attributes.availability_status
        and not c.coach_attributes.placement_eligible)
    blocked = max(0, len(coaches) - placement_ok - available_only)
    pool_health = round((placement_ok / len(coaches)) * 100) if coaches else 0
    cert_rate = (round((stats.total_certificates / stats.total_learners) * 100)
        if stats.total_learners
        else 0)

    assignments = (await db.execute(select(ProjectAssignment))).scalars().all()
    assignment_dates = [a.assigned_at for a in assignments]
    # Throughput = raw assignment volume per week (honest single metric).
    throughput = weekly_bucket_counts(assignment_dates, weeks=8, now=now)

    all_projects = (await db.execute(select(Project).options(selectinload(Project.assignments)))).scalars().all()
    by_type: dict[str, list] = {}
    for p in all_projects:
        key = p.project_type or "General"
        by_type.setdefault(key, []).append(p)

    dispatch: List[DispatchTrack] = []
    for track, plist in sorted(by_type.items(), key=lambda x: -len(x[1]))[:4]:
        active = sum(1 for p in plist if p.status == "active")
        all_asg = [a for p in plist for a in (p.assignments or [])]
        if all_asg:
            completed = sum(1 for a in all_asg if a.status == AssignmentStatus.COMPLETED)
            completion = round((completed / len(all_asg)) * 100)
        else:
            completion = 0
        risk = "Low" if completion >= 75 else "Moderate" if completion >= 55 else ("Watch" if all_asg else "-")
        dispatch.append(DispatchTrack(track=track,
                active=active if active else len([p for p in plist if p.status == "active"]),
                completion=completion,
                risk=risk,))

    recent_coaches: List[CoachSnapshot] = []
    for c in coaches[:6]:
        attrs = c.coach_attributes
        name = c.full_name or (f"{c.profile.first_name} {c.profile.last_name}" if c.profile else c.email)
        recent_coaches.append(CoachSnapshot(name=name,
                emirate=attrs.emirate if attrs else None,
                specialty=attrs.specialty if attrs else None,
                level=attrs.certification_level if attrs else None,
                available=bool(attrs.availability_status) if attrs else False,
                placement=bool(attrs.placement_eligible) if attrs else False,))

    coach_created = [u.created_at for u in users if u.role == UserRole.COACH]
    learner_created = [u.created_at for u in users if u.role == UserRole.LEARNER]
    project_created = [p.created_at for p in all_projects]
    certs = (await db.execute(select(Certificate))).scalars().all()
    cert_issued = [c.issued_at for c in certs]

    spark_coaches = sparkline_from_weeks(coach_created, weeks=6, now=now)
    spark_learners = sparkline_from_weeks(learner_created, weeks=6, now=now)
    spark_projects = sparkline_from_weeks(project_created, weeks=6, now=now)
    spark_certs = sparkline_from_weeks(cert_issued, weeks=6, now=now)

    kpi_changes = {
        "coaches": period_change(count_since(coach_created, this_start, now),
            count_since(coach_created, prev_start, this_start),),
        "learners": period_change(count_since(learner_created, this_start, now),
            count_since(learner_created, prev_start, this_start),),
        "projects": period_change(count_since(project_created, this_start, now),
            count_since(project_created, prev_start, this_start),),
        "certificates": period_change(count_since(cert_issued, this_start, now),
            count_since(cert_issued, prev_start, this_start),),
    }

    # Governance = share of coaches who are placement-eligible (real ratio).
    governance = pool_health

    return AdminDashboardResponse(stats=stats,
        cert_rate=min(100, cert_rate),
        pool_health=pool_health,
        governance_score=governance,
        kpi_changes=kpi_changes,
        throughput=throughput,
        talent_mix=[
            TalentMixSegment(label="Placement OK", value=placement_ok, color_key="accent"),
            TalentMixSegment(label="Available", value=available_only, color_key="blue"),
            TalentMixSegment(label="Blocked", value=blocked, color_key="indigo"),
        ],
        dispatch=dispatch,
        recent_coaches=recent_coaches,
        spark_coaches=spark_coaches,
        spark_learners=spark_learners,
        spark_projects=spark_projects,
        spark_certs=spark_certs,)


@router.get("/users", response_model=List[UserAdminResponse])
async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    result = await db.execute(select(User).options(selectinload(User.profile)).where(User.deleted_at.is_(None)))
    users = result.scalars().all()
    return [
        UserAdminResponse(id=u.id,
            email=u.email,
            role=u.role.value if hasattr(u.role, "value") else str(u.role),
            is_active=bool(u.is_active),
            created_at=u.created_at,
            first_name=u.profile.first_name if u.profile else None,
            last_name=u.profile.last_name if u.profile else None,)
        for u in users
    ]


@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: int,
    update: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),):
    result = await db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        user.role = UserRole(update.role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
    await db.commit()
    return {"message": "Role updated"}


@router.patch("/users/{user_id}/deactivate")
async def deactivate_user(user_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),):
    result = await db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await db.commit()
    return {"message": "User deactivated"}


@router.patch("/users/{user_id}/activate")
async def activate_user(user_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),):
    result = await db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    await db.commit()
    return {"message": "User activated"}


@router.post("/users/{user_id}/soft-delete")
async def soft_delete_user(user_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),):
    """Soft-delete / anonymise user while preserving exam and certificate history."""
    result = await db.execute(select(User).options(selectinload(User.profile)).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    now = datetime.now(timezone.utc)
    user.is_active = False
    user.deleted_at = now
    if hasattr(user, "anonymised_at"):
        user.anonymised_at = now
    user.email = f"anonymised_{user.id}@deleted.local"
    user.full_name = "Anonymised User"
    user.password_hash = "!"  # invalidate login
    if user.profile:
        user.profile.first_name = "Anonymised"
        user.profile.last_name = "User"
        user.profile.phone = None
        user.profile.bio = None
        user.profile.avatar_url = None
    await db.commit()
    return {"message": "User soft-deleted and anonymised. Historical exam/certificate records retained."}


@router.post("/users")
async def create_user(
    payload: AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    """Admin provisioning — create learner/coach/admin with an initial password."""
    if len(payload.password) < 10:
        raise HTTPException(status_code=400, detail="Password must be at least 10 characters")
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists")
    try:
        role = UserRole(payload.role.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
    full_name = f"{payload.first_name} {payload.last_name}".strip()
    user = User(
        email=payload.email.lower().strip(),
        password_hash=get_password_hash(payload.password),
        role=role,
        full_name=full_name,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    db.add(Profile(user_id=user.id, first_name=payload.first_name, last_name=payload.last_name))
    if role == UserRole.LEARNER:
        db.add(LearnerProfile(user_id=user.id, progress_percentage=0))
    if role == UserRole.COACH:
        db.add(
            CoachAttribute(
                user_id=user.id,
                certification_level="Level 1",
                placement_eligible=False,
                cec_credits=0,
                cec_status="Current",
                availability_status=True,
            )
        )
    await db.commit()
    await db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "message": "User created",
    }


@router.post("/users/{user_id}/set-password")
async def admin_set_password(
    user_id: int,
    payload: AdminPasswordSet,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    if len(payload.password) < 10:
        raise HTTPException(status_code=400, detail="Password must be at least 10 characters")
    result = await db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = get_password_hash(payload.password)
    await db.commit()
    return {"message": "Password updated"}


@router.post("/users/purge-demo")
async def purge_demo_accounts(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    """Disable and soft-delete known demo accounts before launch. Never deletes the calling admin."""
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.email.in_(DEMO_EMAILS), User.deleted_at.is_(None))
    )
    purged = []
    now = datetime.now(timezone.utc)
    for user in result.scalars().all():
        if user.id == admin.id:
            continue
        user.is_active = False
        user.deleted_at = now
        user.anonymised_at = now
        purged.append(user.email)
        user.email = f"anonymised_{user.id}@deleted.local"
        user.full_name = "Anonymised User"
        user.password_hash = "!"
        if user.profile:
            user.profile.first_name = "Anonymised"
            user.profile.last_name = "User"
    await db.commit()
    return {"message": "Demo accounts purged", "purged": purged}
