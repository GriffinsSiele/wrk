import random
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models import (ExamSession, ExamRegistration, ExamAttempt, ExamStatus, QuestionBank, ExamConfig, User)
from app.schemas.exam import (ExamSessionResponse, AttemptStartResponse, AttemptSubmit, AttemptResultResponse, QuestionDisplay, QuestionBankCreate, ExamConfigCreate)
from app.api.deps import get_current_user, get_current_active_admin
from app.core.config import settings
from app.services.certification import try_issue_certificate, has_passed_practical, prerequisite_satisfied

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

@router.get("/sessions", response_model=List[ExamSessionResponse])
async def list_exam_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExamSession).where(ExamSession.date >= datetime.now(timezone.utc)))
    return result.scalars().all()

@router.post("/sessions")
async def create_exam_session(payload: ExamSessionCreate, _: User = Depends(get_current_active_admin), db: AsyncSession = Depends(get_db)):
    session = ExamSession(**payload.model_dump())
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.post("/sessions/{session_id}/book")
async def book_exam_slot(session_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    attempts_result = await db.execute(select(ExamAttempt).where(ExamAttempt.user_id == current_user.id))
    if len(attempts_result.scalars().all()) >= settings.EXAM_MAX_ATTEMPTS:
        raise HTTPException(status_code=400, detail="Maximum exam attempts reached")
    existing = await db.execute(select(ExamRegistration).where(ExamRegistration.user_id == current_user.id, ExamRegistration.session_id == session_id))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Already registered for this session")
    db.add(ExamRegistration(user_id=current_user.id, session_id=session_id))
    await db.commit()
    return {"message": "Exam booked successfully"}

@router.post("/attempts/start", response_model=AttemptStartResponse)
async def start_exam_attempt(session_id: int, request: Request, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    _require_online_mode()
    reg_result = await db.execute(select(ExamRegistration).where(ExamRegistration.user_id == current_user.id, ExamRegistration.session_id == session_id))
    if not reg_result.scalars().first():
        raise HTTPException(status_code=403, detail="Not registered for this session")
    session_result = await db.execute(select(ExamSession).options(selectinload(ExamSession.config)).where(ExamSession.id == session_id))
    exam_session = session_result.scalars().first()
    config = exam_session.config if exam_session and exam_session.config else None
    time_limit = config.time_limit_minutes if config else settings.EXAM_TIME_LIMIT_MINUTES
    question_count = config.question_count if config else 40
    randomise = config.randomise_questions if config else settings.EXAM_RANDOMISE
    q_result = await db.execute(select(QuestionBank).where(QuestionBank.is_active == True))
    all_questions = q_result.scalars().all()
    if len(all_questions) < question_count:
        question_count = len(all_questions)
    selected = random.sample(all_questions, question_count) if randomise else all_questions[:question_count]
    snapshot = [{"id": q.id, "text": q.text, "option_a": q.option_a, "option_b": q.option_b, "option_c": q.option_c, "option_d": q.option_d, "pillar_tag": q.pillar_tag} for q in selected]
    attempt = ExamAttempt(user_id=current_user.id, session_id=session_id, ip_address=request.client.host if request.client else None, question_snapshot=snapshot)
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return AttemptStartResponse(attempt_id=attempt.id, started_at=attempt.started_at, time_limit_minutes=time_limit, questions=[QuestionDisplay(**q) for q in snapshot])

@router.post("/attempts/{attempt_id}/submit", response_model=AttemptResultResponse)
async def submit_exam_attempt(attempt_id: int, submission: AttemptSubmit, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    _require_online_mode()
    result = await db.execute(select(ExamAttempt).where(ExamAttempt.id == attempt_id, ExamAttempt.user_id == current_user.id))
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.submitted_at:
        raise HTTPException(status_code=400, detail="Attempt already submitted")
    question_ids = [q["id"] for q in (attempt.question_snapshot or [])]
    q_result = await db.execute(select(QuestionBank).where(QuestionBank.id.in_(question_ids)))
    questions = {q.id: q.correct_option for q in q_result.scalars().all()}
    correct = sum(1 for qid, selected in submission.answers.items() if questions.get(int(qid)) == selected)
    total = len(question_ids)
    score = int((correct / total) * 100) if total else 0
    pass_mark = settings.EXAM_PASS_MARK
    if attempt.session_id:
        sess_result = await db.execute(select(ExamSession).options(selectinload(ExamSession.config)).where(ExamSession.id == attempt.session_id))
        sess = sess_result.scalars().first()
        if sess and sess.config:
            pass_mark = sess.config.pass_mark
    passed = score >= pass_mark
    attempt.answers = submission.answers
    attempt.submitted_at = datetime.now(timezone.utc)
    attempt.score = score
    attempt.passed = passed
    if attempt.session_id:
        reg_result = await db.execute(select(ExamRegistration).where(ExamRegistration.user_id == current_user.id, ExamRegistration.session_id == attempt.session_id))
        reg = reg_result.scalars().first()
        if reg:
            reg.status = ExamStatus.PASSED if passed else ExamStatus.FAILED
    await db.commit()
    await db.refresh(attempt)
    return attempt

@router.get("/attempts/{attempt_id}/result", response_model=AttemptResultResponse)
async def get_attempt_result(attempt_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    _require_online_mode()
    result = await db.execute(select(ExamAttempt).where(ExamAttempt.id == attempt_id, ExamAttempt.user_id == current_user.id))
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt

@router.post("/attempts/{attempt_id}/approve")
async def approve_exam_attempt(attempt_id: int, admin: User = Depends(get_current_active_admin), db: AsyncSession = Depends(get_db)):
    """Mark written exam as admin-reviewed, then attempt dual-gate certificate issuance."""
    result = await db.execute(select(ExamAttempt).options(selectinload(ExamAttempt.user)).where(ExamAttempt.id == attempt_id))
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

    # Always record approval; cert waits if the practical gate is still open.
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
        "message": "Approved. Dual-gate met — certificate issued and role upgraded to Coach if applicable.",
        "certificate_issued": True,
        "verification_code": cert.verification_code,
    }

@router.get("/questions")
async def list_questions(_: User = Depends(get_current_active_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QuestionBank))
    return [{"id": q.id, "text": q.text, "pillar_tag": q.pillar_tag, "difficulty": q.difficulty, "is_active": q.is_active} for q in result.scalars().all()]

@router.post("/questions")
async def create_question(q: QuestionBankCreate, _: User = Depends(get_current_active_admin), db: AsyncSession = Depends(get_db)):
    question = QuestionBank(**q.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return {"id": question.id, "message": "Question created"}

@router.get("/attempts")
async def list_all_attempts(_: User = Depends(get_current_active_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExamAttempt).options(selectinload(ExamAttempt.user).selectinload(User.profile)))
    attempts = result.scalars().all()
    return [{"id": a.id, "user_id": a.user_id, "score": a.score, "passed": a.passed, "submitted_at": a.submitted_at, "approved_at": a.approved_at, "name": f"{a.user.profile.first_name} {a.user.profile.last_name}" if a.user and a.user.profile else ""} for a in attempts]
