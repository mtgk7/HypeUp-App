from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging
import httpx

from app.config import get_settings
from app.routers import auth, services, orders, admin, payment, notifications, telegram_bot
from app.services.currency_service import get_current_rate
from app.services.jap_sync_service import sync_order_statuses
from app.services.pricing_service import calculate_hypeup_price
from app.services.jap_service import get_jap_client
from app.database import get_supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Yardımcı: gerçek piyasa kurunu çek
# ──────────────────────────────────────────────
async def _fetch_market_rate() -> float | None:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get("https://api.exchangerate-api.com/v4/latest/USD")
            data = r.json()
            return float(data["rates"]["TRY"])
    except Exception as e:
        logger.warning(f"[Kur] Piyasa kuru alınamadı: {e}")
        return None


# ──────────────────────────────────────────────
# Akıllı kur + fiyat güncelleme
# ──────────────────────────────────────────────
async def smart_rate_check():
    """
    Gerçek piyasa kuru ≥ DB'deki kurumuz ise
    yeni_kur = piyasa_kuru × 1.04 uygula ve tüm fiyatları güncelle.
    """
    from app.services.telegram_service import send_telegram
    try:
        market_rate = await _fetch_market_rate()
        if not market_rate:
            return

        db = get_supabase()
        row = db.table("settings").select("value").eq("key", "dolar_kuru").limit(1).execute()
        our_rate = float(row.data[0]["value"]) if row.data else get_current_rate()

        logger.info(f"[KurKontrol] Piyasa: ₺{market_rate:.2f} — Bizim: ₺{our_rate:.2f}")

        if market_rate >= our_rate:
            new_rate = round(market_rate * 1.04, 2)
            db.table("settings").upsert(
                {"key": "dolar_kuru", "value": str(new_rate)}, on_conflict="key"
            ).execute()

            # Tüm fiyatları güncelle
            svc_rows = db.table("services").select("id, jap_dolar_price").eq("is_active", True).execute().data
            updated = 0
            BATCH = 200
            payload = []
            for svc in svc_rows:
                if not svc.get("jap_dolar_price"):
                    continue
                payload.append({"id": svc["id"], "hypeup_tl_price": calculate_hypeup_price(float(svc["jap_dolar_price"]), new_rate)})
            for i in range(0, len(payload), BATCH):
                db.table("services").upsert(payload[i:i+BATCH]).execute()
                updated += len(payload[i:i+BATCH])

            logger.warning(f"[KurKontrol] ⚠️ Kur güncellendi: ₺{our_rate:.2f} → ₺{new_rate:.2f}")
            await send_telegram(
                f"⚠️ <b>Otomatik Kur Koruması Devreye Girdi</b>\n"
                f"📈 Piyasa kuru ₺{market_rate:.2f} bizim kurumuzu aştı\n"
                f"🔄 Yeni kur: ₺{new_rate:.2f} (piyasa +%4)\n"
                f"✅ {updated} servis fiyatı güncellendi"
            )
        else:
            logger.info(f"[KurKontrol] Kur koruması gerekmedi (piyasa < bizim kur)")
    except Exception as e:
        logger.error(f"[KurKontrol] Hata: {e}")


