"""
Telegram Bot Komut Merkezi
Admin Telegram'dan HypeUp panelini yönetir.

Komutlar:
  /stats          — Günlük ciro, sipariş, kullanıcı özeti
  /users          — Son 5 kayıt
  /orders         — Bekleyen siparişler
  /balance <email> <miktar>  — Kullanıcıya bakiye ekle
  /broadcast <mesaj>         — Tüm kullanıcılara bildirim gönder
"""

from fastapi import APIRouter, Request
from app.database import get_supabase
from app.config import get_settings
from app.services.telegram_service import send_telegram, answer_callback, edit_telegram_message
from app.routers.notifications import create_notification
from datetime import datetime, timezone, timedelta
import httpx
import logging

router = APIRouter(prefix="/telegram", tags=["Telegram Bot"])
logger = logging.getLogger(__name__)


async def reply(chat_id: str, text: str):
    s = get_settings()
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"https://api.telegram.org/bot{s.TELEGRAM_BOT_TOKEN}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            )
    except Exception as e:
        logger.warning(f"[TelegramBot] Yanıt gönderilemedi: {e}")


# ──────────────────────────────────────────────
# Webhook setup
# ──────────────────────────────────────────────
@router.get("/setup")
async def setup_webhook():
    """Backend URL'si ile Telegram webhook'u kaydet."""
    s = get_settings()
    webhook_url = f"{s.BACKEND_URL}/api/v1/telegram/webhook"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(
            f"https://api.telegram.org/bot{s.TELEGRAM_BOT_TOKEN}/setWebhook",
            json={"url": webhook_url, "allowed_updates": ["message", "callback_query"]},
        )
        return r.json()


# ──────────────────────────────────────────────
# Komut işleyici
# ──────────────────────────────────────────────
@router.post("/webhook")
async def telegram_webhook(request: Request):
    s = get_settings()
    try:
        data = await request.json()
    except Exception:
        return {"ok": True}

    # ── Callback query (inline buton) ──────────────
    if "callback_query" in data:
        await handle_callback(data["callback_query"])
        return {"ok": True}

    message = data.get("message", {})
    chat_id = str(message.get("chat", {}).get("id", ""))
    text = (message.get("text") or "").strip()

    if not text or chat_id != str(s.TELEGRAM_CHAT_ID):
        return {"ok": True}

    # ── /help ──────────────────────────────────
    if text == "/help" or text == "/start":
        await reply(chat_id, (
            "🤖 <b>HypeUp Bot Komutları</b>\n\n"
            "/stats — Güncel istatistikler\n"
            "/users — Son kayıt olan kullanıcılar\n"
            "/orders — Bekleyen siparişler\n"
            "/balance email miktar — Bakiye ekle\n"
            "/broadcast mesaj — Tüm kullanıcılara bildirim\n"
        ))

    # ── /stats ─────────────────────────────────
    elif text == "/stats":
        await cmd_stats(chat_id)

    # ── /users ─────────────────────────────────
    elif text == "/users":
        await cmd_users(chat_id)

    # ── /orders ────────────────────────────────
    elif text == "/orders":
        await cmd_orders(chat_id)

    # ── /balance email miktar ──────────────────
    elif text.startswith("/balance"):
        parts = text.split()
        if len(parts) < 3:
            await reply(chat_id, "❌ Kullanım: /balance email@... miktar\nÖrnek: /balance kullanici@mail.com 50")
        else:
            await cmd_balance(chat_id, parts[1], parts[2])

    # ── /broadcast mesaj ──────────────────────
    elif text.startswith("/broadcast"):
        msg = text[len("/broadcast"):].strip()
        if not msg:
            await reply(chat_id, "❌ Kullanım: /broadcast Mesajınız burada")
        else:
            await cmd_broadcast(chat_id, msg)

    else:
        await reply(chat_id, "❓ Bilinmeyen komut. /help ile komutları gör.")

    return {"ok": True}


# ──────────────────────────────────────────────
# Komut fonksiyonları
# ──────────────────────────────────────────────

