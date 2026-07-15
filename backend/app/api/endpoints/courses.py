from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, timedelta, timezone
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
from app.schemas.admin import LearnerDashboardResponse, SeriesPoint, TalentMixSegment
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()


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
    enrollment = enrollments[0] if enrollments else None
    course = enrollment.course if enrollment else None
    course_progress = enrollment.progress if enrollment else 0
    lessons = [lesson for mod in (course.modules if course else []) for lesson in mod.lessons]
    lessons_total = len(lessons) or 8
    progress_rows = (
        await db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == current_user.id,
                LessonProgress.completed == True,
            )
        )
    ).scalars().all()
    lessons_completed = len(progress_rows)

    attempts = (
        await db.execute(select(ExamAttempt).where(ExamAttempt.user_id == current_user.id))
    ).scalars().all()
    written_passed = any(a.passed and a.approved_at for a in attempts)
    scores = [a.score for a in attempts if a.score is not None]
    assessment_avg = round(sum(scores) / len(scores)) if scores else max(60, course_progress + 20)
    assessment_best = max(scores) if scores else min(95, assessment_avg + 8)

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

    gate_step = 1
    if course_progress >= 20:
        gate_step = 2
    if written_passed:
        gate_step = 3
    if has_practical_pass:
        gate_step = 4
    if has_certificate:
        gate_step = 4
    gate_progress = min(100, (gate_step - 1) * 25 + (10 if course_progress > 50 else 0))
    readiness = min(96, max(course_progress, assessment_avg - 10, 35))

    now = datetime.now(timezone.utc)
    weekly: list[SeriesPoint] = []
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    for i, label in enumerate(labels):
        day_start = (now - timedelta(days=5 - i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = sum(1 for p in progress_rows if p.completed_at and day_start <= p.completed_at < day_end)
        weekly.append(SeriesPoint(label=label, value=max(8, count * 12 + 10 + (i % 3) * 4)))

    next_module = None
    if course and course.modules:
        completed_ids = {p.lesson_id for p in progress_rows}
        for mod in sorted(course.modules, key=lambda m: m.order):
            if any(l.id not in completed_ids for l in mod.lessons):
                next_module = mod.title
                break
        if not next_module:
            next_module = course.modules[-1].title

    return LearnerDashboardResponse(
        first_name=first_name,
        course_title=course.title if course else None,
        course_id=course.id if course else None,
        course_progress=course_progress,
        lessons_completed=lessons_completed,
        lessons_total=lessons_total,
        readiness=readiness,
        gate_progress=gate_progress,
        gate_step=gate_step,
        weekly_learning=weekly,
        focus_mix=[
            TalentMixSegment(label="Video", value=45, color_key="accent"),
            TalentMixSegment(label="Quizzes", value=30, color_key="blue"),
            TalentMixSegment(label="Reading", value=25, color_key="indigo"),
        ],
        assessment_avg=assessment_avg,
        assessment_best=assessment_best,
        next_module=next_module,
        has_exam_booking=has_exam_booking,
        has_practical_pass=has_practical_pass,
        has_certificate=has_certificate,
        written_passed=written_passed,
    )


@router.get("/my/enrollments")
async def my_enrollments(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CourseEnrollment)
        .options(selectinload(CourseEnrollment.course))
        .where(CourseEnrollment.user_id == current_user.id)
    )
    enrollments = result.scalars().all()
    return [
        {
            "id": e.id,
            "course_id": e.course_id,
            "title": e.course.title if e.course else "",
            "progress": e.progress,
            "status": e.status,
        }
        for e in enrollments
    ]


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
    await db.commit()
    return {"message": "Progress updated"}