# ──────────────────────────────────────────────
# Servis + kur tam senkronizasyon
# ──────────────────────────────────────────────
async def full_sync():
    """Kur kontrol et, gerekirse güncelle, sonra servisleri sync yap."""
    from app.services.telegram_service import send_telegram
    try:
        logger.info("[FullSync] Başlıyor...")

        # 1. Akıllı kur kontrolü
        await smart_rate_check()

        # 2. Servis sync
        prm4u = get_jap_client()
        db = get_supabase()
        dolar_kuru = get_current_rate()

        prm4u_services = await prm4u.get_services()
        cat_rows = db.table("categories").select("id, platform_name").execute().data
        platform_to_cat: dict = {}
        for row in cat_rows:
            platform_to_cat.setdefault(row["platform_name"], row["id"])

        from app.routers.admin import _guess_platform, ACTIVE_PLATFORMS
        rows, skipped, skipped_ids = [], 0, []
        for svc in prm4u_services:
            try:
                svc_id   = int(svc.get("service") or svc.get("id", 0))
                name     = svc.get("name", "")
                dolar_pr = float(str(svc.get("rate", "0")).replace(",", "."))
                platform = _guess_platform(name)
                cat_id   = platform_to_cat.get(platform)
                if not cat_id:
                    skipped += 1
                    skipped_ids.append(svc_id)
                    continue
                rows.append({
                    "jap_service_id": svc_id,
                    "category_id": cat_id,
                    "service_name": name,
                    "jap_dolar_price": dolar_pr,
                    "hypeup_tl_price": calculate_hypeup_price(dolar_pr, dolar_kuru),
                    "min_order": int(svc.get("min", 100)),
                    "max_order": int(svc.get("max", 100000)),
                    "description": svc.get("description", ""),
                    "is_active": platform in ACTIVE_PLATFORMS,
                })
            except Exception:
                skipped += 1

        BATCH, synced = 200, 0
        for i in range(0, len(rows), BATCH):
            chunk = rows[i:i+BATCH]
            try:
                db.table("services").upsert(chunk, on_conflict="jap_service_id").execute()
                synced += len(chunk)
            except Exception as e:
                logger.warning(f"[FullSync] Batch hatası: {e}")
                skipped += len(chunk)

        # Aktif olmayan kategorilerdeki tüm servisleri pasif yap
        inactive_cat_ids = [cat_id for platform, cat_id in platform_to_cat.items() if platform not in ACTIVE_PLATFORMS]
        if inactive_cat_ids:
            DEACT_BATCH = 100
            for i in range(0, len(inactive_cat_ids), DEACT_BATCH):
                try:
                    db.table("services").update({"is_active": False}).in_("category_id", inactive_cat_ids[i:i+DEACT_BATCH]).execute()
                except Exception as e:
                    logger.warning(f"[FullSync] Pasif yapma hatası: {e}")
            logger.info(f"[FullSync] Aktif olmayan {len(inactive_cat_ids)} kategorinin servisleri pasif yapıldı")

        logger.info(f"[FullSync] Tamamlandı: {synced} güncellendi, {skipped} atlandı, kur ₺{dolar_kuru:.2f}")
        await send_telegram(
            f"🔄 <b>Otomatik Senkronizasyon</b>\n"
            f"✅ {synced} servis güncellendi\n"
            f"💱 Kur: ₺{dolar_kuru:.2f}"
        )
        # Sağlayıcı bakiyesini de kontrol et (düşükse uyar)
        await check_provider_balance()
    except Exception as e:
        logger.error(f"[FullSync] Hata: {e}")
        await send_telegram(f"🛑 <b>Otomatik Senkronizasyon Hatası</b>\n{str(e)[:300]}")


# ──────────────────────────────────────────────
# Sağlayıcı bakiye kontrolü + günlük özet
# ──────────────────────────────────────────────
PROVIDER_BALANCE_THRESHOLD = 10.0  # USD — altına inince uyar


async def check_provider_balance():
    """PRM4U bakiyesi eşik altına inince Telegram'dan uyar."""
    from app.services.telegram_service import send_telegram
    try:
        bal = await get_jap_client().get_balance()
        raw = bal.get("balance", bal) if isinstance(bal, dict) else bal
        amount = float(str(raw).replace(",", "."))
        if amount < PROVIDER_BALANCE_THRESHOLD:
            await send_telegram(
                f"🔴 <b>Sağlayıcı Bakiyesi Düşük</b>\n"
                f"💵 PRM4U: ${amount:.2f}\n"
                f"⚠️ Eşik ${PROVIDER_BALANCE_THRESHOLD:.0f} altında — bakiye yükle, "
                f"yoksa siparişler iletilemez."
            )
    except Exception as e:
        logger.warning(f"[ProviderBalance] Kontrol hatası: {e}")


