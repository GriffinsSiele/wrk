"""Helpers to flatten ExamConfig.config_json integrity fields for API responses.

Pass mark, question count, and timers live on ExamConfig columns.
Integrity / future REPs fields live in config_json so new requirements
can be stored without a hardcoded exam engine rewrite.
"""

from __future__ import annotations

from typing import Any, Optional

from app.core.config import settings


INTEGRITY_DEFAULTS = {
    "seconds_per_question": None,  # filled from settings at runtime
    "one_way": True,
    "shuffle_options": True,
    "max_disconnect_pause_seconds": None,
    "submit_grace_minutes": None,
    "anomaly_review_threshold": 5,
}


def integrity_from_config(config) -> dict[str, Any]:
    raw = (config.config_json if config and isinstance(config.config_json, dict) else {}) or {}
    return {
        "seconds_per_question": int(
            raw.get("seconds_per_question", settings.EXAM_SECONDS_PER_QUESTION)
        ),
        "one_way": bool(raw.get("one_way", True)),
        "shuffle_options": bool(raw.get("shuffle_options", True)),
        "max_disconnect_pause_seconds": int(
            raw.get("max_disconnect_pause_seconds", settings.EXAM_MAX_DISCONNECT_PAUSE_SECONDS)
        ),
        "submit_grace_minutes": int(
            raw.get("submit_grace_minutes", settings.EXAM_SUBMIT_GRACE_MINUTES)
        ),
        "anomaly_review_threshold": int(raw.get("anomaly_review_threshold", 5)),
    }


def merge_integrity_json(
    existing: Optional[dict],
    *,
    seconds_per_question: Optional[int] = None,
    one_way: Optional[bool] = None,
    shuffle_options: Optional[bool] = None,
    max_disconnect_pause_seconds: Optional[int] = None,
    submit_grace_minutes: Optional[int] = None,
    anomaly_review_threshold: Optional[int] = None,
    extra: Optional[dict] = None,
) -> dict:
    out = dict(existing or {})
    if extra:
        out.update(extra)
    if seconds_per_question is not None:
        out["seconds_per_question"] = seconds_per_question
    if one_way is not None:
        out["one_way"] = one_way
    if shuffle_options is not None:
        out["shuffle_options"] = shuffle_options
    if max_disconnect_pause_seconds is not None:
        out["max_disconnect_pause_seconds"] = max_disconnect_pause_seconds
    if submit_grace_minutes is not None:
        out["submit_grace_minutes"] = submit_grace_minutes
    if anomaly_review_threshold is not None:
        out["anomaly_review_threshold"] = anomaly_review_threshold
    return out


def config_to_response(config) -> dict:
    integrity = integrity_from_config(config)
    return {
        "id": config.id,
        "name": config.name,
        "certification_level": config.certification_level,
        "pass_mark": config.pass_mark,
        "time_limit_minutes": config.time_limit_minutes,
        "max_attempts": config.max_attempts,
        "randomise_questions": config.randomise_questions,
        "question_count": config.question_count,
        "proctoring_level": config.proctoring_level,
        **integrity,
        "config_json": config.config_json or {},
        "created_at": config.created_at,
    }
