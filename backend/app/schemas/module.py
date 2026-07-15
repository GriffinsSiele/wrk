from pydantic import BaseModel
from typing import Optional


class ModuleCreate(BaseModel):
    title: str
    order: int


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    order: Optional[int] = None


class LessonCreate(BaseModel):
    title: str
    order: int
    content: Optional[str] = None
    bunny_video_id: Optional[str] = None
    duration_seconds: Optional[int] = None


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    order: Optional[int] = None
    content: Optional[str] = None
    bunny_video_id: Optional[str] = None
    duration_seconds: Optional[int] = None
