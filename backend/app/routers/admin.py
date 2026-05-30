from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import AdminStatsResponse, UserBalanceUpdate, UserOut, CurrencyRateResponse, OrderStatusUpdate, ServiceUpdate
from typing import Optional
from app.database import get_supabase
from app.utils.auth import require_admin
from app.services.currency_service import refresh_currency_rate, get_current_rate
from app.services.jap_service import get_jap_client
from app.services.pricing_service import calculate_hypeup_price
from app.routers.notifications import create_notification
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import logging

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(_admin: dict = Depends(require_admin)):
    """Toplam ciro, maliyet ve kâr özeti."""
    db = get_supabase()
    dolar_kuru = get_current_rate()

    orders_result = db.table("orders").select("charge_tl, cost_dolar, status").execute()
    rows = orders_result.data or []

    total_revenue = sum(float(r["charge_tl"]) for r in rows)
    total_cost_dolar = sum(float(r["cost_dolar"]) for r in rows)
    total_cost_tl = round(total_cost_dolar * dolar_kuru, 2)
    net_profit = round(total_revenue - total_cost_tl, 2)

    pending = sum(1 for r in rows if r["status"] == "pending")

    return AdminStatsResponse(
        total_revenue_tl=round(total_revenue, 2),
        total_cost_tl=total_cost_tl,
        net_profit_tl=net_profit,
        total_orders=len(rows),
        pending_orders=pending,
        dolar_kuru=dolar_kuru,
    )


@router.get("/users", response_model=list[UserOut])
async def list_users(_admin: dict = Depends(require_admin)):
    db = get_supabase()
    result = db.table("users").select("*").order("created_at", desc=True).execute()
    return [UserOut(**u) for u in result.data]


@router.patch("/users/balance", response_model=UserOut)
async def update_balance(body: UserBalanceUpdate, _admin: dict = Depends(require_admin)):
    """Kullanıcının bakiyesini manuel olarak artır/azalt."""
    db = get_supabase()

    user_result = db.table("users").select("*").eq("id", body.user_id).limit(1).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    user = user_result.data[0]
    new_balance = round(float(user["balance"]) + body.amount, 4)

    if new_balance < 0:
        raise HTTPException(status_code=400, detail="Bakiye 0'ın altına düşemez")

    updated = db.table("users").update({"balance": new_balance}).eq("id", body.user_id).execute()
    return UserOut(**updated.data[0])


@router.post("/currency/refresh", response_model=CurrencyRateResponse)
async def refresh_rate(_admin: dict = Depends(require_admin)):
    """Döviz kurunu manuel olarak güncelle."""
    rate = await refresh_currency_rate()
    return CurrencyRateResponse(
        rate=rate,
        source="API",
        updated_at=datetime.now(timezone.utc),
    )


@router.get("/prm4u/services")
async def list_prm4u_services(_admin: dict = Depends(require_admin)):
    """
    PRM4U'dan tüm servis listesini çek — eşleştirme için kullan.
    API key alındıktan sonra buradan ID'leri görüp Supabase'e girebilirsin.
    """
    prm4u = get_jap_client()
    try:
        services = await prm4u.get_services()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"PRM4U bağlantı hatası: {e}")

    # Platform'a göre grupla, kolay taramak için
    grouped: dict = {}
    for svc in services:
        name = svc.get("name", "")
        platform = _guess_platform(name)
        grouped.setdefault(platform, []).append({
            "id": svc.get("service") or svc.get("id"),
            "name": name,
            "rate_per_1000_usd": svc.get("rate"),
            "min": svc.get("min"),
            "max": svc.get("max"),
        })

    return {"total": len(services), "grouped": grouped}


@router.get("/prm4u/balance")
async def get_prm4u_balance(_admin: dict = Depends(require_admin)):
    """PRM4U bakiyesini kontrol et."""
    prm4u = get_jap_client()
    try:
        return await prm4u.get_balance()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"PRM4U hatası: {e}")


