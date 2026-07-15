from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MaterialResponse(BaseModel):
    id: int
    title: str
    file_url: str
    class Config:
        from_attributes = True

class LessonResponse(BaseModel):
    id: int
    title: str
    bunny_video_id: Optional[str] = None
    content: Optional[str] = None
    order: int
    duration_seconds: Optional[int] = None
    materials: List[MaterialResponse] = []
    class Config:
        from_attributes = True

class ModuleResponse(BaseModel):
    id: int
    title: str
    order: int
    lessons: List[LessonResponse] = []
    class Config:
        from_attributes = True

class CourseListResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    is_published: bool
    class Config:
        from_attributes = True

class CourseDetailResponse(CourseListResponse):
    modules: List[ModuleResponse] = []

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    is_published: bool = False

class EnrollmentResponse(BaseModel):
    id: int
    course_id: int
    progress: int
    status: str
    enrolled_at: datetime
    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    lesson_id: int
    completed: bool
