from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import Module, Lesson, Material, Course, User
from app.api.deps import get_current_active_admin
from app.schemas.module import ModuleCreate, ModuleUpdate, LessonCreate, LessonUpdate

router = APIRouter()


# ─────────────────────────── Module CRUD ───────────────────────────


@router.post("/courses/{course_id}/modules", tags=["modules"])
async def create_module(
    course_id: int,
    data: ModuleCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    result = await db.execute(select(Course).where(Course.id == course_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Course not found")

    module = Module(course_id=course_id, **data.model_dump())
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return module


@router.patch("/modules/{module_id}", tags=["modules"])
async def update_module(
    module_id: int,
    data: ModuleUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalars().first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(module, field, value)

    await db.commit()
    await db.refresh(module)
    return module


@router.delete("/modules/{module_id}", tags=["modules"])
async def delete_module(
    module_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalars().first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    await db.delete(module)
    await db.commit()
    return {"message": "Module deleted"}


# ─────────────────────────── Lesson CRUD ───────────────────────────


@router.post("/modules/{module_id}/lessons", tags=["modules"])
async def create_lesson(
    module_id: int,
    data: LessonCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Module not found")

    lesson = Lesson(module_id=module_id, **data.model_dump())
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return lesson


@router.patch("/lessons/{lesson_id}", tags=["modules"])
async def update_lesson(
    lesson_id: int,
    data: LessonUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalars().first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(lesson, field, value)

    await db.commit()
    await db.refresh(lesson)
    return lesson


@router.delete("/lessons/{lesson_id}", tags=["modules"])
async def delete_lesson(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalars().first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    await db.delete(lesson)
    await db.commit()
    return {"message": "Lesson deleted"}
