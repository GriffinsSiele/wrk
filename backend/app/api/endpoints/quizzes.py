from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import Quiz, Module, User
from app.api.deps import get_current_user, get_current_active_admin
from app.schemas.quiz import QuizCreate, QuizResponse, QuizSubmit, QuizResult

router = APIRouter()


@router.get("/modules/{module_id}/quiz", response_model=QuizResponse, tags=["quizzes"])
async def get_module_quiz(
    module_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get the quiz for a given module."""
    result = await db.execute(
        select(Quiz).where(Quiz.module_id == module_id)
    )
    quiz = result.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found for this module")
    return quiz


@router.post("/modules/{module_id}/quiz", response_model=QuizResponse, tags=["quizzes"])
async def create_or_update_quiz(
    module_id: int,
    data: QuizCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    """Create or replace the quiz for a module (admin only)."""
    # Verify module exists
    mod_result = await db.execute(select(Module).where(Module.id == module_id))
    if not mod_result.scalars().first():
        raise HTTPException(status_code=404, detail="Module not found")

    # Upsert: replace existing quiz or create new
    result = await db.execute(select(Quiz).where(Quiz.module_id == module_id))
    quiz = result.scalars().first()

    if quiz:
        quiz.questions = data.questions
    else:
        quiz = Quiz(module_id=module_id, questions=data.questions)
        db.add(quiz)

    await db.commit()
    await db.refresh(quiz)
    return quiz


@router.post("/quizzes/{quiz_id}/submit", response_model=QuizResult, tags=["quizzes"])
async def submit_quiz(
    quiz_id: int,
    submission: QuizSubmit,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Submit answers for a quiz and receive a score."""
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = quiz.questions
    total = len(questions)
    correct = 0

    for q in questions:
        q_id = str(q.get("id", ""))
        correct_answer = q.get("correct_option", "")
        user_answer = submission.answers.get(q_id, "")
        if user_answer == correct_answer:
            correct += 1

    score = (correct / total * 100) if total > 0 else 0
    passed = score >= 70

    return QuizResult(score=round(score, 2), passed=passed, correct=correct, total=total)
