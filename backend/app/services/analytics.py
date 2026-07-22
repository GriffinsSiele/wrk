"""Honest time-bucket analytics helpers for portal dashboards.

No decorative padding: empty buckets stay 0.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Iterable, List, Optional, Sequence, TypeVar

from app.schemas.admin import SeriesPoint

T = TypeVar("T")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def period_change(current: int, previous: int) -> str:
    """Format period-over-period change for KPI chips."""
    if previous <= 0:
        if current <= 0:
            return "0%"
        return "+100%"
    delta = round(((current - previous) / previous) * 100)
    if delta > 0:
        return f"+{delta}%"
    return f"{delta}%"


def checklist_score(flags: Sequence[bool]) -> int:
    """Equal-weight 0–100 score from boolean checklist items."""
    if not flags:
        return 0
    return round((sum(1 for f in flags if f) / len(flags)) * 100)


def _as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def count_in_range(dates: Iterable[Optional[datetime]], start: datetime, end: datetime) -> int:
    n = 0
    for d in dates:
        if d is None:
            continue
        ud = _as_utc(d)
        if start <= ud < end:
            n += 1
    return n


def weekly_bucket_counts(
    dates: Iterable[Optional[datetime]],
    *,
    weeks: int = 8,
    now: Optional[datetime] = None,
) -> List[SeriesPoint]:
    """Oldest → newest weekly counts for the last `weeks` full week windows ending at `now`."""
    now = now or utc_now()
    points: List[SeriesPoint] = []
    for i in range(weeks - 1, -1, -1):
        start = now - timedelta(weeks=i + 1)
        end = now - timedelta(weeks=i)
        label = f"W{weeks - i}"
        points.append(SeriesPoint(label=label, value=count_in_range(dates, start, end)))
    return points


def daily_bucket_counts(
    dates: Iterable[Optional[datetime]],
    *,
    days: int = 6,
    labels: Optional[Sequence[str]] = None,
    now: Optional[datetime] = None,
) -> List[SeriesPoint]:
    """Oldest → newest daily counts. Default labels Mon… for last `days` days ending today."""
    now = now or utc_now()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    default_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    points: List[SeriesPoint] = []
    for i in range(days - 1, -1, -1):
        start = today - timedelta(days=i)
        end = start + timedelta(days=1)
        if labels and len(labels) == days:
            label = labels[days - 1 - i]
        else:
            label = default_labels[start.weekday()]
        points.append(SeriesPoint(label=label, value=count_in_range(dates, start, end)))
    return points


def sparkline_from_weeks(
    dates: Iterable[Optional[datetime]],
    *,
    weeks: int = 6,
    now: Optional[datetime] = None,
) -> List[int]:
    return [p.value for p in weekly_bucket_counts(dates, weeks=weeks, now=now)]


def count_since(dates: Iterable[Optional[datetime]], start: datetime, end: datetime) -> int:
    return count_in_range(dates, start, end)


def series_from_values(labels: Sequence[str], values: Sequence[int]) -> List[SeriesPoint]:
    return [SeriesPoint(label=str(l), value=int(v)) for l, v in zip(labels, values)]
