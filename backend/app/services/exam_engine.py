"""Phase 1 exam integrity engine (Jef): one-at-a-time, 90s locks, shuffle, resume."""

from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from app.core.config import settings


LETTERS = ("a", "b", "c", "d")


def as_utc(dt: datetime) -> datetime:
    # DB may return naive datetimes; treat those as UTC.
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def shuffle_question_options(q: Any) -> dict:
    """Return a display snapshot with shuffled A–D and remapped correct_option."""
    pairs = [
        ("a", q.option_a),
        ("b", q.option_b),
        ("c", q.option_c),
        ("d", q.option_d),
    ]
    random.shuffle(pairs)
    display: dict[str, str] = {}
    correct_display = "a"
    original_correct = (q.correct_option or "a").strip().lower()
    for i, (orig, text) in enumerate(pairs):
        letter = LETTERS[i]
        display[f"option_{letter}"] = text
        if orig == original_correct:
            correct_display = letter
    return {
        "id": q.id,
        "text": q.text,
        "option_a": display["option_a"],
        "option_b": display["option_b"],
        "option_c": display["option_c"],
        "option_d": display["option_d"],
        "correct_option": correct_display,
        "pillar_tag": q.pillar_tag,
    }


def public_question(snapshot_item: dict) -> dict:
    """Strip answer key before sending to the learner."""
    return {
        "id": snapshot_item["id"],
        "text": snapshot_item["text"],
        "option_a": snapshot_item["option_a"],
        "option_b": snapshot_item["option_b"],
        "option_c": snapshot_item["option_c"],
        "option_d": snapshot_item["option_d"],
        "pillar_tag": snapshot_item.get("pillar_tag"),
    }


def append_anomaly(attempt, code: str, detail: str = "") -> None:
    flags = list(attempt.anomaly_flags or [])
    flags.append({
        "code": code,
        "detail": detail,
        "at": now_utc().isoformat(),
    })
    attempt.anomaly_flags = flags
    # Hard integrity events → admin review; soft blur alone does not.
    if code in {
        "disconnect",
        "reconnect",
        "question_timeout",
        "overall_timeout",
        "pause_cap_reached",
        "devtools",
    }:
        attempt.needs_admin_review = True
    soft = sum(1 for f in flags if f.get("code") in {"tab_blur", "focus_loss", "visibility_hidden"})
    threshold = 5
    try:
        # Optional per-attempt override from snapshot metadata if present later
        threshold = int(getattr(attempt, "_anomaly_review_threshold", 5) or 5)
    except Exception:
        threshold = 5
    if soft >= threshold:
        attempt.needs_admin_review = True
    try:
        # JSON/mutable column: mark dirty so SQLAlchemy persists in-place list edits.
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(attempt, "anomaly_flags")
    except Exception:
        pass


def overall_deadline(attempt) -> datetime:
    started = as_utc(attempt.started_at)
    minutes = getattr(attempt, "_time_limit_minutes", None) or settings.EXAM_TIME_LIMIT_MINUTES
    grace = getattr(attempt, "_submit_grace_minutes", None) or settings.EXAM_SUBMIT_GRACE_MINUTES
    # Overall ceiling keeps running during disconnect pauses.
    return started + timedelta(minutes=minutes + grace)


def overall_remaining_seconds(attempt, *, now: Optional[datetime] = None) -> int:
    now = now or now_utc()
    rem = int((overall_deadline(attempt) - now).total_seconds())
    return max(0, rem)


def question_deadline(attempt, *, now: Optional[datetime] = None) -> datetime:
    """Active question deadline; paused time does not consume the 90s."""
    now = now or now_utc()
    started = as_utc(attempt.question_started_at or attempt.started_at)
    secs = attempt.seconds_per_question or settings.EXAM_SECONDS_PER_QUESTION
    if attempt.paused_at:
        # While paused, freeze remaining 90s (elapsed before pause already spent).
        paused_at = as_utc(attempt.paused_at)
        elapsed = max(0.0, (paused_at - started).total_seconds())
        remaining = max(0.0, secs - elapsed)
        return now + timedelta(seconds=remaining)
    return started + timedelta(seconds=secs)


def question_remaining_seconds(attempt, *, now: Optional[datetime] = None) -> int:
    now = now or now_utc()
    if attempt.paused_at:
        return int((question_deadline(attempt, now=now) - now).total_seconds())
    rem = int((question_deadline(attempt, now=now) - now).total_seconds())
    return max(0, rem)


def begin_question_clock(attempt) -> None:
    attempt.question_started_at = now_utc()
    attempt.paused_at = None


def pause_attempt(attempt, *, reason: str = "disconnect") -> None:
    if attempt.submitted_at or attempt.paused_at:
        return
    attempt.paused_at = now_utc()
    append_anomaly(attempt, reason, "Attempt paused; per-question clock frozen")


def unpause_attempt(attempt) -> int:
    """Clear pause and extend question_started_at by pause duration. Returns pause seconds applied."""
    if not attempt.paused_at:
        return 0
    now = now_utc()
    paused_at = as_utc(attempt.paused_at)
    pause_secs = max(0, int((now - paused_at).total_seconds()))
    already = attempt.total_pause_seconds or 0
    cap = getattr(attempt, "_max_disconnect_pause_seconds", None) or settings.EXAM_MAX_DISCONNECT_PAUSE_SECONDS
    remaining_cap = max(0, cap - already)
    applied = min(pause_secs, remaining_cap)
    if pause_secs > remaining_cap:
        append_anomaly(
            attempt,
            "pause_cap_reached",
            f"Disconnect pause capped at {cap}s total; excess {pause_secs - applied}s not credited",
        )
    # Credit pause by shifting question_started_at forward (capped).
    if attempt.question_started_at and applied:
        attempt.question_started_at = as_utc(attempt.question_started_at) + timedelta(seconds=applied)
    attempt.total_pause_seconds = already + applied
    attempt.paused_at = None
    append_anomaly(attempt, "reconnect", f"Resumed after {pause_secs}s disconnect ({applied}s credited)")
    return applied


def score_attempt(attempt) -> tuple[int, bool, int]:
    """Compare answers to shuffled display letters in the snapshot (not bank originals)."""
    snapshot = attempt.question_snapshot or []
    answers = attempt.answers or {}
    correct = 0
    for item in snapshot:
        qid = str(item["id"])
        if answers.get(qid) == item.get("correct_option"):
            correct += 1
    total = len(snapshot)
    score = int((correct / total) * 100) if total else 0
    pass_mark = settings.EXAM_PASS_MARK
    return score, score >= pass_mark, pass_mark
