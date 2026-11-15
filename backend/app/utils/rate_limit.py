"""
Basit, bağımlılıksız IP-bazlı rate limiter.
Render tek process çalıştığı için in-memory sözlük yeterli — process
restart'ta sayaçlar sıfırlanır (kabul edilebilir, zaten kısa pencereli).
"""

import time
from collections import defaultdict
from fastapi import Request, HTTPException

_hits: dict[str, list[float]] = defaultdict(list)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(key_prefix: str, max_requests: int, window_seconds: int):
    """Dependency factory: aynı IP'den pencere içinde max_requests'ten fazlasını 429 ile keser."""

    def dependency(request: Request):
        ip = _client_ip(request)
        key = f"{key_prefix}:{ip}"
        now = time.time()
        hits = _hits[key]
        hits[:] = [t for t in hits if now - t < window_seconds]
        if len(hits) >= max_requests:
            raise HTTPException(status_code=429, detail="Çok fazla istek, lütfen biraz sonra tekrar deneyin.")
        hits.append(now)

    return dependency