@router.post("/services/sync-prm4u")
async def sync_prm4u_services(_admin: dict = Depends(require_admin)):
    """
    PRM4U'dan tüm servisleri çekip veritabanına upsert et.
    Fiyatları otomatik hesaplar. Supabase'deki jap_service_id'ler PRM4U ID'si olmalı.
    """
    prm4u = get_jap_client()
    dolar_kuru = get_current_rate()
    db = get_supabase()

    try:
        prm4u_services = await prm4u.get_services()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"PRM4U bağlantı hatası: {e}")

    synced, skipped = 0, 0

    for svc in prm4u_services:
        try:
            svc_id = int(svc.get("service") or svc.get("id", 0))
            name = svc.get("name", "")
            rate_str = svc.get("rate", "0")
            min_qty = int(svc.get("min", 100))
            max_qty = int(svc.get("max", 100000))
            dolar_price = float(str(rate_str).replace(",", "."))

            hypeup_tl = calculate_hypeup_price(dolar_price, dolar_kuru)

            platform = _guess_platform(name)
            cat_result = db.table("categories").select("id").eq("platform_name", platform).limit(1).execute()
            cat_id = cat_result.data[0]["id"] if cat_result.data else None
            if not cat_id:
                skipped += 1
                continue

            db.table("services").upsert({
                "jap_service_id": svc_id,
                "category_id": cat_id,
                "service_name": name,
                "jap_dolar_price": dolar_price,
                "hypeup_tl_price": hypeup_tl,
                "min_order": min_qty,
                "max_order": max_qty,
                "description": svc.get("description", ""),
                "is_active": True,
            }, on_conflict="jap_service_id").execute()

            synced += 1
        except Exception as e:
            logger.warning(f"[SyncPRM4U] Servis atlandı: {e}")
            skipped += 1

    return {"synced": synced, "skipped": skipped, "dolar_kuru": dolar_kuru}


@router.post("/services/sync-jap")
async def sync_jap_services_legacy(_admin: dict = Depends(require_admin)):
    """Eski endpoint — sync-prm4u kullan."""
    return await sync_prm4u_services(_admin)


@router.get("/stats/chart")
async def stats_chart(days: int = 14, _admin: dict = Depends(require_admin)):
    """Son N günün günlük gelir, sipariş sayısı ve yükleme verisi."""
    db = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    orders_res   = db.table("orders").select("created_at, charge_tl").gte("created_at", since).execute()
    payments_res = db.table("payment_transactions").select("created_at, amount_tl").eq("status", "completed").gte("created_at", since).execute()

    daily_revenue  = defaultdict(float)
    daily_orders   = defaultdict(int)
    daily_deposits = defaultdict(float)

    for o in (orders_res.data or []):
        d = o["created_at"][:10]
        daily_revenue[d]  += float(o["charge_tl"])
        daily_orders[d]   += 1

    for p in (payments_res.data or []):
        d = p["created_at"][:10]
        daily_deposits[d] += float(p["amount_tl"])

    result = []
    for i in range(days - 1, -1, -1):
        date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        result.append({
            "date":     date,
            "revenue":  round(daily_revenue.get(date, 0), 2),
            "orders":   daily_orders.get(date, 0),
            "deposits": round(daily_deposits.get(date, 0), 2),
        })

    return result


@router.get("/orders")
async def list_all_orders(
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    _admin: dict = Depends(require_admin),
):
    """Tüm siparişler — kullanıcı e-postası ve servis adıyla birlikte."""
    db = get_supabase()
    query = (
        db.table("orders")
        .select("*, users(email), services(service_name, categories(platform_name))")
        .order("created_at", desc=True)
        .limit(limit)
        .offset(offset)
    )
    if status:
        query = query.eq("status", status)

    result = query.execute()
    orders = []
    for row in result.data:
        user = row.pop("users", {}) or {}
        svc  = row.pop("services", {}) or {}
        cat  = (svc.get("categories") or {})
        orders.append({
            **row,
            "user_email":   user.get("email"),
            "service_name": svc.get("service_name"),
            "platform_name": cat.get("platform_name"),
        })
    return orders


