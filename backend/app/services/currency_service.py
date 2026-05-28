"""
Döviz Kuru Servisi
- Önce ExchangeRate-API'yi dener
- Başarısız olursa TCMB XML feed'ini parse eder
- Her iki kaynak da başarısız olursa veritabanındaki son geçerli kuru döner
"""

import httpx
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from app.database import get_supabase
import logging

logger = logging.getLogger(__name__)

TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml"
EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/USD"


async def fetch_from_exchange_api() -> float | None:
    """ExchangeRate-API'den USD/TRY kurunu çek."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(EXCHANGE_API_URL)
            r.raise_for_status()
            data = r.json()
            rate = data["rates"].get("TRY")
            if rate:
                logger.info(f"[CurrencyService] ExchangeRate-API: 1 USD = {rate} TRY")
                return float(rate)
    except Exception as e:
        logger.warning(f"[CurrencyService] ExchangeRate-API hatası: {e}")
    return None


async def fetch_from_tcmb() -> float | None:
    """TCMB XML feed'inden USD/TRY kurunu çek."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(TCMB_URL)
            r.raise_for_status()
            root = ET.fromstring(r.content)
            for currency in root.iter("Currency"):
                if currency.attrib.get("CurrencyCode") == "USD":
                    selling = currency.findtext("ForexSelling")
                    if selling:
                        rate = float(selling.replace(",", "."))
                        logger.info(f"[CurrencyService] TCMB: 1 USD = {rate} TRY")
                        return rate
    except Exception as e:
        logger.warning(f"[CurrencyService] TCMB hatası: {e}")
    return None


def get_rate_from_db() -> float:
    """Veritabanındaki son geçerli kuru döner (fallback)."""
    try:
        db = get_supabase()
        result = db.table("settings").select("value").eq("key", "dolar_kuru").single().execute()
        if result.data:
            return float(result.data["value"])
    except Exception as e:
        logger.error(f"[CurrencyService] DB fallback hatası: {e}")
    return 40.0  # son çare sabit değer


def save_rate_to_db(rate: float) -> None:
    """Güncel kuru settings tablosuna kaydet."""
    try:
        db = get_supabase()
        db.table("settings").update({
            "value": str(rate),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("key", "dolar_kuru").execute()
        logger.info(f"[CurrencyService] Kur kaydedildi: {rate}")
    except Exception as e:
        logger.error(f"[CurrencyService] Kur kaydetme hatası: {e}")


async def refresh_currency_rate() -> float:
    """
    Güncel kuru çek, DB'ye yaz ve döndür.
    Her iki kaynak başarısız olursa DB'deki son kuru kullan.
    """
    rate = await fetch_from_exchange_api()
    if rate is None:
        rate = await fetch_from_tcmb()
    if rate is None:
        logger.error("[CurrencyService] Tüm kaynaklar başarısız, DB fallback kullanılıyor.")
        return get_rate_from_db()

    save_rate_to_db(rate)
    return rate


def get_current_rate() -> float:
    """Senkron olarak DB'den kuru oku (route içinde kullanım için)."""
    return get_rate_from_db()
