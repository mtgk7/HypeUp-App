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

    47: [  # IG Türk Takipçi (TakipciBudur x0.90)
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

    8216: [  # IG Beğeni (TakipciBudur Türk Beğeni x0.90)
        {"min": 25,    "max": 49,    "price_per_1000":  720.0},
        {"min": 50,    "max": 99,    "price_per_1000":  630.0},
        {"min": 100,   "max": 249,   "price_per_1000":  585.0},
        {"min": 250,   "max": 499,   "price_per_1000":  288.0},
        {"min": 500,   "max": 749,   "price_per_1000":  243.0},
        {"min": 750,   "max": 999,   "price_per_1000":  180.0},
        {"min": 1000,  "max": 1499,  "price_per_1000":  171.0},
        {"min": 1500,  "max": 2499,  "price_per_1000":  150.0},
        {"min": 2500,  "max": 4999,  "price_per_1000":  107.6},
        {"min": 5000,  "max": 9999,  "price_per_1000":   99.0},
        {"min": 10000, "max": 19999, "price_per_1000":   89.9},
        {"min": 20000, "max": 49999, "price_per_1000":   78.75},
        {"min": 50000, "max": 99999, "price_per_1000":   67.5},
        {"min": 100000,"max": 200000,"price_per_1000":   58.5},
    ],

    5994: [  # IG Reels İzlenme (TakipciBudur Reels İzlenme x0.90)
        {"min": 1000,   "max": 2499,   "price_per_1000":  31.5},
        {"min": 2500,   "max": 4999,   "price_per_1000":  19.8},
        {"min": 5000,   "max": 9999,   "price_per_1000":  16.2},
        {"min": 10000,  "max": 19999,  "price_per_1000":  15.75},
        {"min": 20000,  "max": 29999,  "price_per_1000":  12.83},
        {"min": 30000,  "max": 49999,  "price_per_1000":  10.5},
        {"min": 50000,  "max": 74999,  "price_per_1000":   8.55},
        {"min": 75000,  "max": 99999,  "price_per_1000":   6.54},
        {"min": 100000, "max": 199999, "price_per_1000":   6.53},
        {"min": 200000, "max": 499999, "price_per_1000":   4.5},
        {"min": 500000, "max": 999999, "price_per_1000":   2.7},
        {"min": 1000000,"max": 5000000,"price_per_1000":   1.8},
    ],

    3519: [  # YouTube Abone (SosyalGram x0.90)
        {"min": 50,    "max": 99,    "price_per_1000": 1467.0},
        {"min": 100,   "max": 249,   "price_per_1000": 1422.0},
        {"min": 250,   "max": 499,   "price_per_1000": 1397.0},
        {"min": 500,   "max": 749,   "price_per_1000": 1379.0},
        {"min": 750,   "max": 999,   "price_per_1000": 1350.0},
        {"min": 1000,  "max": 2499,  "price_per_1000": 1308.6},
        {"min": 2500,  "max": 4999,  "price_per_1000": 1255.7},
        {"min": 5000,  "max": 7499,  "price_per_1000": 1220.6},
        {"min": 7500,  "max": 9999,  "price_per_1000": 1185.4},
        {"min": 10000, "max": 24999, "price_per_1000": 1150.1},
        {"min": 25000, "max": 49999, "price_per_1000": 1114.9},
        {"min": 50000, "max": 74999, "price_per_1000": 1079.7},
        {"min": 75000, "max": 99999, "price_per_1000": 1044.5},
        {"min": 100000,"max": 500000,"price_per_1000": 1009.3},
    ],

    7533: [  # YouTube İzlenme (Bayigram x0.90)
        {"min": 100,   "max": 249,   "price_per_1000":  81.0},
        {"min": 250,   "max": 499,   "price_per_1000":  79.2},
        {"min": 500,   "max": 749,   "price_per_1000":  77.5},
        {"min": 750,   "max": 999,   "price_per_1000":  75.7},
        {"min": 1000,  "max": 2499,  "price_per_1000":  74.0},
        {"min": 2500,  "max": 4999,  "price_per_1000":  72.3},
        {"min": 5000,  "max": 7499,  "price_per_1000":  70.6},
        {"min": 7500,  "max": 9999,  "price_per_1000":  68.8},
        {"min": 10000, "max": 24999, "price_per_1000":  67.1},
        {"min": 25000, "max": 49999, "price_per_1000":  65.4},
        {"min": 50000, "max": 74999, "price_per_1000":  63.6},
        {"min": 75000, "max": 99999, "price_per_1000":  61.9},
        {"min": 100000,"max": 300000,"price_per_1000":  60.2},
    ],

    8695: [  # X (Twitter) Takipci (Takipci.al x0.90)
        {"min": 100,  "max": 249,   "price_per_1000":  792.0},
        {"min": 250,  "max": 499,   "price_per_1000":  651.6},
        {"min": 500,  "max": 749,   "price_per_1000":  646.2},
        {"min": 750,  "max": 999,   "price_per_1000":  670.8},
        {"min": 1000, "max": 2499,  "price_per_1000":  621.9},
        {"min": 2500, "max": 4999,  "price_per_1000":  641.5},
        {"min": 5000, "max": 7499,  "price_per_1000":  603.0},
        {"min": 7500, "max": 9999,  "price_per_1000":  582.0},
        {"min": 10000,"max": 24999, "price_per_1000":  570.6},
        {"min": 25000,"max": 50000, "price_per_1000":  555.3},
    ],

    9393: [  # X (Twitter) Beğeni (Takipci.al x0.90)
        {"min": 100,  "max": 249,  "price_per_1000":  477.0},
        {"min": 250,  "max": 499,  "price_per_1000":  486.0},
        {"min": 500,  "max": 749,  "price_per_1000":  475.2},
        {"min": 750,  "max": 999,  "price_per_1000":  469.2},
        {"min": 1000, "max": 2499, "price_per_1000":  465.3},
        {"min": 2500, "max": 4999, "price_per_1000":  460.4},
        {"min": 5000, "max": 10000,"price_per_1000":  455.4},
    ],

    10055: [  # TikTok Takipçi (Bayigram/SosyalGram x0.90)
        {"min": 50,    "max": 99,    "price_per_1000":  414.0},
        {"min": 100,   "max": 249,   "price_per_1000":  382.5},
        {"min": 250,   "max": 499,   "price_per_1000":  356.4},
        {"min": 500,   "max": 749,   "price_per_1000":  340.2},
        {"min": 750,   "max": 999,   "price_per_1000":  298.8},
        {"min": 1000,  "max": 2499,  "price_per_1000":  269.1},
        {"min": 2500,  "max": 4999,  "price_per_1000":  251.6},
        {"min": 5000,  "max": 9999,  "price_per_1000":  243.0},
        {"min": 10000, "max": 24999, "price_per_1000":  233.9},
        {"min": 25000, "max": 49999, "price_per_1000":  212.4},
        {"min": 50000, "max": 99999, "price_per_1000":  180.0},
        {"min": 100000,"max": 100000,"price_per_1000":  166.5},
    ],

    10023: [  # TikTok Beğeni (Bayigram x0.90)
        {"min": 100,   "max": 249,   "price_per_1000":   81.0},
        {"min": 250,   "max": 499,   "price_per_1000":   79.2},
        {"min": 500,   "max": 749,   "price_per_1000":   76.5},
        {"min": 750,   "max": 999,   "price_per_1000":   72.0},
        {"min": 1000,  "max": 2499,  "price_per_1000":   63.0},
        {"min": 2500,  "max": 4999,  "price_per_1000":   59.4},
        {"min": 5000,  "max": 7499,  "price_per_1000":   53.8},
        {"min": 7500,  "max": 9999,  "price_per_1000":   51.0},
        {"min": 10000, "max": 24999, "price_per_1000":   47.25},
        {"min": 25000, "max": 49999, "price_per_1000":   45.0},
        {"min": 50000, "max": 99999, "price_per_1000":   43.2},
        {"min": 100000,"max": 5000000,"price_per_1000":  31.5},
    ],

    10019: [  # TikTok Video İzlenme (Bayigram x0.90)
        {"min": 1000,   "max": 2499,   "price_per_1000":   5.85},
        {"min": 2500,   "max": 4999,   "price_per_1000":   5.62},
        {"min": 5000,   "max": 7499,   "price_per_1000":   5.39},
        {"min": 7500,   "max": 9999,   "price_per_1000":   5.17},
        {"min": 10000,  "max": 24999,  "price_per_1000":   4.94},
        {"min": 25000,  "max": 49999,  "price_per_1000":   4.71},
        {"min": 50000,  "max": 99999,  "price_per_1000":   4.49},
        {"min": 100000, "max": 249999, "price_per_1000":   4.03},
        {"min": 250000, "max": 499999, "price_per_1000":   3.81},
        {"min": 500000, "max": 749999, "price_per_1000":   3.58},
        {"min": 750000, "max": 999999, "price_per_1000":   3.35},
        {"min": 1000000,"max": 10000000,"price_per_1000":  3.12},
    ],

    10216: [  # IG Global Takipçi (TakipciBudur Ucuz Yabancı x0.90)
        {"min": 100,  "max": 499,  "price_per_1000":  765.0},
        {"min": 500,  "max": 749,  "price_per_1000":  630.0},
        {"min": 750,  "max": 999,  "price_per_1000":  570.0},
        {"min": 1000, "max": 1499, "price_per_1000":  585.0},
        {"min": 1500, "max": 1999, "price_per_1000":  510.0},
        {"min": 2000, "max": 2499, "price_per_1000":  427.5},
        {"min": 2500, "max": 9999, "price_per_1000":  450.0},
        {"min": 10000,"max": 14999,"price_per_1000":  351.0},
        {"min": 15000,"max": 19999,"price_per_1000":  384.0},
        {"min": 20000,"max": 29999,"price_per_1000":  576.0},
        {"min": 30000,"max": 1000000,"price_per_1000": 540.0},
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
