"""Simple per-process rate limiter for auth/public endpoints.

In-memory only — resets on restart and does not share state across replicas.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request


class SlidingWindowLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str, limit: int, window_seconds: int = 60) -> None:
        if limit <= 0:
            return
        now = time.monotonic()
        with self._lock:
            bucket = self._hits[key]
            cutoff = now - window_seconds
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if len(bucket) >= limit:
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please try again shortly.",
                )
            bucket.append(now)


limiter = SlidingWindowLimiter()


def client_ip(request: Request) -> str:
    # Prefer X-Forwarded-For when behind a trusted proxy; first hop is the client.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"