@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, body: OrderStatusUpdate, _admin: dict = Depends(require_admin)):
    db = get_supabase()
    order_result = db.table("orders").select("user_id, quantity, services(service_name)").eq("id", order_id).limit(1).execute()
    if not order_result.data:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    order = order_result.data[0]
    result = db.table("orders").update({"status": body.status}).eq("id", order_id).execute()

    STATUS_NOTIF = {
        "completed":  ("Siparişin Tamamlandı ✅", "info", "success"),
        "cancelled":  ("Siparişin İptal Edildi", "Siparişin iptal edildi.", "error"),
        "refunded":   ("İade Yapıldı", "Siparişin iade edildi, bakiyen güncellendi.", "info"),
        "processing": ("Siparişin İşleme Alındı", "Siparişin işleme alındı.", "info"),
    }
    if body.status in STATUS_NOTIF:
        svc_name = (order.get("services") or {}).get("service_name", "Sipariş")
        title_tpl, msg_tpl, notif_type = STATUS_NOTIF[body.status]
        if body.status == "completed":
            msg = f"{svc_name} için {order['quantity']:,} adet siparişin tamamlandı."
        else:
            msg = msg_tpl
        create_notification(order["user_id"], title_tpl, msg, notif_type)

    return result.data[0]


@router.get("/services")
async def list_all_services(_admin: dict = Depends(require_admin)):
    db = get_supabase()
    result = (
        db.table("services")
        .select("*, categories(platform_name, category_name)")
        .order("service_name")
        .execute()
    )
    services = []
    for row in result.data:
        cat = row.pop("categories", {}) or {}
        services.append({**row, "platform_name": cat.get("platform_name"), "category_name": cat.get("category_name")})
    return services


@router.patch("/services/{service_id}")
async def update_service(service_id: str, body: ServiceUpdate, _admin: dict = Depends(require_admin)):
    db = get_supabase()
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Güncellenecek alan yok")
    result = db.table("services").update(update_data).eq("id", service_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Servis bulunamadı")
    return result.data[0]


@router.get("/payments")
async def list_all_payments(_admin: dict = Depends(require_admin)):
    db = get_supabase()
    result = (
        db.table("payment_transactions")
        .select("*, users(email)")
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    payments = []
    for row in result.data:
        user = row.pop("users", {}) or {}
        payments.append({**row, "user_email": user.get("email")})
    return payments


@router.patch("/users/{user_id}/toggle")
async def toggle_user_status(user_id: str, _admin: dict = Depends(require_admin)):
    db = get_supabase()
    result = db.table("users").select("is_active").eq("id", user_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    new_status = not result.data[0]["is_active"]
    updated = db.table("users").update({"is_active": new_status}).eq("id", user_id).execute()
    return UserOut(**updated.data[0])


def _guess_platform(name: str) -> str:
    n = name.lower()
    if "instagram" in n:            return "Instagram"
    if "tiktok" in n or "tik tok" in n: return "TikTok"
    if "youtube" in n:              return "YouTube"
    if "twitter" in n or "x follow" in n or "x like" in n or "x view" in n or "x retweet" in n: return "X"
    if "telegram" in n:             return "Telegram"
    if "facebook" in n:             return "Facebook"
    if "spotify" in n:              return "Spotify"
    if "threads" in n:              return "Threads"
    if "discord" in n:              return "Discord"
    if "linkedin" in n:             return "LinkedIn"
    if "pinterest" in n:            return "Pinterest"
    if "reddit" in n:               return "Reddit"
    if "snapchat" in n:             return "Snapchat"
    if "twitch" in n:               return "Twitch"
    if "soundcloud" in n:           return "SoundCloud"
    if " vk " in n or n.startswith("vk ") or "vk." in n: return "VK"
    if "kick.com" in n or "kick follow" in n or "kick view" in n: return "Kick"
    if "shazam" in n:               return "Shazam"
    if "apple" in n or "itunes" in n or "app store" in n: return "Apple"
    return "Diger"