async def send_daily_summary():
    """Son 24 saatin ciro/kâr/üye özeti + takılan sipariş uyarısı."""
    from app.services.telegram_service import send_telegram
    from datetime import datetime, timezone, timedelta
    db = get_supabase()
    rate = get_current_rate()
    since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    orders = db.table("orders").select("charge_tl, cost_dolar").gte("created_at", since).execute().data or []
    pays = db.table("payment_transactions").select("amount_tl").eq("status", "completed").gte("created_at", since).execute().data or []
    users = db.table("users").select("id").gte("created_at", since).execute().data or []
    revenue = sum(float(o["charge_tl"]) for o in orders)
    cost_tl = sum(float(o["cost_dolar"]) for o in orders) * rate
    deposits = sum(float(p["amount_tl"]) for p in pays)
    stuck = db.table("orders").select("id", count="exact").eq("status", "processing").lt(
        "created_at", (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    ).execute()
    stuck_n = stuck.count or 0
    msg = (
        f"📊 <b>Günlük Özet</b> (son 24 saat)\n"
        f"🛒 Sipariş: {len(orders)}\n"
        f"💰 Ciro: ₺{revenue:.2f}\n"
        f"💵 Maliyet: ₺{cost_tl:.2f}\n"
        f"📈 Net kâr: ₺{revenue - cost_tl:.2f}\n"
        f"🏦 Yüklenen bakiye: ₺{deposits:.2f}\n"
        f"👥 Yeni üye: {len(users)}\n"
        f"💱 Kur: ₺{rate:.2f}"
    )
    if stuck_n:
        msg += f"\n\n⏳ <b>{stuck_n} sipariş 24 saattir 'processing'</b> — kontrol et."
    await send_telegram(msg)


async def check_prm4u_service_ids():
    """
    ALLOWED_JAP_SERVICE_IDS listesindeki servis ID'lerini PRM4U'da doğrula.
    Geçersiz ID varsa Telegram'a uyarı gönder.
    """
    from app.services.telegram_service import send_telegram
    from app.routers.services import ALLOWED_JAP_SERVICE_IDS
    s = get_settings()
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(s.PRM4U_API_URL, data={"key": s.PRM4U_API_KEY, "action": "services"})
            all_services = r.json()
        valid_ids = {int(svc["service"]) for svc in all_services if "service" in svc}
        invalid = [sid for sid in ALLOWED_JAP_SERVICE_IDS if sid not in valid_ids]
        if invalid:
            ids_str = ", ".join(str(i) for i in invalid)
            await send_telegram(
                f"⚠️ <b>PRM4U Servis ID Uyarısı</b>\n"
                f"Şu ID'ler artık PRM4U'da bulunamıyor:\n"
                f"<code>{ids_str}</code>\n\n"
                f"Siparişler bu servislerde başarısız olur. "
                f"pricing_service.py ve services.py güncellenmeli!"
            )
            logger.warning(f"[PRM4U-IDCheck] Geçersiz servis ID'leri: {invalid}")
        else:
            logger.info(f"[PRM4U-IDCheck] Tüm {len(ALLOWED_JAP_SERVICE_IDS)} servis ID geçerli.")
    except Exception as e:
        logger.error(f"[PRM4U-IDCheck] Hata: {e}")


async def prm4u_id_check_loop():
    """Her gün TR saatiyle 10:00'da PRM4U servis ID kontrolü yap."""
    from datetime import datetime, timedelta
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo("Europe/Istanbul")
    except Exception:
        tz = None
    while True:
        now = datetime.now(tz) if tz else datetime.now()
        target = now.replace(hour=10, minute=0, second=0, microsecond=0)
        if target <= now:
            target += timedelta(days=1)
        await asyncio.sleep((target - now).total_seconds())
        try:
            await check_prm4u_service_ids()
        except Exception as e:
            logger.error(f"[PRM4U-IDCheck] Döngü hatası: {e}")


async def daily_summary_loop():
    """Her gün TR saatiyle 21:00'de günlük özet gönder."""
    from datetime import datetime, timedelta
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo("Europe/Istanbul")
    except Exception:
        tz = None
    while True:
        now = datetime.now(tz) if tz else datetime.now()
        target = now.replace(hour=21, minute=0, second=0, microsecond=0)
        if target <= now:
            target += timedelta(days=1)
        await asyncio.sleep((target - now).total_seconds())
        try:
            await send_daily_summary()
        except Exception as e:
            logger.error(f"[DailySummary] Hata: {e}")


# ──────────────────────────────────────────────
# Scheduler döngüleri
# ──────────────────────────────────────────────
async def order_sync_loop():
    """Her saat sipariş durumlarını senkronize et."""
    while True:
        await asyncio.sleep(60 * 60)
        try:
            await sync_order_statuses()
        except Exception as e:
            logger.error(f"[Scheduler] Sipariş sync hatası: {e}")
            from app.services.telegram_service import send_telegram
            await send_telegram(f"🛑 <b>Sipariş Senkronizasyon Hatası</b>\n{str(e)[:300]}")


async def twice_daily_sync_loop():
    """
    Günde 2 kez (12 saatte bir) full sync yap.
    Kur kontrolü smart_rate_check içinde yapılır:
      - Piyasa kuru >= bizim kur → kur × 1.04 uygula + fiyatları güncelle + bildirim
      - Piyasa kuru < bizim kur → dokunma (manuel kuru koru)
    """
    while True:
        await asyncio.sleep(60 * 60 * 12)
        await full_sync()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services.telegram_service import send_telegram
    # Startup bildirimi (deploy/restart doğrulaması)
    asyncio.create_task(send_telegram("✅ <b>Backend canlı</b>\nHypeUp API başlatıldı (deploy/restart)."))
    # Startup: arka planda full sync (kur kontrolü + sağlayıcı bakiye dahil)
    # NOT: currency_refresh_loop kaldırıldı — smart_rate_check yönetiyor
    asyncio.create_task(full_sync())

    # Arka plan döngüler
    task1 = asyncio.create_task(order_sync_loop())
    task2 = asyncio.create_task(twice_daily_sync_loop())
    task3 = asyncio.create_task(daily_summary_loop())
    task4 = asyncio.create_task(prm4u_id_check_loop())

    yield

    task1.cancel()
    task2.cancel()
    task3.cancel()
    task4.cancel()


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

app.include_router(auth.router,          prefix="/api/v1")
app.include_router(services.router,      prefix="/api/v1")
app.include_router(orders.router,        prefix="/api/v1")
app.include_router(admin.router,         prefix="/api/v1")
app.include_router(payment.router,       prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(telegram_bot.router,  prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "HypeUp API çalışıyor 🚀", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
