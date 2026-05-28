from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import AdminStatsResponse, UserBalanceUpdate, UserOut, CurrencyRateResponse
from app.database import get_supabase
from app.utils.auth import require_admin
from app.services.currency_service import refresh_currency_rate, get_current_rate
from app.services.jap_service import get_jap_client
from app.services.pricing_service import calculate_hypeup_price
from datetime import datetime, timezone
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


@router.post("/services/sync-jap")
async def sync_jap_services(_admin: dict = Depends(require_admin)):
    """
    JAP'tan tüm servisleri çekip veritabanına upsert et.
    Fiyatları otomatik hesaplar.
    """
    jap = get_jap_client()
    dolar_kuru = get_current_rate()
    db = get_supabase()

    try:
        jap_services = await jap.get_services()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"JAP bağlantı hatası: {e}")

    synced, skipped = 0, 0

    for svc in jap_services:
        try:
            jap_id = int(svc.get("service") or svc.get("id", 0))
            name = svc.get("name", "")
            rate_str = svc.get("rate", "0")         # 1000 adet dolar fiyatı
            min_qty = int(svc.get("min", 100))
            max_qty = int(svc.get("max", 100000))
            jap_dolar = float(str(rate_str).replace(",", "."))

            hypeup_tl = calculate_hypeup_price(jap_dolar, dolar_kuru)

            # Category eşleştirme (servis adından platform tahmini)
            platform = _guess_platform(name)
            cat_result = db.table("categories").select("id").eq("platform_name", platform).limit(1).execute()
            cat_id = cat_result.data[0]["id"] if cat_result.data else None
            if not cat_id:
                skipped += 1
                continue

            db.table("services").upsert({
                "jap_service_id": jap_id,
                "category_id": cat_id,
                "service_name": name,
                "jap_dolar_price": jap_dolar,
                "hypeup_tl_price": hypeup_tl,
                "min_order": min_qty,
                "max_order": max_qty,
                "description": svc.get("description", ""),
                "is_active": True,
            }, on_conflict="jap_service_id").execute()

            synced += 1
        except Exception as e:
            logger.warning(f"[SyncJAP] Servis atlandı: {e}")
            skipped += 1

    return {"synced": synced, "skipped": skipped, "dolar_kuru": dolar_kuru}


def _guess_platform(name: str) -> str:
    name_lower = name.lower()
    if "instagram" in name_lower:
        return "Instagram"
    elif "tiktok" in name_lower or "tik tok" in name_lower:
        return "TikTok"
    elif "youtube" in name_lower:
        return "YouTube"
    elif "twitter" in name_lower or " x " in name_lower:
        return "X"
    return "Instagram"  # varsayılan
