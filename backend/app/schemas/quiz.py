from pydantic import BaseModel
from typing import Optional, List, Any


class QuizCreate(BaseModel):
    questions: list


class QuizResponse(BaseModel):
    id: int
    module_id: int
    questions: list

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    answers: dict


class QuizResult(BaseModel):
    score: float
    passed: bool
    correct: int
    total: int