async def handle_callback(cbq: dict):
    """Inline buton callback'lerini işle."""
    s = get_settings()
    cbq_id   = cbq.get("id", "")
    chat_id  = str(cbq.get("from", {}).get("id", ""))
    msg_id   = cbq.get("message", {}).get("message_id")
    msg_chat = str(cbq.get("message", {}).get("chat", {}).get("id", ""))
    data_str = cbq.get("data", "")

    logger.info(f"[TelegramCallback] data={data_str} from={chat_id} chat={msg_chat}")

    # Yetki kontrolü — hem from.id hem chat.id kontrol et
    allowed = {str(s.TELEGRAM_CHAT_ID)}
    if chat_id not in allowed and msg_chat not in allowed:
        await answer_callback(cbq_id, "❌ Yetkisiz")
        return

    try:
        db = get_supabase()

        # ── Ödeme onayla ───────────────────────────
        if data_str.startswith("approve_payment_"):
            payment_id = data_str.replace("approve_payment_", "")
            result = db.table("payment_transactions").select("*").eq("id", payment_id).limit(1).execute()
            if not result.data:
                await answer_callback(cbq_id, "❌ Ödeme bulunamadı"); return
            tx = result.data[0]
            if tx["status"] != "pending":
                await answer_callback(cbq_id, f"⚠️ Zaten {tx['status']}"); return

            user_res = db.table("users").select("balance, email").eq("id", tx["user_id"]).limit(1).execute()
            if not user_res.data:
                await answer_callback(cbq_id, "❌ Kullanıcı bulunamadı"); return

            new_bal = round(float(user_res.data[0]["balance"]) + float(tx["amount_tl"]), 2)
            db.table("users").update({"balance": new_bal}).eq("id", tx["user_id"]).execute()
            db.table("payment_transactions").update({"status": "completed"}).eq("id", payment_id).execute()
            create_notification(tx["user_id"], "Bakiye Yüklendi 💰",
                f"₺{float(tx['amount_tl']):.2f} bakiyenize yüklendi.", "success")

            await answer_callback(cbq_id, "✅ Onaylandı!")
            await edit_telegram_message(
                msg_chat or str(s.TELEGRAM_CHAT_ID), msg_id,
                f"✅ <b>Ödeme Onaylandı</b>\n"
                f"👤 {user_res.data[0]['email']}\n"
                f"💰 ₺{float(tx['amount_tl']):.2f}\n"
                f"🔑 Ref: {tx.get('reference_code', '')}\n"
                f"💳 Yeni bakiye: ₺{new_bal:.2f}"
            )
            logger.info(f"[TelegramCallback] Ödeme onaylandı: {payment_id}, yeni bakiye ₺{new_bal}")

        # ── Ödeme reddet ───────────────────────────
        elif data_str.startswith("reject_payment_"):
            payment_id = data_str.replace("reject_payment_", "")
            result = db.table("payment_transactions").select("*").eq("id", payment_id).limit(1).execute()
            if not result.data:
                await answer_callback(cbq_id, "❌ Ödeme bulunamadı"); return
            tx = result.data[0]
            if tx["status"] != "pending":
                await answer_callback(cbq_id, f"⚠️ Zaten {tx['status']}"); return

            db.table("payment_transactions").update({"status": "failed"}).eq("id", payment_id).execute()
            user_res = db.table("users").select("email").eq("id", tx["user_id"]).limit(1).execute()
            email = user_res.data[0]["email"] if user_res.data else "?"

            await answer_callback(cbq_id, "❌ Reddedildi")
            await edit_telegram_message(
                msg_chat or str(s.TELEGRAM_CHAT_ID), msg_id,
                f"❌ <b>Ödeme Reddedildi</b>\n"
                f"👤 {email}\n"
                f"💰 ₺{float(tx['amount_tl']):.2f}\n"
                f"🔑 Ref: {tx.get('reference_code', '')}"
            )
        else:
            await answer_callback(cbq_id)

    except Exception as e:
        logger.error(f"[TelegramCallback] Hata: {e}")
        await answer_callback(cbq_id, "❌ İşlem hatası")


