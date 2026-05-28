from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging

from app.config import get_settings
from app.routers import auth, services, orders, admin, payment, notifications
from app.services.currency_service import refresh_currency_rate
from app.services.jap_sync_service import sync_order_statuses

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
        await asyncio.sleep(60 * 60 * 24)


async def jap_sync_loop():
    """Her saat JAP sipariş durumlarını senkronize et."""
    while True:
        await asyncio.sleep(60 * 60)  # İlk çalışma 1 saat sonra
        try:
            await sync_order_statuses()
        except Exception as e:
            logger.error(f"[Scheduler] JAP sync hatası: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Başlangıçta kuru güncelle
    try:
        rate = await refresh_currency_rate()
        logger.info(f"[Startup] Başlangıç döviz kuru: {rate}")
    except Exception as e:
        logger.warning(f"[Startup] Döviz kuru alınamadı: {e}")

    # Arka plan görevler
    task1 = asyncio.create_task(currency_refresh_loop())
    task2 = asyncio.create_task(jap_sync_loop())

    yield

    task1.cancel()
    task2.cancel()


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
app.include_router(payment.router,       prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "HypeUp API çalışıyor 🚀", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
