from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging

from app.config import get_settings
from app.routers import auth, services, orders, admin, payment, notifications, telegram_bot
from app.services.currency_service import refresh_currency_rate, get_current_rate
from app.services.jap_sync_service import sync_order_statuses
from app.services.pricing_service import calculate_hypeup_price
from app.services.jap_service import get_jap_client
from app.database import get_supabase

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


async def order_sync_loop():
    """Her saat PRM4U sipariş durumlarını senkronize et."""
    while True:
        await asyncio.sleep(60 * 60)
        try:
            await sync_order_statuses()
        except Exception as e:
            logger.error(f"[Scheduler] PRM4U sync hatası: {e}")


async def auto_service_sync():
    """Sağlayıcıdan fiyat/servis değişikliklerini çek ve DB'ye uygula."""
    from app.services.telegram_service import send_telegram
    try:
        logger.info("[AutoSync] Servis senkronizasyonu başlıyor...")
        prm4u = get_jap_client()
        db = get_supabase()
        dolar_kuru = get_current_rate()

        prm4u_services = await prm4u.get_services()

        cat_rows = db.table("categories").select("id, platform_name").execute().data
        platform_to_cat: dict = {}
        for row in cat_rows:
            platform_to_cat.setdefault(row["platform_name"], row["id"])

        from app.routers.admin import _guess_platform
        rows, skipped = [], 0
        for svc in prm4u_services:
            try:
                svc_id   = int(svc.get("service") or svc.get("id", 0))
                name     = svc.get("name", "")
                dolar_pr = float(str(svc.get("rate", "0")).replace(",", "."))
                min_qty  = int(svc.get("min", 100))
                max_qty  = int(svc.get("max", 100000))
                cat_id   = platform_to_cat.get(_guess_platform(name))
                if not cat_id:
                    skipped += 1
                    continue
                rows.append({
                    "jap_service_id": svc_id,
                    "category_id": cat_id,
                    "service_name": name,
                    "jap_dolar_price": dolar_pr,
                    "hypeup_tl_price": calculate_hypeup_price(dolar_pr, dolar_kuru),
                    "min_order": min_qty,
                    "max_order": max_qty,
                    "description": svc.get("description", ""),
                    "is_active": True,
                })
            except Exception:
                skipped += 1

        BATCH = 200
        synced = 0
        for i in range(0, len(rows), BATCH):
            chunk = rows[i:i + BATCH]
            try:
                db.table("services").upsert(chunk, on_conflict="jap_service_id").execute()
                synced += len(chunk)
            except Exception as e:
                logger.warning(f"[AutoSync] Batch hatası: {e}")
                skipped += len(chunk)

        logger.info(f"[AutoSync] Tamamlandı: {synced} güncellendi, {skipped} atlandı")
        await send_telegram(
            f"🔄 <b>Otomatik Servis Sync</b>\n"
            f"✅ {synced} servis güncellendi\n"
            f"⏭️ {skipped} atlandı\n"
            f"💱 Kur: ₺{dolar_kuru:.2f}"
        )
    except Exception as e:
        logger.error(f"[AutoSync] Hata: {e}")


async def daily_service_sync_loop():
    """Her 24 saatte bir servis sync yap."""
    while True:
        await asyncio.sleep(60 * 60 * 24)
        await auto_service_sync()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Başlangıçta kuru güncelle
    try:
        rate = await refresh_currency_rate()
        logger.info(f"[Startup] Başlangıç döviz kuru: {rate}")
    except Exception as e:
        logger.warning(f"[Startup] Döviz kuru alınamadı: {e}")

    # Startup: servis sync (her uyanışta fiyatları kontrol et)
    asyncio.create_task(auto_service_sync())

    # Arka plan görevler
    task1 = asyncio.create_task(currency_refresh_loop())
    task2 = asyncio.create_task(order_sync_loop())
    task3 = asyncio.create_task(daily_service_sync_loop())

    yield

    task1.cancel()
    task2.cancel()
    task3.cancel()


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
app.include_router(notifications.router,  prefix="/api/v1")
app.include_router(telegram_bot.router,   prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "HypeUp API çalışıyor 🚀", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
