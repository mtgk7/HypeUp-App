from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import PaymentTransactionOut, ManualPaymentRequest
from app.database import get_supabase
from app.utils.auth import get_current_user
from app.routers.notifications import create_notification
from app.services.telegram_service import send_telegram, send_telegram_with_buttons
import uuid
import logging

router = APIRouter(prefix="/payment", tags=["Payment"])
logger = logging.getLogger(__name__)


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

    big = "⚠️ <b>BÜYÜK ÖDEME</b>\n" if body.amount >= 500 else ""
    await send_telegram_with_buttons(
        big +
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
