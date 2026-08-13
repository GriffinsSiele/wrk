from pydantic import BaseModel, Field
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
    """Legacy-compatible wrapper; prefer AttemptProgressResponse for Phase 1 UI."""
    attempt_id: int
    started_at: datetime
    time_limit_minutes: int
    questions: List[QuestionDisplay] = Field(default_factory=list)
    # Phase 1 fields
    current_index: int = 0
    total_questions: int = 0
    seconds_per_question: int = 90
    question: Optional[QuestionDisplay] = None
    question_remaining_seconds: int = 90
    overall_remaining_seconds: int = 3600
    resumed: bool = False
    paused: bool = False
    one_way: bool = True

class AttemptProgressResponse(BaseModel):
    attempt_id: int
    started_at: datetime
    time_limit_minutes: int
    current_index: int
    total_questions: int
    seconds_per_question: int
    question: Optional[QuestionDisplay] = None
    question_remaining_seconds: int = 0
    overall_remaining_seconds: int = 0
    answered_count: int = 0
    paused: bool = False
    completed: bool = False
    needs_admin_review: bool = False
    one_way: bool = True

class AttemptAnswerRequest(BaseModel):
    selected: Optional[str] = None  # a|b|c|d; null/omit = blank lock (timeout)

class AttemptAnomalyRequest(BaseModel):
    code: str  # tab_blur | focus_loss | visibility_hidden | client_disconnect
    detail: Optional[str] = None

class AttemptSubmit(BaseModel):
    answers: Dict[str, str] = Field(default_factory=dict)

class AttemptResultResponse(BaseModel):
    id: int
    score: Optional[int] = None
    passed: Optional[bool] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    needs_admin_review: Optional[bool] = None
    anomaly_flags: Optional[List[Dict[str, Any]]] = None
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
    # Flattened integrity fields; stored into config_json on write
    seconds_per_question: int = 90
    one_way: bool = True
    shuffle_options: bool = True
    max_disconnect_pause_seconds: int = 300
    submit_grace_minutes: int = 2
    anomaly_review_threshold: int = 5
    config_json: Optional[Dict[str, Any]] = None


class ExamConfigUpdate(BaseModel):
    name: Optional[str] = None
    certification_level: Optional[str] = None
    pass_mark: Optional[int] = None
    time_limit_minutes: Optional[int] = None
    max_attempts: Optional[int] = None
    randomise_questions: Optional[bool] = None
    question_count: Optional[int] = None
    proctoring_level: Optional[str] = None
    seconds_per_question: Optional[int] = None
    one_way: Optional[bool] = None
    shuffle_options: Optional[bool] = None
    max_disconnect_pause_seconds: Optional[int] = None
    submit_grace_minutes: Optional[int] = None
    anomaly_review_threshold: Optional[int] = None
    config_json: Optional[Dict[str, Any]] = None


class ExamConfigResponse(BaseModel):
    id: int
    name: str
    certification_level: Optional[str] = None
    pass_mark: int
    time_limit_minutes: int
    max_attempts: int
    randomise_questions: bool
    question_count: int
    proctoring_level: str
    seconds_per_question: int = 90
    one_way: bool = True
    shuffle_options: bool = True
    max_disconnect_pause_seconds: int = 300
    submit_grace_minutes: int = 2
    anomaly_review_threshold: int = 5
    config_json: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuestionBankCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    pillar_tag: Optional[str] = None
    difficulty: str = "medium"
