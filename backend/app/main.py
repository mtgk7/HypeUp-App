from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging

from app.config import get_settings
from app.routers import auth, services, orders, admin
from app.services.currency_service import refresh_currency_rate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Startup / Shutdown
# ──────────────────────────────────────────────

async def currency_refresh_loop():
    """Her 24 saatte bir döviz kurunu güncelle."""
    while True:
        try:
            rate = await refresh_currency_rate()
            logger.info(f"[Scheduler] Döviz kuru güncellendi: {rate}")
        except Exception as e:
            logger.error(f"[Scheduler] Kur güncelleme hatası: {e}")
        await asyncio.sleep(60 * 60 * 24)  # 24 saat


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Başlangıçta kuru güncelle
    try:
        rate = await refresh_currency_rate()
        logger.info(f"[Startup] Başlangıç döviz kuru: {rate}")
    except Exception as e:
        logger.warning(f"[Startup] Döviz kuru alınamadı: {e}")

    # Arka plan görev
    task = asyncio.create_task(currency_refresh_loop())

    yield

    task.cancel()


# ──────────────────────────────────────────────
# App
# ──────────────────────────────────────────────

s = get_settings()

app = FastAPI(
    title="HypeUp SMM Panel API",
    version="1.0.0",
    description="Otomatik kâr marjlı SMM Panel Backend",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=s.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları kaydet
app.include_router(auth.router,     prefix="/api/v1")
app.include_router(services.router, prefix="/api/v1")
app.include_router(orders.router,   prefix="/api/v1")
app.include_router(admin.router,    prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "HypeUp API çalışıyor 🚀", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
