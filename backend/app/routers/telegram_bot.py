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

# Zamanlama bekleme durumu: chat_id → {image_url, caption}
_pending_schedule: dict[str, dict] = {}


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

    if chat_id != str(s.TELEGRAM_CHAT_ID):
        return {"ok": True}

    # ── Fotoğraf mesajı → Instagram post akışı ──
    if "photo" in message:
        await handle_ig_photo(chat_id, message, s)
        return {"ok": True}

    text = (message.get("text") or "").strip()

    # ── Zamanlama tarihi bekleniyor ──────────────
    if chat_id in _pending_schedule and text and not text.startswith("/"):
        await handle_ig_schedule_date(chat_id, text)
        return {"ok": True}

    if not text:
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
            "/provider — Sağlayıcı (PRM4U) bakiyesi\n\n"
            "📸 <b>Instagram Post:</b>\n"
            "Fotoğraf + caption gönder → Şimdi Paylaş / Zamanla butonu çıkar\n"
            "\nKısayol: \"bugün\" / \"özet\" → istatistik, \"bekleyen\" → siparişler\n"
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

    # ── /provider — sağlayıcı bakiyesi ─────────
    elif text == "/provider":
        await cmd_provider(chat_id)

    # ── Doğal dil kısayolları ──────────────────
    elif text.lower() in ("bugün", "bugun", "özet", "ozet", "stats"):
        await cmd_stats(chat_id)
    elif text.lower() in ("bekleyen", "siparişler", "siparisler"):
        await cmd_orders(chat_id)

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

            from app.routers.admin import _payment_bonus
            amount = float(tx["amount_tl"])
            bonus = _payment_bonus(amount)
            new_bal = round(float(user_res.data[0]["balance"]) + amount + bonus, 2)
            db.table("users").update({"balance": new_bal}).eq("id", tx["user_id"]).execute()
            db.table("payment_transactions").update({"status": "completed"}).eq("id", payment_id).execute()
            notif_msg = f"₺{amount:.2f} bakiyenize yüklendi."
            if bonus > 0:
                notif_msg += f" 🎁 ₺{bonus:.0f} yükleme bonusu hediye edildi!"
            create_notification(tx["user_id"], "Bakiye Yüklendi 💰", notif_msg, "success")

            bonus_line = f"\n🎁 Bonus: ₺{bonus:.0f}" if bonus > 0 else ""
            await answer_callback(cbq_id, "✅ Onaylandı!")
            await edit_telegram_message(
                msg_chat or str(s.TELEGRAM_CHAT_ID), msg_id,
                f"✅ <b>Ödeme Onaylandı</b>\n"
                f"👤 {user_res.data[0]['email']}\n"
                f"💰 ₺{amount:.2f}{bonus_line}\n"
                f"🔑 Ref: {tx.get('reference_code', '')}\n"
                f"💳 Yeni bakiye: ₺{new_bal:.2f}"
            )
            logger.info(f"[TelegramCallback] Ödeme onaylandı: {payment_id}, bonus ₺{bonus}, yeni bakiye ₺{new_bal}")

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
        # ── Sipariş iade ───────────────────────────
        elif data_str.startswith("refund_order_"):
            order_id = data_str.replace("refund_order_", "")
            o = db.table("orders").select("*, services(service_name)").eq("id", order_id).limit(1).execute()
            if not o.data:
                await answer_callback(cbq_id, "❌ Sipariş bulunamadı"); return
            order = o.data[0]
            if order["status"] == "refunded":
                await answer_callback(cbq_id, "⚠️ Zaten iade edildi"); return
            u = db.table("users").select("balance, email").eq("id", order["user_id"]).limit(1).execute()
            if not u.data:
                await answer_callback(cbq_id, "❌ Kullanıcı bulunamadı"); return
            new_bal = round(float(u.data[0]["balance"]) + float(order["charge_tl"]), 2)
            db.table("users").update({"balance": new_bal}).eq("id", order["user_id"]).execute()
            db.table("orders").update({"status": "refunded"}).eq("id", order_id).execute()
            svc_name = (order.get("services") or {}).get("service_name", "Sipariş")
            create_notification(order["user_id"], "İade Yapıldı",
                f"{svc_name} için ₺{float(order['charge_tl']):.2f} bakiyene iade edildi.", "info")
            await answer_callback(cbq_id, "💸 İade edildi")
            await edit_telegram_message(
                msg_chat or str(s.TELEGRAM_CHAT_ID), msg_id,
                f"💸 <b>Sipariş İade Edildi</b>\n"
                f"👤 {u.data[0]['email']}\n"
                f"📦 {svc_name}\n"
                f"💰 ₺{float(order['charge_tl']):.2f} iade — yeni bakiye ₺{new_bal:.2f}\n"
                f"⚠️ Sağlayıcıda manuel iptal gerekebilir."
            )

        # ── Instagram hemen paylaş ─────────────────
        elif data_str.startswith("ig_post_now_"):
            post_id = data_str.replace("ig_post_now_", "")
            post = db.table("instagram_posts").select("*").eq("id", post_id).limit(1).execute()
            if not post.data:
                await answer_callback(cbq_id, "❌ Post bulunamadı"); return
            p = post.data[0]
            from app.services.instagram_service import post_to_instagram
            from datetime import datetime, timezone
            try:
                media_id = await post_to_instagram(p["image_url"], p["caption"])
                db.table("instagram_posts").update({
                    "status": "published", "ig_media_id": media_id,
                    "published_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", post_id).execute()
                await answer_callback(cbq_id, "✅ Yayınlandı!")
                await edit_telegram_message(
                    msg_chat or str(s.TELEGRAM_CHAT_ID), msg_id,
                    f"✅ <b>Instagram'a Yayınlandı</b>\n📝 {p['caption'][:80]}..."
                )
            except Exception as e:
                db.table("instagram_posts").update({"status": "failed", "error_msg": str(e)}).eq("id", post_id).execute()
                await answer_callback(cbq_id, f"❌ Hata: {str(e)[:50]}")

        # ── Instagram zamanla ──────────────────────
        elif data_str.startswith("ig_schedule_"):
            post_id = data_str.replace("ig_schedule_", "")
            post = db.table("instagram_posts").select("*").eq("id", post_id).limit(1).execute()
            if not post.data:
                await answer_callback(cbq_id, "❌ Post bulunamadı"); return
            p = post.data[0]
            _pending_schedule[str(s.TELEGRAM_CHAT_ID)] = {
                "post_id": post_id,
                "image_url": p["image_url"],
                "caption": p["caption"],
            }
            await answer_callback(cbq_id)
            await reply(str(s.TELEGRAM_CHAT_ID),
                "📅 Yayın tarihini gir (TR saati):\n<code>2026-06-20 14:30</code>"
            )

        # ── Instagram iptal ────────────────────────
        elif data_str.startswith("ig_cancel_"):
            post_id = data_str.replace("ig_cancel_", "")
            db.table("instagram_posts").update({"status": "cancelled"}).eq("id", post_id).execute()
            await answer_callback(cbq_id, "🗑 İptal edildi")
            await edit_telegram_message(
                msg_chat or str(s.TELEGRAM_CHAT_ID), msg_id, "🗑 <b>Post iptal edildi.</b>"
            )

        else:
            await answer_callback(cbq_id)

    except Exception as e:
        logger.error(f"[TelegramCallback] Hata: {e}")
        await answer_callback(cbq_id, "❌ İşlem hatası")


async def cmd_stats(chat_id: str):
    db = get_supabase()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Tüm siparişleri sayfalı çek — Supabase 1000-satır limitini aşar
    orders, PAGE, offset = [], 1000, 0
    while True:
        batch = db.table("orders").select("charge_tl, cost_dolar, status, created_at").range(offset, offset + PAGE - 1).execute()
        if not batch.data:
            break
        orders.extend(batch.data)
        if len(batch.data) < PAGE:
            break
        offset += PAGE

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


async def cmd_provider(chat_id: str):
    """Sağlayıcı (PRM4U) bakiyesini göster."""
    from app.services.jap_service import get_jap_client
    try:
        bal = await get_jap_client().get_balance()
        if isinstance(bal, dict):
            raw = bal.get("balance", bal)
            cur = bal.get("currency", "USD")
        else:
            raw, cur = bal, "USD"
        await reply(chat_id, f"💵 <b>Sağlayıcı Bakiyesi (PRM4U)</b>\n{raw} {cur}")
    except Exception as e:
        await reply(chat_id, f"❌ Bakiye alınamadı: {e}")


# ── Instagram Telegram Akışı ──────────────────────────────────────────────────

async def handle_ig_photo(chat_id: str, message: dict, s):
    """Admin fotoğraf gönderince: Supabase'e yükle → butonlu mesaj gönder."""
    import uuid, httpx
    db = get_supabase()

    # En yüksek kaliteli fotoğrafı al
    photo = message["photo"][-1]
    file_id = photo["file_id"]
    caption = (message.get("caption") or "").strip()

    if not caption:
        await reply(chat_id, "❌ Lütfen fotoğrafla birlikte caption da gönder (açıklama + hashtagler).")
        return

    try:
        # Telegram'dan dosya yolunu al
        async with httpx.AsyncClient(timeout=30) as client:
            fr = await client.get(f"https://api.telegram.org/bot{s.TELEGRAM_BOT_TOKEN}/getFile?file_id={file_id}")
            file_path = fr.json()["result"]["file_path"]
            # Dosyayı indir
            img = await client.get(f"https://api.telegram.org/file/bot{s.TELEGRAM_BOT_TOKEN}/{file_path}")
            img_bytes = img.content

        # Supabase Storage'a yükle
        supabase_url = s.SUPABASE_URL
        supabase_key = s.SUPABASE_SERVICE_KEY
        filename = f"{uuid.uuid4()}.jpg"
        async with httpx.AsyncClient(timeout=30) as client:
            up = await client.post(
                f"{supabase_url}/storage/v1/object/instagram-media/{filename}",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "image/jpeg",
                },
                content=img_bytes,
            )
        if up.status_code not in (200, 201):
            await reply(chat_id, f"❌ Görsel yüklenemedi: {up.text[:100]}")
            return

        public_url = f"{supabase_url}/storage/v1/object/public/instagram-media/{filename}"

        # DB'ye kaydet
        row = db.table("instagram_posts").insert({
            "caption": caption,
            "image_url": public_url,
            "status": "pending",
        }).execute()
        post_id = row.data[0]["id"]

        # Butonlu mesaj gönder
        from app.services.telegram_service import send_telegram_with_buttons
        await send_telegram_with_buttons(
            f"📸 <b>Instagram Post Hazır</b>\n\n"
            f"📝 <i>{caption[:120]}{'...' if len(caption) > 120 else ''}</i>\n\n"
            f"Ne yapmak istersin?",
            buttons=[[
                {"text": "🚀 Şimdi Paylaş", "callback_data": f"ig_post_now_{post_id}"},
                {"text": "📅 Zamanla",      "callback_data": f"ig_schedule_{post_id}"},
                {"text": "🗑 İptal",        "callback_data": f"ig_cancel_{post_id}"},
            ]],
        )
    except Exception as e:
        logger.error(f"[IGPhoto] Hata: {e}")
        await reply(chat_id, f"❌ Hata: {str(e)[:200]}")


async def handle_ig_schedule_date(chat_id: str, text: str):
    """Kullanıcı zamanlamayı girdikten sonra işle."""
    pending = _pending_schedule.pop(chat_id, None)
    if not pending:
        return

    from zoneinfo import ZoneInfo
    tz = ZoneInfo("Europe/Istanbul")
    try:
        scheduled = datetime.strptime(text.strip(), "%Y-%m-%d %H:%M").replace(tzinfo=tz)
    except ValueError:
        _pending_schedule[chat_id] = pending
        await reply(chat_id, "❌ Format hatalı. Şöyle gir:\n<code>2026-06-20 14:30</code>")
        return

    db = get_supabase()
    db.table("instagram_posts").update({
        "scheduled_at": scheduled.isoformat(),
        "status": "pending",
    }).eq("id", pending["post_id"]).execute()

    await reply(chat_id,
        f"✅ <b>Post Zamanlandı</b>\n"
        f"📅 {scheduled.strftime('%d %B %Y, %H:%M')} (TR)\n"
        f"📝 {pending['caption'][:80]}..."
    )
