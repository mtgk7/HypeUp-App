from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import OrderCreateRequest, OrderOut
from app.database import get_supabase
from app.utils.auth import get_current_user
from app.services.jap_service import get_jap_client
from app.services.pricing_service import calculate_order_cost, get_tier_price
from app.services.currency_service import get_current_rate
from app.services.telegram_service import send_telegram
from app.routers.notifications import create_notification
from datetime import datetime, timezone
import logging

router = APIRouter(prefix="/orders", tags=["Orders"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(body: OrderCreateRequest, user: dict = Depends(get_current_user)):
    db = get_supabase()

    # 1. Servisi al
    svc_result = db.table("services").select("*, categories(platform_name)").eq("id", body.service_id).eq("is_active", True).limit(1).execute()
    if not svc_result.data:
        raise HTTPException(status_code=404, detail="Servis bulunamadı veya aktif değil")

    svc = svc_result.data[0]

    # 2. Min/Max kontrol
    if body.quantity < svc["min_order"]:
        raise HTTPException(status_code=400, detail=f"Minimum sipariş adedi: {svc['min_order']}")
    if body.quantity > svc["max_order"]:
        raise HTTPException(status_code=400, detail=f"Maksimum sipariş adedi: {svc['max_order']}")

    # 3. Fiyat hesapla (tier varsa tier fiyatı, yoksa flat)
    dolar_kuru = get_current_rate()
    tier_price = get_tier_price(int(svc["jap_service_id"]), body.quantity)
    effective_tl_per_1000 = tier_price if tier_price is not None else float(svc["hypeup_tl_price"])
    costs = calculate_order_cost(
        jap_dolar_per_1000=float(svc["jap_dolar_price"]),
        hypeup_tl_per_1000=effective_tl_per_1000,
        quantity=body.quantity,
        dolar_kuru=dolar_kuru,
    )
    charge_tl = costs["charge_tl"]
    cost_dolar = costs["cost_dolar"]

    # 4. Bakiye yeterli mi?
    user_balance = float(user["balance"])
    if user_balance < charge_tl:
        raise HTTPException(
            status_code=402,
            detail=f"Yetersiz bakiye. Gereken: {charge_tl:.2f} TL, Mevcut: {user_balance:.2f} TL"
        )

    # 5. Bakiyeyi düş
    new_balance = round(user_balance - charge_tl, 4)
    db.table("users").update({"balance": new_balance}).eq("id", user["id"]).execute()

    # 6. Siparişi DB'ye pending olarak kaydet
    order_insert = db.table("orders").insert({
        "user_id": user["id"],
        "service_id": body.service_id,
        "target_link": body.target_link,
        "quantity": body.quantity,
        "cost_dolar": cost_dolar,
        "charge_tl": charge_tl,
        "status": "pending",
    }).execute()

    order = order_insert.data[0]

    # 7. JAP'a sipariş gönder (hata olursa bakiye iade + iptal)
    try:
        jap = get_jap_client()
        jap_response = await jap.add_order(
            service_id=svc["jap_service_id"],
            link=body.target_link,
            quantity=body.quantity,
        )
        jap_order_id = jap_response.get("order")

        # Durumu processing'e çek ve JAP ID'yi kaydet
        db.table("orders").update({
            "jap_order_id": jap_order_id,
            "status": "processing",
        }).eq("id", order["id"]).execute()

        order["jap_order_id"] = jap_order_id
        order["status"] = "processing"

    except Exception as e:
        logger.error(f"[Orders] PRM4U hatası, bakiye iade ediliyor: {e}")
        db.table("users").update({"balance": user_balance}).eq("id", user["id"]).execute()
        db.table("orders").update({"status": "cancelled"}).eq("id", order["id"]).execute()
        order["status"] = "cancelled"
        create_notification(
            user["id"],
            "Sipariş İletilemedi",
            f"{svc.get('service_name', 'Siparişin')} sağlayıcıya iletilemedi, ₺{charge_tl:.2f} bakiyene iade edildi.",
            "error",
        )
        raise HTTPException(
            status_code=502,
            detail="Sipariş sağlayıcıya iletilemedi, bakiyeniz iade edildi. Lütfen tekrar deneyin."
        )

    cat = svc.get("categories") or {}

    # Telegram bildirimi
    await send_telegram(
        f"🛒 <b>Yeni Sipariş</b>\n"
        f"👤 {user['email']}\n"
        f"📦 {svc.get('service_name', '?')} ({cat.get('platform_name', '?')})\n"
        f"🔢 {body.quantity:,} adet\n"
        f"💰 ₺{charge_tl:.2f}"
    )

    return OrderOut(
        **order,
        service_name=svc.get("service_name"),
        platform_name=cat.get("platform_name"),
    )


@router.get("/", response_model=list[OrderOut])
async def list_my_orders(user: dict = Depends(get_current_user)):
    """Kullanıcının kendi sipariş geçmişi."""
    db = get_supabase()
    result = (
        db.table("orders")
        .select("*, services(service_name, categories(platform_name))")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )

    orders = []
    for row in result.data:
        svc = row.pop("services", {}) or {}
        cat = svc.get("categories") or {}
        orders.append(OrderOut(
            **row,
            service_name=svc.get("service_name"),
            platform_name=cat.get("platform_name"),
        ))
    return orders


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    db = get_supabase()
    result = (
        db.table("orders")
        .select("*, services(service_name, categories(platform_name))")
        .eq("id", order_id)
        .eq("user_id", user["id"])
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    row = result.data[0]
    svc = row.pop("services", {}) or {}
    cat = svc.get("categories") or {}
    return OrderOut(**row, service_name=svc.get("service_name"), platform_name=cat.get("platform_name"))
