"""Exam sessions, progressive Phase 1 attempts, and admin question bank."""

from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_active_admin, get_current_user
from app.core.config import settings
from app.db.models import (
    ExamAttempt,
    ExamConfig,
    ExamRegistration,
    ExamSession,
    ExamStatus,
    QuestionBank,
    User,
)
from app.db.session import get_db
from app.schemas.exam import (
    AttemptAnswerRequest,
    AttemptAnomalyRequest,
    AttemptProgressResponse,
    AttemptResultResponse,
    AttemptStartResponse,
    AttemptSubmit,
    ExamSessionResponse,
    QuestionBankCreate,
    QuestionDisplay,
)
from app.services import exam_engine as engine
from app.services.certification import has_passed_practical, prerequisite_satisfied, try_issue_certificate

router = APIRouter()


class ExamSessionCreate(BaseModel):
    title: str = "Certification Exam Session"
    date: datetime
    is_online: bool = True
    location: Optional[str] = "Online"
    capacity: int = 30
    exam_config_id: Optional[int] = None


def _require_online_mode() -> None:
    if settings.EXAM_DELIVERY_MODE.lower() != "online":
        raise HTTPException(
            status_code=403,
            detail="Online exam attempts are currently disabled by system configuration. Contact admin.",
        )


async def _session_time_limit(db: AsyncSession, session_id: Optional[int]) -> int:
    if not session_id:
        return settings.EXAM_TIME_LIMIT_MINUTES
    sess_result = await db.execute(
        select(ExamSession).options(selectinload(ExamSession.config)).where(ExamSession.id == session_id)
    )
    sess = sess_result.scalars().first()
    if sess and sess.config and sess.config.time_limit_minutes:
        return sess.config.time_limit_minutes
    return settings.EXAM_TIME_LIMIT_MINUTES


async def _load_attempt(db: AsyncSession, attempt_id: int, user_id: int) -> ExamAttempt:
    result = await db.execute(
        select(ExamAttempt).where(ExamAttempt.id == attempt_id, ExamAttempt.user_id == user_id)
    )
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt


async def _attach_time_limit(db: AsyncSession, attempt: ExamAttempt) -> int:
    # Ephemeral: overall_deadline reads attempt._time_limit_minutes (not a DB column).
    limit = await _session_time_limit(db, attempt.session_id)
    attempt._time_limit_minutes = limit  # type: ignore[attr-defined]
    return limit


def _progress_payload(attempt: ExamAttempt, *, time_limit: int, completed: bool = False) -> AttemptProgressResponse:
    snapshot = attempt.question_snapshot or []
    idx = attempt.current_index or 0
    total = len(snapshot)
    question = None
    if not completed and not attempt.submitted_at and 0 <= idx < total:
        question = QuestionDisplay(**engine.public_question(snapshot[idx]))
    answers = attempt.answers or {}
    return AttemptProgressResponse(
        attempt_id=attempt.id,
        started_at=attempt.started_at,
        time_limit_minutes=time_limit,
        current_index=idx,
        total_questions=total,
        seconds_per_question=attempt.seconds_per_question or settings.EXAM_SECONDS_PER_QUESTION,
        question=question,
        question_remaining_seconds=0 if completed or attempt.submitted_at else engine.question_remaining_seconds(attempt),
        overall_remaining_seconds=0 if completed or attempt.submitted_at else engine.overall_remaining_seconds(attempt),
        answered_count=len(answers),
        paused=bool(attempt.paused_at),
        completed=completed or bool(attempt.submitted_at),
        needs_admin_review=bool(attempt.needs_admin_review),
        one_way=True,
    )


async def _finalize_attempt(db: AsyncSession, attempt: ExamAttempt, *, reason: str = "submit") -> ExamAttempt:
    if attempt.submitted_at:
        return attempt
    if attempt.paused_at:
        engine.unpause_attempt(attempt)
    await _attach_time_limit(db, attempt)
    now = engine.now_utc()
    if reason == "overall_timeout" or engine.overall_remaining_seconds(attempt, now=now) <= 0:
        engine.append_anomaly(attempt, "overall_timeout", "Overall 60-minute ceiling reached")
    score, passed, pass_mark = engine.score_attempt(attempt)
    # Session config pass mark overrides the global default when set.
    if attempt.session_id:
        sess_result = await db.execute(
            select(ExamSession).options(selectinload(ExamSession.config)).where(ExamSession.id == attempt.session_id)
        )
        sess = sess_result.scalars().first()
        if sess and sess.config:
            pass_mark = sess.config.pass_mark
            passed = score >= pass_mark
    attempt.score = score
    attempt.passed = passed
    attempt.submitted_at = now
    attempt.paused_at = None
    if attempt.session_id:
        reg_result = await db.execute(
            select(ExamRegistration).where(
                ExamRegistration.user_id == attempt.user_id,
                ExamRegistration.session_id == attempt.session_id,
            )
        )
        reg = reg_result.scalars().first()
        if reg:
            reg.status = ExamStatus.PASSED if passed else ExamStatus.FAILED
    await db.commit()
    await db.refresh(attempt)
    return attempt


