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