async def cmd_stats(chat_id: str):
    db = get_supabase()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    orders = db.table("orders").select("charge_tl, cost_dolar, status, created_at").execute().data or []
    users  = db.table("users").select("id", count="exact").execute()
    payments = db.table("payment_transactions").select("amount_tl").eq("status", "completed").execute().data or []

    today_orders   = [o for o in orders if o["created_at"][:10] == today]
    today_revenue  = sum(float(o["charge_tl"]) for o in today_orders)
    total_revenue  = sum(float(o["charge_tl"]) for o in orders)
    total_deposits = sum(float(p["amount_tl"]) for p in payments)
    pending        = sum(1 for o in orders if o["status"] in ("pending", "processing"))
    total_users    = users.count or 0

    await reply(chat_id, (
        f"📊 <b>HypeUp İstatistikleri</b>\n\n"
        f"📅 Bugün:\n"
        f"  • Sipariş: {len(today_orders)}\n"
        f"  • Ciro: ₺{today_revenue:.2f}\n\n"
        f"📈 Toplam:\n"
        f"  • Ciro: ₺{total_revenue:.2f}\n"
        f"  • Yükleme: ₺{total_deposits:.2f}\n"
        f"  • Sipariş: {len(orders)}\n"
        f"  • Bekleyen: {pending}\n"
        f"  • Kullanıcı: {total_users}"
    ))


async def cmd_users(chat_id: str):
    db = get_supabase()
    result = db.table("users").select("email, balance, created_at").order("created_at", desc=True).limit(5).execute()

    if not result.data:
        await reply(chat_id, "Henüz kullanıcı yok.")
        return

    lines = ["👥 <b>Son 5 Kullanıcı</b>\n"]
    for i, u in enumerate(result.data, 1):
        date = u["created_at"][:10]
        lines.append(f"{i}. {u['email']}\n   ₺{float(u['balance']):.2f} — {date}")

    await reply(chat_id, "\n".join(lines))


async def cmd_orders(chat_id: str):
    db = get_supabase()
    result = (
        db.table("orders")
        .select("charge_tl, quantity, status, created_at, users(email), services(service_name)")
        .in_("status", ["pending", "processing"])
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )

    orders = result.data or []
    if not orders:
        await reply(chat_id, "✅ Bekleyen sipariş yok.")
        return

    lines = [f"📦 <b>Bekleyen Siparişler ({len(orders)})</b>\n"]
    for o in orders:
        email   = (o.get("users") or {}).get("email", "?")
        svc     = (o.get("services") or {}).get("service_name", "?")
        lines.append(f"• {email[:20]}\n  {svc[:25]} | {o['quantity']:,} adet | ₺{float(o['charge_tl']):.2f}")

    await reply(chat_id, "\n".join(lines))


async def cmd_balance(chat_id: str, email: str, amount_str: str):
    db = get_supabase()
    try:
        amount = float(amount_str)
    except ValueError:
        await reply(chat_id, "❌ Geçersiz miktar.")
        return

    result = db.table("users").select("id, email, balance").eq("email", email).limit(1).execute()
    if not result.data:
        await reply(chat_id, f"❌ <code>{email}</code> bulunamadı.")
        return

    user = result.data[0]
    new_balance = round(float(user["balance"]) + amount, 2)
    db.table("users").update({"balance": new_balance}).eq("id", user["id"]).execute()

    emoji = "➕" if amount >= 0 else "➖"
    create_notification(
        user["id"],
        f"{emoji} Bakiye Güncellendi",
        f"Hesabınıza {'eklendi' if amount >= 0 else 'çıkarıldı'}: ₺{abs(amount):.2f}",
        "success" if amount >= 0 else "warning",
    )

    await reply(chat_id,
        f"✅ <b>Bakiye Güncellendi</b>\n"
        f"👤 {email}\n"
        f"{emoji} {'+' if amount >= 0 else ''}{amount:.2f} TL\n"
        f"💰 Yeni bakiye: ₺{new_balance:.2f}"
    )


async def cmd_broadcast(chat_id: str, msg: str):
    db = get_supabase()
    result = db.table("users").select("id").eq("is_active", True).execute()
    users = result.data or []

    if not users:
        await reply(chat_id, "❌ Aktif kullanıcı bulunamadı.")
        return

    for u in users:
        create_notification(u["id"], "📢 Duyuru", msg, "info")

    await reply(chat_id,
        f"✅ <b>Broadcast Gönderildi</b>\n"
        f"📨 {len(users)} kullanıcıya bildirim iletildi.\n"
        f"💬 Mesaj: {msg[:100]}"
    )
