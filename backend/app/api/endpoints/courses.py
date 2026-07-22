from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, timezone
from app.db.session import get_db
from app.db.models import (
    Certificate,
    Course,
    CourseEnrollment,
    ExamAttempt,
    ExamRegistration,
    ExamStatus,
    Lesson,
    LessonProgress,
    Module,
    PracticalAssessment,
    PracticalResult,
    User,
)
from app.schemas.course import CourseListResponse, CourseCreate, ProgressUpdate
from app.schemas.admin import LearnerCourseSummary, LearnerDashboardResponse, TalentMixSegment
from app.api.deps import get_current_user, get_current_active_admin
from app.services.analytics import daily_bucket_counts, checklist_score

router = APIRouter()


def _course_lessons(course: Course | None) -> list:
    if not course:
        return []
    return [lesson for mod in (course.modules or []) for lesson in (mod.lessons or [])]


def _next_module_title(course: Course | None, completed_ids: set[int]) -> str | None:
    if not course or not course.modules:
        return None
    for mod in sorted(course.modules, key=lambda m: m.order):
        if any(l.id not in completed_ids for l in mod.lessons):
            return mod.title
    return course.modules[-1].title if course.modules else None


def _progress_for_course(course: Course | None, completed_ids: set[int]) -> tuple[int, int, int]:
    """% complete = lessons finished in this course / lessons in this course."""
    lessons = _course_lessons(course)
    total = len(lessons)
    if total == 0:
        return 0, 0, 0
    # completed_ids may include other courses; intersection with this course's lessons filters them.
    completed = sum(1 for lesson in lessons if lesson.id in completed_ids)
    return round((completed / total) * 100), completed, total


async def _sync_enrollment_progress(
    db: AsyncSession, user_id: int, course_id: int, completed_ids: set[int] | None = None
) -> int:
    """Persist live lesson-derived % onto the enrollment row."""
    result = await db.execute(
        select(CourseEnrollment)
        .options(
            selectinload(CourseEnrollment.course)
            .selectinload(Course.modules)
            .selectinload(Module.lessons)
        )
        .where(CourseEnrollment.user_id == user_id, CourseEnrollment.course_id == course_id)
    )
    enrollment = result.scalars().first()
    if not enrollment or not enrollment.course:
        return 0

    if completed_ids is None:
        progress_rows = (
            await db.execute(
                select(LessonProgress).where(
                    LessonProgress.user_id == user_id,
                    LessonProgress.completed == True,
                )
            )
        ).scalars().all()
        completed_ids = {p.lesson_id for p in progress_rows}

    pct, _, _ = _progress_for_course(enrollment.course, completed_ids)
    enrollment.progress = pct
    enrollment.status = "completed" if pct >= 100 else "active"
    return pct


@router.get("/", response_model=List[CourseListResponse])
async def list_courses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.is_published == True))
    return result.scalars().all()