async def _auto_advance_if_question_expired(db: AsyncSession, attempt: ExamAttempt) -> bool:
    """If 90s elapsed while not paused, lock blank and advance. Returns True if completed."""
    if attempt.submitted_at or attempt.paused_at:
        return bool(attempt.submitted_at)
    snapshot = attempt.question_snapshot or []
    idx = attempt.current_index or 0
    if idx >= len(snapshot):
        await _finalize_attempt(db, attempt, reason="complete")
        return True
    if engine.question_remaining_seconds(attempt) > 0:
        return False
    # Timeout: blank lock, no going back
    qid = str(snapshot[idx]["id"])
    answers = dict(attempt.answers or {})
    if qid not in answers:
        answers[qid] = ""
        attempt.answers = answers
        flag_modified(attempt, "answers")
    engine.append_anomaly(attempt, "question_timeout", f"Question {idx + 1} locked blank after 90s")
    attempt.current_index = idx + 1
    if attempt.current_index >= len(snapshot):
        await _finalize_attempt(db, attempt, reason="complete")
        return True
    if engine.overall_remaining_seconds(attempt) <= 0:
        await _finalize_attempt(db, attempt, reason="overall_timeout")
        return True
    engine.begin_question_clock(attempt)
    await db.commit()
    await db.refresh(attempt)
    return False


@router.get("/sessions", response_model=List[ExamSessionResponse])
async def list_exam_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExamSession).where(ExamSession.date >= datetime.now(timezone.utc)))
    return result.scalars().all()


