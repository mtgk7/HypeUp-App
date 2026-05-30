import httpx
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_telegram(message: str) -> None:
    s = get_settings()
    if not s.TELEGRAM_BOT_TOKEN or not s.TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{s.TELEGRAM_BOT_TOKEN}/sendMessage"
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json={
                "chat_id": s.TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML",
            })
    except Exception as e:
        logger.warning(f"[Telegram] Mesaj gönderilemedi: {e}")


async def send_telegram_with_buttons(message: str, buttons: list[list[dict]]) -> None:
    """
    Inline keyboard butonlu mesaj gönder.
    buttons: [[{"text": "✅ Onayla", "callback_data": "approve_payment_xxx"}, ...], ...]
    """
    s = get_settings()
    if not s.TELEGRAM_BOT_TOKEN or not s.TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{s.TELEGRAM_BOT_TOKEN}/sendMessage"
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json={
                "chat_id": s.TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML",
                "reply_markup": {"inline_keyboard": buttons},
            })
    except Exception as e:
        logger.warning(f"[Telegram] Butonlu mesaj gönderilemedi: {e}")


async def answer_callback(callback_query_id: str, text: str = "") -> None:
    """Butona basıldığında yükleniyor animasyonunu kapat."""
    s = get_settings()
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(
                f"https://api.telegram.org/bot{s.TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
                json={"callback_query_id": callback_query_id, "text": text},
            )
    except Exception:
        pass


async def edit_telegram_message(chat_id: str, message_id: int, new_text: str) -> None:
    """Mevcut mesajı güncelle (butonları kaldır, sonucu yaz)."""
    s = get_settings()
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"https://api.telegram.org/bot{s.TELEGRAM_BOT_TOKEN}/editMessageText",
                json={
                    "chat_id": chat_id,
                    "message_id": message_id,
                    "text": new_text,
                    "parse_mode": "HTML",
                },
            )
    except Exception as e:
        logger.warning(f"[Telegram] Mesaj düzenlenemedi: {e}")