@router.get("/all", response_model=List[CourseListResponse])
async def list_all_courses(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    result = await db.execute(select(Course))
    return result.scalars().all()


@router.get("/my/dashboard", response_model=LearnerDashboardResponse)
async def learner_dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = (
        await db.execute(select(User).options(selectinload(User.profile)).where(User.id == current_user.id))
    ).scalars().first()
    first_name = (
        profile.profile.first_name
        if profile and profile.profile
        else (current_user.full_name or "Learner").split()[0]
    )

    enrollments = (
        await db.execute(
            select(CourseEnrollment)
            .options(
                selectinload(CourseEnrollment.course)
                .selectinload(Course.modules)
                .selectinload(Module.lessons)
            )
            .where(CourseEnrollment.user_id == current_user.id)
        )
    ).scalars().all()

    progress_rows = (
        await db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == current_user.id,
                LessonProgress.completed == True,
            )
        )
    ).scalars().all()
    completed_ids = {p.lesson_id for p in progress_rows}

    course_summaries: list[LearnerCourseSummary] = []
    dirty = False
    for enrollment in enrollments:
        course = enrollment.course
        if not course:
            continue
        pct, completed, total = _progress_for_course(course, completed_ids)
        if enrollment.progress != pct:
            enrollment.progress = pct
            enrollment.status = "completed" if pct >= 100 else "active"
            dirty = True
        course_summaries.append(
            LearnerCourseSummary(
                course_id=course.id,
                title=course.title,
                description=course.description,
                progress=pct,
                lessons_completed=completed,
                lessons_total=total,
                status=enrollment.status or ("completed" if pct >= 100 else "active"),
                next_module=_next_module_title(course, completed_ids),
            )
        )
    if dirty:
        await db.commit()

    # Dashboard KPIs use the first enrollment; `courses[]` carries the full list.
    primary = course_summaries[0] if course_summaries else None
    course_progress = primary.progress if primary else 0
    lessons_completed = primary.lessons_completed if primary else 0
    lessons_total = primary.lessons_total if primary else 0
    next_module = primary.next_module if primary else None

    attempts = (
        await db.execute(select(ExamAttempt).where(ExamAttempt.user_id == current_user.id))
    ).scalars().all()
    # UI gate requires admin approval; cert issuance itself only checks passed + practical.
    written_passed = any(a.passed and a.approved_at for a in attempts)
    scores = [a.score for a in attempts if a.score is not None]
    assessment_avg = round(sum(scores) / len(scores)) if scores else None
    assessment_best = max(scores) if scores else None

    practicals = (
        await db.execute(select(PracticalAssessment).where(PracticalAssessment.user_id == current_user.id))
    ).scalars().all()
    has_practical_pass = any(p.result == PracticalResult.PASS for p in practicals)

    certs = (await db.execute(select(Certificate).where(Certificate.user_id == current_user.id))).scalars().all()
    has_certificate = len(certs) > 0

    regs = (
        await db.execute(select(ExamRegistration).where(ExamRegistration.user_id == current_user.id))
    ).scalars().all()
    has_exam_booking = any(r.status == ExamStatus.BOOKED for r in regs) or written_passed

    # Dual-gate ladder: study → written approved → practical PASS → certificate.
    studied = course_progress > 0 or lessons_completed > 0
    gate_flags = [studied, written_passed, has_practical_pass, has_certificate]
    gate_progress = checklist_score(gate_flags)
    if has_certificate or has_practical_pass:
        gate_step = 4
    elif written_passed:
        gate_step = 3
    elif studied:
        gate_step = 2
    else:
        gate_step = 1
    readiness = course_progress  # donut = course progress only

    weekly = daily_bucket_counts(
        [p.completed_at for p in progress_rows],
        days=6,
    )

    # Honest activity mix (no content-type tagging yet).
    focus_mix = [
        TalentMixSegment(label="Lessons", value=len(progress_rows), color_key="accent"),
        TalentMixSegment(label="Exams", value=len(attempts), color_key="blue"),
        TalentMixSegment(label="Practical", value=len(practicals), color_key="indigo"),
    ]

    return LearnerDashboardResponse(
        first_name=first_name,
        course_title=primary.title if primary else None,
        course_id=primary.course_id if primary else None,
        course_progress=course_progress,
        lessons_completed=lessons_completed,
        lessons_total=lessons_total,
        readiness=readiness,
        gate_progress=gate_progress,
        gate_step=gate_step,
        weekly_learning=weekly,
        focus_mix=focus_mix,
        assessment_avg=assessment_avg,
        assessment_best=assessment_best,
        next_module=next_module,
        has_exam_booking=has_exam_booking,
        has_practical_pass=has_practical_pass,
        has_certificate=has_certificate,
        written_passed=written_passed,
        courses=course_summaries,
    )


@router.get("/my/enrollments")
async def my_enrollments(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CourseEnrollment)
        .options(
            selectinload(CourseEnrollment.course)
            .selectinload(Course.modules)
            .selectinload(Module.lessons)
        )
        .where(CourseEnrollment.user_id == current_user.id)
    )
    enrollments = result.scalars().all()
    progress_rows = (
        await db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == current_user.id,
                LessonProgress.completed == True,
            )
        )
    ).scalars().all()
    completed_ids = {p.lesson_id for p in progress_rows}

    payload = []
    dirty = False
    for e in enrollments:
        course = e.course
        pct, completed, total = _progress_for_course(course, completed_ids)
        if e.progress != pct:
            e.progress = pct
            e.status = "completed" if pct >= 100 else "active"
            dirty = True
        payload.append(
            {
                "id": e.id,
                "course_id": e.course_id,
                "title": course.title if course else "",
                "description": course.description if course else None,
                "progress": pct,
                "lessons_completed": completed,
                "lessons_total": total,
                "status": e.status or ("completed" if pct >= 100 else "active"),
                "next_module": _next_module_title(course, completed_ids),
            }
        )
    if dirty:
        await db.commit()
    return payload


@router.get("/{course_id}")
async def get_course(course_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.materials))
        .where(Course.id == course_id)
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/", response_model=CourseListResponse)
async def create_course(course_in: CourseCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    course = Course(**course_in.model_dump())
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


@router.patch("/{course_id}", response_model=CourseListResponse)
async def update_course(course_id: int, course_in: CourseCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for field, value in course_in.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    await db.commit()
    await db.refresh(course)
    return course


@router.post("/{course_id}/enroll")
async def enroll_in_course(course_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CourseEnrollment).where(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course_id,
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Already enrolled")
    db.add(CourseEnrollment(user_id=current_user.id, course_id=course_id))
    await db.commit()
    return {"message": "Enrolled successfully"}


@router.post("/{course_id}/progress")
async def update_lesson_progress(course_id: int, update: ProgressUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == update.lesson_id,
        )
    )
    lp = result.scalars().first()
    if lp:
        lp.completed = update.completed
        if update.completed:
            lp.completed_at = datetime.now(timezone.utc)
    else:
        lp = LessonProgress(
            user_id=current_user.id,
            lesson_id=update.lesson_id,
            completed=update.completed,
            completed_at=datetime.now(timezone.utc) if update.completed else None,
        )
        db.add(lp)
    await db.flush()
    progress = await _sync_enrollment_progress(db, current_user.id, course_id)
    await db.commit()
    return {"message": "Progress updated", "progress": progress}
