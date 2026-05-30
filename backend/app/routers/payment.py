from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from app.models.schemas import PaymentInitRequest, PaymentInitResponse, PaymentTransactionOut, ManualPaymentRequest
from app.database import get_supabase
from app.utils.auth import get_current_user
from app.config import get_settings
from app.routers.notifications import create_notification
from app.services.telegram_service import send_telegram, send_telegram_with_buttons
import hmac
import hashlib
import base64
import uuid
import logging

router = APIRouter(prefix="/payment", tags=["Payment"])
logger = logging.getLogger(__name__)

SHOPIER_FORM_URL = "https://www.shopier.com/ShowProduct/api_pay4.php"


def _sign(data: str, secret: str) -> str:
    h = hmac.new(secret.encode("utf-8"), data.encode("utf-8"), hashlib.sha256)
    return base64.b64encode(h.digest()).decode("utf-8")


def _verify_callback(platform_order_id: str, installment_count: str, received: str, secret: str) -> bool:
    expected = _sign(f"{platform_order_id}{installment_count}", secret)
    return hmac.compare_digest(expected, received)


# ──────────────────────────────────────────────
# Ödeme başlat — form verisi döner, frontend Shopier'a POST atar
# ──────────────────────────────────────────────
@router.post("/shopier/init", response_model=PaymentInitResponse)
async def init_payment(body: PaymentInitRequest, user: dict = Depends(get_current_user)):
    s = get_settings()
    if not s.SHOPIER_API_KEY or not s.SHOPIER_API_SECRET:
        raise HTTPException(status_code=503, detail="Ödeme sistemi henüz yapılandırılmamış")

    db = get_supabase()

    platform_order_id = uuid.uuid4().hex[:24]
    amount_str = f"{body.amount:.2f}"
    currency = "0"       # TRY
    installment = "0"    # Tek çekim

    signature = _sign(f"{platform_order_id}{amount_str}{currency}{installment}", s.SHOPIER_API_SECRET)

    db.table("payment_transactions").insert({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "amount_tl": body.amount,
        "status": "pending",
        "platform_order_id": platform_order_id,
    }).execute()

    email_name = user["email"].split("@")[0]
    callback_url = f"{s.BACKEND_URL}/api/v1/payment/shopier/callback"

    form_fields = {
        "API_key":            s.SHOPIER_API_KEY,
        "website_index":      str(s.SHOPIER_WEBSITE_INDEX),
        "platform_order_id":  platform_order_id,
        "product_name":       "HypeUp Bakiye Yükleme",
        "product_type":       "0",
        "buyer_name":         email_name,
        "buyer_surname":      "User",
        "buyer_email":        user["email"],
        "buyer_account_age":  "0",
        "buyer_id_nr":        user["id"],
        "total_order_value":  amount_str,
        "currency":           currency,
        "installment_count":  installment,
        "callback_url":       callback_url,
        "current_language":   "0",
        "modul_version":      "1.4.1",
        "signature":          signature,
    }

    return PaymentInitResponse(
        shopier_url=SHOPIER_FORM_URL,
        form_fields=form_fields,
        platform_order_id=platform_order_id,
    )


# ──────────────────────────────────────────────
# Shopier callback (sunucu-sunucu POST)
# ──────────────────────────────────────────────
@router.post("/shopier/callback")
async def shopier_callback(request: Request):
    s = get_settings()
    db = get_supabase()

    form = await request.form()
    platform_order_id = str(form.get("platform_order_id", ""))
    status            = str(form.get("status", ""))
    installment_count = str(form.get("installment_count", "0"))
    payment_id        = str(form.get("payment_id", ""))
    signature         = str(form.get("signature", ""))

    if not _verify_callback(platform_order_id, installment_count, signature, s.SHOPIER_API_SECRET):
        logger.warning(f"[Payment] Geçersiz imza: {platform_order_id}")
        return JSONResponse(status_code=400, content={"error": "invalid_signature"})

    result = db.table("payment_transactions").select("*").eq("platform_order_id", platform_order_id).limit(1).execute()
    if not result.data:
        logger.error(f"[Payment] Transaction bulunamadı: {platform_order_id}")
        return JSONResponse(status_code=404, content={"error": "not_found"})

    tx = result.data[0]

    if tx["status"] != "pending":
        return JSONResponse(content={"message": "already_processed"})

    if status == "success":
        user_result = db.table("users").select("balance").eq("id", tx["user_id"]).limit(1).execute()
        if user_result.data:
            new_balance = round(float(user_result.data[0]["balance"]) + float(tx["amount_tl"]), 2)
            db.table("users").update({"balance": new_balance}).eq("id", tx["user_id"]).execute()

        db.table("payment_transactions").update({
            "status": "completed",
            "shopier_payment_id": payment_id,
        }).eq("platform_order_id", platform_order_id).execute()

        create_notification(
            tx["user_id"],
            "Bakiye Yüklendi 💰",
            f"₺{float(tx['amount_tl']):.2f} bakiyenize başarıyla yüklendi.",
            "success",
        )
        await send_telegram(
            f"💰 <b>Bakiye Yükleme</b>\n"
            f"💳 ₺{float(tx['amount_tl']):.2f} ödeme alındı\n"
            f"🆔 {platform_order_id}"
        )
        logger.info(f"[Payment] Başarılı: {platform_order_id} — {tx['amount_tl']} TL")
    else:
        db.table("payment_transactions").update({"status": "failed"}).eq("platform_order_id", platform_order_id).execute()
        logger.info(f"[Payment] Başarısız: {platform_order_id}")

    return JSONResponse(content={"message": "ok"})


# ──────────────────────────────────────────────
# Manuel ödeme (Papara/Havale)
# ──────────────────────────────────────────────
@router.post("/manual")
async def create_manual_payment(body: ManualPaymentRequest, user: dict = Depends(get_current_user)):
    if body.amount < 10:
        raise HTTPException(status_code=400, detail="Minimum yükleme miktarı ₺10")
    if body.amount > 10000:
        raise HTTPException(status_code=400, detail="Maksimum yükleme miktarı ₺10.000")

    db = get_supabase()
    ref = "HP-" + uuid.uuid4().hex[:6].upper()

    db.table("payment_transactions").insert({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "amount_tl": body.amount,
        "status": "pending",
        "platform_order_id": ref,
        "reference_code": ref,
        "sender_name": body.sender_name,
        "payment_method": "papara",
    }).execute()

    tx_id = db.table("payment_transactions").select("id").eq("platform_order_id", ref).limit(1).execute()
    tx_db_id = tx_id.data[0]["id"] if tx_id.data else ref

    await send_telegram_with_buttons(
        f"💳 <b>Yeni Ödeme Bildirimi</b>\n"
        f"👤 {user['email']}\n"
        f"💰 ₺{body.amount:.2f}\n"
        f"🔑 Ref: <code>{ref}</code>\n"
        f"📝 Gönderici: {body.sender_name}",
        buttons=[[
            {"text": "✅ Onayla",  "callback_data": f"approve_payment_{tx_db_id}"},
            {"text": "❌ Reddet",  "callback_data": f"reject_payment_{tx_db_id}"},
        ]]
    )

    return {"reference_code": ref, "amount": body.amount, "status": "pending"}


# ──────────────────────────────────────────────
# Ödeme geçmişi
# ──────────────────────────────────────────────
@router.get("/history", response_model=list[PaymentTransactionOut])
async def payment_history(user: dict = Depends(get_current_user)):
    db = get_supabase()
    result = (
        db.table("payment_transactions")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return [PaymentTransactionOut(**t) for t in result.data]
