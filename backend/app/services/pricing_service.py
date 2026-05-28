"""
Dinamik Kâr Marjı Motoru
────────────────────────
Kural: 1000 adet TL maliyeti baz alınır. Minimum taban fiyat: 5 TL/1000.

  < 1 TL   → maks(maliyet × 30, 5 TL)   (izlenme/beğeni — taban fiyat garantisi)
  1–20 TL  → maliyet × 5                 (%400 kâr)
  > 20 TL  → maliyet × 4                 (%300 kâr)
"""

from app.services.currency_service import get_current_rate
from typing import Optional, List

# ──────────────────────────────────────────────────────────────
# Miktara göre kademeli fiyatlandırma (TakipciBudur x0.90)
# key: jap_service_id  value: [{min, max, price_per_1000}]
# ──────────────────────────────────────────────────────────────
SERVICE_TIERS: dict[int, List[dict]] = {
    47: [  # IG Türk Takipçi
        {"min": 25,    "max": 49,    "price_per_1000": 2520.0},
        {"min": 50,    "max": 74,    "price_per_1000": 2520.0},
        {"min": 75,    "max": 99,    "price_per_1000": 2160.0},
        {"min": 100,   "max": 199,   "price_per_1000": 2025.0},
        {"min": 200,   "max": 299,   "price_per_1000": 1238.0},
        {"min": 300,   "max": 399,   "price_per_1000": 1350.0},
        {"min": 400,   "max": 499,   "price_per_1000": 1181.0},
        {"min": 500,   "max": 749,   "price_per_1000": 1170.0},
        {"min": 750,   "max": 999,   "price_per_1000":  960.0},
        {"min": 1000,  "max": 1499,  "price_per_1000":  891.0},
        {"min": 1500,  "max": 1999,  "price_per_1000":  870.0},
        {"min": 2000,  "max": 2499,  "price_per_1000":  810.0},
        {"min": 2500,  "max": 2749,  "price_per_1000":  882.0},
        {"min": 2750,  "max": 2999,  "price_per_1000":  851.0},
        {"min": 3000,  "max": 4999,  "price_per_1000":  840.0},
        {"min": 5000,  "max": 9999,  "price_per_1000":  882.0},
        {"min": 10000, "max": 19999, "price_per_1000":  882.0},
        {"min": 20000, "max": 49999, "price_per_1000":  837.0},
        {"min": 50000, "max": 100000,"price_per_1000":  765.0},
    ],
}


def get_tier_price(jap_service_id: int, quantity: int) -> Optional[float]:
    """Miktar-bazlı fiyatlandırma: uygun tier'ı bulur, yoksa None döner."""
    tiers = SERVICE_TIERS.get(jap_service_id)
    if not tiers:
        return None
    for tier in tiers:
        if tier["min"] <= quantity <= tier["max"]:
            return tier["price_per_1000"]
    return None

MIN_PRICE_TL = 5.0  # 1000 adet için minimum satış fiyatı (TL)


def calculate_hypeup_price(jap_dolar_per_1000: float, dolar_kuru: float | None = None) -> float:
    """
    JAP'ın 1000 adet için dolar fiyatından HypeUp'ın TL satış fiyatını hesapla.

    Args:
        jap_dolar_per_1000: JAP API'sinden gelen 1000 adet dolar fiyatı
        dolar_kuru: Güncel kur (None ise DB'den çekilir)

    Returns:
        float: 1000 adet için TL satış fiyatı
    """
    if dolar_kuru is None:
        dolar_kuru = get_current_rate()

    cost_tl_per_1000 = jap_dolar_per_1000 * dolar_kuru

    if cost_tl_per_1000 < 1.0:
        price = max(cost_tl_per_1000 * 30, MIN_PRICE_TL)
    elif cost_tl_per_1000 <= 20.0:
        price = cost_tl_per_1000 * 5
    else:
        price = cost_tl_per_1000 * 4

    return round(price, 4)


# Türkçe alias — services.py router'ında kullanılır
hesapla_hypeup_satis_fiyati = calculate_hypeup_price


def calculate_order_cost(
    jap_dolar_per_1000: float,
    hypeup_tl_per_1000: float,
    quantity: int,
    dolar_kuru: float | None = None,
) -> dict:
    """
    Belirli bir sipariş için toplam maliyet hesapla.

    Returns:
        {
          "charge_tl": float,   # Kullanıcıdan kesilecek TL
          "cost_dolar": float,  # JAP'a ödenecek dolar
        }
    """
    if dolar_kuru is None:
        dolar_kuru = get_current_rate()

    charge_tl = round((hypeup_tl_per_1000 / 1000) * quantity, 4)
    cost_dolar = round((jap_dolar_per_1000 / 1000) * quantity, 6)

    return {
        "charge_tl": charge_tl,
        "cost_dolar": cost_dolar,
    }