@router.post("/sessions")
async def create_exam_session(
    payload: ExamSessionCreate,
    _: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    session = ExamSession(**payload.model_dump())
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/sessions/{session_id}/book")
async def book_exam_slot(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Cap is global across all sessions for this user (not per-session).
    attempts_result = await db.execute(select(ExamAttempt).where(ExamAttempt.user_id == current_user.id))
    if len(attempts_result.scalars().all()) >= settings.EXAM_MAX_ATTEMPTS:
        raise HTTPException(status_code=400, detail="Maximum exam attempts reached")
    session_result = await db.execute(select(ExamSession).where(ExamSession.id == session_id))
    exam_session = session_result.scalars().first()
    if not exam_session:
        raise HTTPException(status_code=404, detail="Exam session not found")
    booked_count = await db.scalar(
        select(func.count()).select_from(ExamRegistration).where(ExamRegistration.session_id == session_id)
    )
    if (booked_count or 0) >= exam_session.capacity:
        raise HTTPException(status_code=400, detail="This exam session is full")
    existing = await db.execute(
        select(ExamRegistration).where(
            ExamRegistration.user_id == current_user.id,
            ExamRegistration.session_id == session_id,
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Already registered for this session")
    db.add(ExamRegistration(user_id=current_user.id, session_id=session_id))
    await db.commit()
    return {"message": "Exam booked successfully"}


@router.post("/attempts/start", response_model=AttemptStartResponse)
async def start_exam_attempt(
    session_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new attempt, or resume an in-progress one for this session."""
    _require_online_mode()
    reg_result = await db.execute(
        select(ExamRegistration).where(
            ExamRegistration.user_id == current_user.id,
            ExamRegistration.session_id == session_id,
        )
    )
    if not reg_result.scalars().first():
        raise HTTPException(status_code=403, detail="Not registered for this session")

    # Resume open attempt if present
    open_result = await db.execute(
        select(ExamAttempt).where(
            ExamAttempt.user_id == current_user.id,
            ExamAttempt.session_id == session_id,
            ExamAttempt.submitted_at.is_(None),
        )
    )
    open_attempt = open_result.scalars().first()
    if open_attempt:
        time_limit = await _attach_time_limit(db, open_attempt)
        if open_attempt.paused_at:
            engine.unpause_attempt(open_attempt)
        completed = await _auto_advance_if_question_expired(db, open_attempt)
        if completed:
            raise HTTPException(
                status_code=400,
                detail="Previous attempt auto-completed after time expiry. Check your results.",
            )
        if not open_attempt.question_started_at:
            engine.begin_question_clock(open_attempt)
        await db.commit()
        await db.refresh(open_attempt)
        progress = _progress_payload(open_attempt, time_limit=time_limit)
        return AttemptStartResponse(
            attempt_id=open_attempt.id,
            started_at=open_attempt.started_at,
            time_limit_minutes=time_limit,
            questions=[],  # never dump full bank to client
            current_index=progress.current_index,
            total_questions=progress.total_questions,
            seconds_per_question=progress.seconds_per_question,
            question=progress.question,
            question_remaining_seconds=progress.question_remaining_seconds,
            overall_remaining_seconds=progress.overall_remaining_seconds,
            resumed=True,
            paused=False,
            one_way=True,
        )

    session_result = await db.execute(
        select(ExamSession).options(selectinload(ExamSession.config)).where(ExamSession.id == session_id)
    )
    exam_session = session_result.scalars().first()
    config = exam_session.config if exam_session and exam_session.config else None
    time_limit = config.time_limit_minutes if config else settings.EXAM_TIME_LIMIT_MINUTES
    question_count = config.question_count if config else 40
    randomise = config.randomise_questions if config else settings.EXAM_RANDOMISE
    seconds_per_q = settings.EXAM_SECONDS_PER_QUESTION
    if config and config.config_json and isinstance(config.config_json, dict):
        seconds_per_q = int(config.config_json.get("seconds_per_question", seconds_per_q))

    q_result = await db.execute(select(QuestionBank).where(QuestionBank.is_active == True))  # noqa: E712
    all_questions = q_result.scalars().all()
    if not all_questions:
        raise HTTPException(status_code=400, detail="No active questions in the bank")
    if len(all_questions) < question_count:
        question_count = len(all_questions)
    selected = random.sample(all_questions, question_count) if randomise else all_questions[:question_count]
    # Always shuffle answer options per attempt (Phase 1)
    snapshot = [engine.shuffle_question_options(q) for q in selected]

    now = engine.now_utc()
    attempt = ExamAttempt(
        user_id=current_user.id,
        session_id=session_id,
        ip_address=request.client.host if request.client else None,
        question_snapshot=snapshot,
        answers={},
        current_index=0,
        question_started_at=now,
        seconds_per_question=seconds_per_q,
        total_pause_seconds=0,
        anomaly_flags=[],
        needs_admin_review=False,
        started_at=now,
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    progress = _progress_payload(attempt, time_limit=time_limit)
    return AttemptStartResponse(
        attempt_id=attempt.id,
        started_at=attempt.started_at,
        time_limit_minutes=time_limit,
        questions=[],
        current_index=0,
        total_questions=len(snapshot),
        seconds_per_question=seconds_per_q,
        question=progress.question,
        question_remaining_seconds=progress.question_remaining_seconds,
        overall_remaining_seconds=progress.overall_remaining_seconds,
        resumed=False,
        paused=False,
        one_way=True,
    )


@router.get("/attempts/{attempt_id}/current", response_model=AttemptProgressResponse)
async def get_current_question(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_online_mode()
    attempt = await _load_attempt(db, attempt_id, current_user.id)
    time_limit = await _attach_time_limit(db, attempt)
    if attempt.submitted_at:
        return _progress_payload(attempt, time_limit=time_limit, completed=True)
    if engine.overall_remaining_seconds(attempt) <= 0:
        await _finalize_attempt(db, attempt, reason="overall_timeout")
        return _progress_payload(attempt, time_limit=time_limit, completed=True)
    completed = await _auto_advance_if_question_expired(db, attempt)
    if completed:
        return _progress_payload(attempt, time_limit=time_limit, completed=True)
    return _progress_payload(attempt, time_limit=time_limit)


@router.post("/attempts/{attempt_id}/answer", response_model=AttemptProgressResponse)
async def answer_current_question(
    attempt_id: int,
    payload: AttemptAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lock answer for the current question and advance (one-way). No going back."""
    _require_online_mode()
    attempt = await _load_attempt(db, attempt_id, current_user.id)
    time_limit = await _attach_time_limit(db, attempt)
    if attempt.submitted_at:
        raise HTTPException(status_code=400, detail="Attempt already submitted")
    if attempt.paused_at:
        raise HTTPException(status_code=409, detail="Attempt is paused. Call /resume first.")

    if engine.overall_remaining_seconds(attempt) <= 0:
        await _finalize_attempt(db, attempt, reason="overall_timeout")
        return _progress_payload(attempt, time_limit=time_limit, completed=True)

    completed = await _auto_advance_if_question_expired(db, attempt)
    if completed:
        return _progress_payload(attempt, time_limit=time_limit, completed=True)

    snapshot = attempt.question_snapshot or []
    idx = attempt.current_index or 0
    if idx >= len(snapshot):
        await _finalize_attempt(db, attempt, reason="complete")
        return _progress_payload(attempt, time_limit=time_limit, completed=True)

    selected = (payload.selected or "").strip().lower() or ""
    if selected and selected not in ("a", "b", "c", "d"):
        raise HTTPException(status_code=400, detail="selected must be a, b, c, or d")

    # Race: timer expired between auto_advance and this POST — store blank, not the late pick.
    if engine.question_remaining_seconds(attempt) <= 0:
        selected = ""
        engine.append_anomaly(attempt, "question_timeout", f"Late answer ignored on question {idx + 1}")

    qid = str(snapshot[idx]["id"])
    answers = dict(attempt.answers or {})
    if qid in answers:
        raise HTTPException(status_code=400, detail="Question already locked. No going back.")
    answers[qid] = selected
    attempt.answers = answers
    flag_modified(attempt, "answers")
    attempt.current_index = idx + 1

    if attempt.current_index >= len(snapshot):
        await _finalize_attempt(db, attempt, reason="complete")
        return _progress_payload(attempt, time_limit=time_limit, completed=True)

    if engine.overall_remaining_seconds(attempt) <= 0:
        await _finalize_attempt(db, attempt, reason="overall_timeout")
        return _progress_payload(attempt, time_limit=time_limit, completed=True)

    engine.begin_question_clock(attempt)
    await db.commit()
    await db.refresh(attempt)
    return _progress_payload(attempt, time_limit=time_limit)


@router.post("/attempts/{attempt_id}/disconnect", response_model=AttemptProgressResponse)
async def disconnect_attempt(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Pause per-question clock on connectivity loss (overall 60m still runs)."""
    _require_online_mode()
    attempt = await _load_attempt(db, attempt_id, current_user.id)
    time_limit = await _attach_time_limit(db, attempt)
    if attempt.submitted_at:
        return _progress_payload(attempt, time_limit=time_limit, completed=True)
    engine.pause_attempt(attempt, reason="disconnect")
    await db.commit()
    await db.refresh(attempt)
    return _progress_payload(attempt, time_limit=time_limit)


@router.post("/attempts/{attempt_id}/resume", response_model=AttemptProgressResponse)
async def resume_attempt(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Resume at current question after disconnect; credit pause to 90s clock (capped)."""
    _require_online_mode()
    attempt = await _load_attempt(db, attempt_id, current_user.id)
    time_limit = await _attach_time_limit(db, attempt)
    if attempt.submitted_at:
        return _progress_payload(attempt, time_limit=time_limit, completed=True)

    if engine.overall_remaining_seconds(attempt) <= 0:
        await _finalize_attempt(db, attempt, reason="overall_timeout")
        return _progress_payload(attempt, time_limit=time_limit, completed=True)

    if attempt.paused_at:
        engine.unpause_attempt(attempt)
    elif not attempt.question_started_at:
        engine.begin_question_clock(attempt)

    completed = await _auto_advance_if_question_expired(db, attempt)
    if completed:
        return _progress_payload(attempt, time_limit=time_limit, completed=True)

    await db.commit()
    await db.refresh(attempt)
    return _progress_payload(attempt, time_limit=time_limit)


@router.post("/attempts/{attempt_id}/anomaly")
async def report_anomaly(
    attempt_id: int,
    payload: AttemptAnomalyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_online_mode()
    attempt = await _load_attempt(db, attempt_id, current_user.id)
    if attempt.submitted_at:
        return {"message": "Attempt already submitted", "recorded": False}
    code = (payload.code or "").strip().lower()
    allowed = {"tab_blur", "focus_loss", "visibility_hidden", "client_disconnect", "devtools"}
    if code not in allowed:
        raise HTTPException(status_code=400, detail=f"Unknown anomaly code. Allowed: {sorted(allowed)}")
    engine.append_anomaly(attempt, code, payload.detail or "")
    # Only hide/offline pause the 90s clock; tab_blur is flagged but does not pause.
    if code in {"client_disconnect", "visibility_hidden"} and not attempt.paused_at:
        engine.pause_attempt(attempt, reason="disconnect")
    await db.commit()
    return {"message": "Anomaly recorded", "recorded": True, "needs_admin_review": attempt.needs_admin_review}


@router.post("/attempts/{attempt_id}/submit", response_model=AttemptResultResponse)
async def submit_exam_attempt(
    attempt_id: int,
    submission: AttemptSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Legacy bulk submit kept for compatibility.
    Phase 1 UI should use /answer per question; this finalizes remaining blanks if called early.
    """
    _require_online_mode()
    attempt = await _load_attempt(db, attempt_id, current_user.id)
    if attempt.submitted_at:
        raise HTTPException(status_code=400, detail="Attempt already submitted")

    await _attach_time_limit(db, attempt)
    now = engine.now_utc()
    if engine.overall_remaining_seconds(attempt, now=now) <= 0:
        engine.append_anomaly(attempt, "overall_timeout", "Submit after overall ceiling")

    # Phase 1: ignore bulk payload; score only progressively locked answers.
    if submission.answers:
        engine.append_anomaly(attempt, "legacy_bulk_submit", "Bulk submit ignored; using locked progressive answers")

    snapshot = attempt.question_snapshot or []
    answers = dict(attempt.answers or {})
    # Early submit blanks unanswered remaining questions.
    for item in snapshot[attempt.current_index or 0 :]:
        qid = str(item["id"])
        if qid not in answers:
            answers[qid] = ""
    attempt.answers = answers
    attempt.current_index = len(snapshot)
    await _finalize_attempt(db, attempt, reason="submit")
    return attempt


@router.get("/attempts/{attempt_id}/result", response_model=AttemptResultResponse)
async def get_attempt_result(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_online_mode()
    attempt = await _load_attempt(db, attempt_id, current_user.id)
    return attempt


@router.post("/attempts/{attempt_id}/approve")
async def approve_exam_attempt(
    attempt_id: int,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    """Mark written exam as admin-reviewed, then attempt dual-gate certificate issuance."""
    result = await db.execute(
        select(ExamAttempt).options(selectinload(ExamAttempt.user)).where(ExamAttempt.id == attempt_id)
    )
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if not attempt.passed:
        raise HTTPException(status_code=400, detail="Attempt did not pass")

    level = "Level 1"
    if attempt.session_id:
        sess_result = await db.execute(
            select(ExamSession).options(selectinload(ExamSession.config)).where(ExamSession.id == attempt.session_id)
        )
        sess = sess_result.scalars().first()
        if sess and sess.config and sess.config.certification_level:
            level = sess.config.certification_level

    if not await prerequisite_satisfied(db, attempt.user_id, level):
        raise HTTPException(
            status_code=400,
            detail=f"Prerequisite not met: an active prior certification is required before {level}.",
        )

    attempt.approved_by_id = admin.id
    attempt.approved_at = datetime.now(timezone.utc)

    practical_ok, _ = await has_passed_practical(db, attempt.user_id, level)
    if not practical_ok:
        await db.commit()
        return {
            "message": "Written exam approved. Certificate pending practical assessment PASS.",
            "certificate_issued": False,
            "verification_code": None,
            "pending": "practical_assessment",
        }

    cert = await try_issue_certificate(db, attempt.user_id, level)
    await db.commit()
    if not cert:
        return {
            "message": "Written exam approved but certificate could not be issued yet.",
            "certificate_issued": False,
            "verification_code": None,
        }
    return {
        "message": "Approved. Dual-gate met, certificate issued and role upgraded to Coach if applicable.",
        "certificate_issued": True,
        "verification_code": cert.verification_code,
    }


@router.get("/questions")
async def list_questions(_: User = Depends(get_current_active_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QuestionBank))
    return [
        {
            "id": q.id,
            "text": q.text,
            "pillar_tag": q.pillar_tag,
            "difficulty": q.difficulty,
            "is_active": q.is_active,
        }
        for q in result.scalars().all()
    ]


@router.post("/questions")
async def create_question(
    q: QuestionBankCreate,
    _: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    question = QuestionBank(**q.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return {"id": question.id, "message": "Question created"}


@router.get("/attempts")
async def list_all_attempts(_: User = Depends(get_current_active_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExamAttempt).options(selectinload(ExamAttempt.user).selectinload(User.profile))
    )
    attempts = result.scalars().all()
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "score": a.score,
            "passed": a.passed,
            "submitted_at": a.submitted_at,
            "approved_at": a.approved_at,
            "needs_admin_review": a.needs_admin_review,
            "anomaly_flags": a.anomaly_flags or [],
            "current_index": a.current_index,
            "name": (
                f"{a.user.profile.first_name} {a.user.profile.last_name}"
                if a.user and a.user.profile
                else ""
            ),
        }
        for a in attempts
    ]
