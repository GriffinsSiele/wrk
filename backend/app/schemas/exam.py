from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ExamSessionResponse(BaseModel):
    id: int
    title: str
    date: datetime
    is_online: bool
    location: Optional[str] = None
    capacity: int
    class Config:
        from_attributes = True

class QuestionDisplay(BaseModel):
    id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    pillar_tag: Optional[str] = None

class AttemptStartResponse(BaseModel):
    attempt_id: int
    started_at: datetime
    time_limit_minutes: int
    questions: List[QuestionDisplay]

class AttemptSubmit(BaseModel):
    answers: Dict[str, str]

class AttemptResultResponse(BaseModel):
    id: int
    score: Optional[int] = None
    passed: Optional[bool] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ExamConfigCreate(BaseModel):
    name: str = "Default"
    certification_level: str = "Level 1"
    pass_mark: int = 70
    time_limit_minutes: int = 60
    max_attempts: int = 3
    randomise_questions: bool = True
    question_count: int = 40
    proctoring_level: str = "basic"
    config_json: Optional[Dict[str, Any]] = None

class QuestionBankCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    pillar_tag: Optional[str] = None
    difficulty: str = "medium"
