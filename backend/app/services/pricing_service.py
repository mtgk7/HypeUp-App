"""
Dinamik Kâr Marjı Motoru
────────────────────────
Gerçek formül calculate_hypeup_price()'ta tanımlı (bu modül içinde, aşağıda).
Kademeli çarpan, RATE_BASELINE kurunda taban maliyete uygulanır, sonuç güncel
kura orantılanır:

  < 3 TL   × 5.0   (izlenme/traffic)
  3–15 TL  × 3.2
  15–30 TL × 1.75
  30–80 TL × 3.90
  > 80 TL  × 5.0

Taban: MIN_PRICE_TL = 5 TL/1000.
"""

from app.services.currency_service import get_current_rate
from typing import Optional, List

# ──────────────────────────────────────────────────────────────
# Kur baz alma noktası (RATE_BASELINE)
# Tüm retail (tier) ve formül fiyatları bu kurda tanımlandı. Güncel kur
# değiştikçe TÜM fiyatlar bu orana göre ölçeklenir:
#     fiyat = baz_fiyat × (guncel_kur / RATE_BASELINE)
# Böylece sağlayıcı maliyetine olan KAT (marj) sabit kalır; kuru %5 artırınca
# tüm fiyatlar %5 artar. ⚠️ Bu değer, fiyatların tanımlandığı andaki sistem
# kuruna eşit olmalı (şu an ₺47.50). Değiştirmek tüm fiyatları topluca kaydırır.
# ──────────────────────────────────────────────────────────────
RATE_BASELINE = 47.5

# Minimum marj oranı — tier fiyatı maliyet × bu değerin altına düşemez (runtime floor)
MIN_MARGIN = 1.30  # %30

# Runtime floor tablosu: full_sync her çalıştığında güncellenir
# {jap_service_id: min_tl_per_1000} — boş başlar, startup full_sync'te dolar
_TIER_FLOOR: dict[int, float] = {}

# ──────────────────────────────────────────────────────────────
# Miktara göre kademeli fiyatlandırma (TakipciBudur x0.90)
# key: jap_service_id  value: [{min, max, price_per_1000}]
# ──────────────────────────────────────────────────────────────
SERVICE_TIERS: dict[int, List[dict]] = {

    # 4908 (eski "IG Türk Takipçi") PRM4U kataloğundan tamamen kaldırıldı
    # (2026-11-14) — Türkiye'ye özel hiçbir Instagram takipçi servisi şu an
    # PRM4U'da yok. Kullanıcı kararıyla GEÇİCİ olarak ülke-hedefsiz "Gerçek
    # Kullanıcı" takipçi servisine (418, Refill 180G garantili) geçirildi.
    # FEATURED_PACKAGES'teki jap_service_id de 418'e güncellendi. Türk-özel
    # bir sağlayıcı (bkz. proje notları: MedyaBayim) eklenince buraya geri
    # dönülmeli.
    418: [  # Instagram Followers - [Real User: Refill 180D] — eski 4908'in yerine (geçici)
        # Rakip kıyaslaması (2026-11-15, Bayigram "Türk Takipçi" 505,75 TL/1000,
        # -%10 konumlandırma): baseline 412,77 -> güncel kurda ~455 TL/1000.
        {"min": 10, "max": 100000, "price_per_1000": 412.77},
    ],

    1549: [  # IG Türk Beğeni → PRM4U: Instagram Beğenileri [Gerçek Kullanıcı: Türkiye]
        {"min": 1,    "max": 99,    "price_per_1000":  720.0},
        {"min": 100,  "max": 249,   "price_per_1000":  585.0},
        {"min": 250,  "max": 499,   "price_per_1000":  450.0},
        {"min": 500,  "max": 999,   "price_per_1000":  360.0},
        {"min": 1000, "max": 2499,  "price_per_1000":  315.0},
        {"min": 2500, "max": 5000,  "price_per_1000":  270.0},
    ],

    3: [  # IG Beğeni → PRM4U: Instagram Likes [High Quality | No Drop]
        # Rakip kıyaslaması (2026-11-15, Bayigram "Türk Beğeni" favori paket
        # 142,84 TL/1000, -%8 konumlandırma): baseline 119,17 -> ~131,4 TL/1000
        # güncel kurda. Maliyetin (~₺10,48/1000) ~12,5×'i — beğeni kategorisinde
        # piyasa fiyatı ham maliyetten çok daha yüksek seyrediyor (bkz. proje
        # notları), formülün genel bandı (×3.2) bu kategoriye uymuyordu.
        {"min": 10, "max": 1000000, "price_per_1000": 119.17},
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

    # 3110 (eski "YouTube Abone") de PRM4U'dan kaldırılmış (2026-11-15,
    # Instagram Takipçi'yle aynı desen) — 1588'e geçirildi (YouTube Subscribers
    # [Real User: Refill 30D], $10.00/1000 — eski 3110 ile BİREBİR AYNI maliyet,
    # fiyat/marj hesabı değişmedi).
    1588: [  # YouTube Abone → PRM4U: YouTube Subscribers [Real User: Refill 30D] (eski 3110'un yerine)
        # Rakip kıyaslaması (2026-11-15, Bayigram favori paket 2.128 TL/1000,
        # -%8 konumlandırma): baseline 1775,36 -> ~1.957,76 TL/1000 güncel kur.
        {"min": 50, "max": 500000, "price_per_1000": 1775.36},
    ],

    4048: [  # YouTube İzlenme → PRM4U: YouTube Views [Worldwide]
        # Rakip kıyaslaması (2026-11-15, Bayigram favori paket 784,47 TL/10.000,
        # +%5 konumlandırma): baseline 74,70 -> ~82,37 TL/1000 güncel kur.
        {"min": 100, "max": 300000, "price_per_1000": 74.70},
    ],

    4259: [  # X Takipçi → PRM4U: Twitter Takipçileri [10 Ülke]
        # Rakip kıyaslaması (2026-11-15, Bayigram favori paket 766,36 TL/1000,
        # -%7 konumlandırma): baseline 646,32 -> ~712,72 TL/1000 güncel kur.
        {"min": 100, "max": 50000, "price_per_1000": 646.32},
    ],

    145: [  # X Beğeni → PRM4U: Twitter Beğenileri [5 Ülke] (eski: 9393)
        {"min": 100,  "max": 249,  "price_per_1000":  477.0},
        {"min": 250,  "max": 499,  "price_per_1000":  486.0},
        {"min": 500,  "max": 749,  "price_per_1000":  475.2},
        {"min": 750,  "max": 999,  "price_per_1000":  469.2},
        {"min": 1000, "max": 2499, "price_per_1000":  465.3},
        {"min": 2500, "max": 4999, "price_per_1000":  460.4},
        {"min": 5000, "max": 10000,"price_per_1000":  455.4},
    ],

    4686: [  # TikTok Takipçi → PRM4U: TikTok Followers [High Quality]
        # Rakip kıyaslaması (2026-11-15, Bayigram favori paket 494 TL/1000,
        # +%5 konumlandırma): baseline 470,38 -> ~518,70 TL/1000 güncel kur.
        {"min": 50, "max": 50000, "price_per_1000": 470.38},
    ],

    # 162 (eski "TikTok Beğeni") de PRM4U'dan kaldırılmış (2026-11-15, aynı desen)
    # — 163'e geçirildi (TikTok Likes [Real User: Refill 30D], $3.00/1000).
    # ⚠️ Bayigram'ın favori paketi (85 TL/1000) muhtemelen ucuz bot kaynaklı —
    # bizim maliyetimizin (₺157,14/1000) ALTINDA, o yüzden karşılaştırma onların
    # "Organic"/gerçek-kullanıcı tier'ına (~340 TL/1000) göre yapıldı, standart
    # ucuz tier'a göre DEĞİL. Marj burada diğer kategorilerden daha düşük (~2x),
    # kullanıcıya bildirildi.
    163: [  # TikTok Beğeni → PRM4U: TikTok Likes [Real User: Refill 30D] (eski 162'nin yerine)
        # -%8 konumlandırma (Bayigram Organic ~340 TL): baseline 283,68 -> ~312,8 TL/1000 güncel kur.
        {"min": 1, "max": 100000, "price_per_1000": 283.68},
    ],

    1840: [  # TikTok İzlenme → PRM4U: TikTok Views [No Refill]
        # Rakip kıyaslaması (2026-11-15, Bayigram favori paket 62,45 TL/10.000,
        # +%8 konumlandırma): baseline 6,12 -> ~6,75 TL/1000 güncel kur.
        {"min": 1000, "max": 10000000, "price_per_1000": 6.12},
    ],

    # 4626 (eski "IG Global Takipçi") de PRM4U'dan kaldırıldı — aynı sebep,
    # aynı geçici çözüm (bkz. 418 üstündeki not). Daha kısa Refill garantili
    # (30G) ve daha ucuz maliyetli 469'a geçirildi, böylece "Türk" (418) ve
    # "Global" (469) paketleri arasında anlamlı bir fiyat/garanti farkı kalıyor.
    469: [  # Instagram Followers - [Real User: Refill 30D] — eski 4626'nın yerine (geçici)
        # 418'in (Türk Takipçi) %70'i olarak konumlandırıldı (2026-11-15) —
        # Bayigram'da doğrudan "yabancı/global takipçi" karşılığı yok.
        # baseline 288,94 -> ~318,6 TL/1000 güncel kur.
        {"min": 10, "max": 100000, "price_per_1000": 288.94},
    ],

}


def _tier_base_price(jap_service_id: int, quantity: int) -> Optional[float]:
    """Baseline kurdaki ham tier fiyatı (kur ölçeklemesi YOK)."""
    tiers = SERVICE_TIERS.get(jap_service_id)
    if not tiers:
        return None
    for tier in tiers:
        if tier["min"] <= quantity <= tier["max"]:
            return tier["price_per_1000"]
    # Miktar tier aralığının dışındaysa en yakın uca tutun (ör. min'in altı → ilk tier)
    if quantity < tiers[0]["min"]:
        return tiers[0]["price_per_1000"]
    return tiers[-1]["price_per_1000"]


def get_tier_price(
    jap_service_id: int, quantity: int, dolar_kuru: float | None = None
) -> Optional[float]:
    """
    Miktar-bazlı retail fiyat (1000 adet TL) — kura ORANTILI ölçeklenir.
    Runtime floor (_TIER_FLOOR) aktifse, maliyet + MIN_MARGIN garantisi uygulanır.
    """
    base = _tier_base_price(jap_service_id, quantity)
    if base is None:
        return None
    if dolar_kuru is None:
        dolar_kuru = get_current_rate()
    price = round(base * (dolar_kuru / RATE_BASELINE), 4)
    floor = _TIER_FLOOR.get(jap_service_id)
    if floor is not None:
        price = max(price, floor)
    return price


def apply_margin_floor(
    service_dolar_prices: dict[int, float],
    dolar_kuru: float,
) -> list[dict]:
    """
    PRM4U fiyatları değişince tier'ların zarar ettirmemesini garantiler.
    full_sync() tarafından her 12 saatte bir + startup'ta çağrılır.

    Args:
        service_dolar_prices: {jap_service_id: usd_per_1000} — PRM4U anlık fiyatlar
        dolar_kuru: güncel TL/USD kuru

    Returns:
        Değiştirilen tier'ların listesi (Telegram bildirimi için). Boşsa değişiklik yok.
    """
    changes = []
    for sid, usd_price in service_dolar_prices.items():
        tiers = SERVICE_TIERS.get(sid)
        if not tiers:
            continue
        cost_tl = usd_price * dolar_kuru          # TL/1000, sağlayıcı maliyeti
        floor_tl = round(cost_tl * MIN_MARGIN, 2) # TL/1000, minimum satış fiyatı

        violations = [
            {
                "min": t["min"], "max": t["max"],
                "price": round(t["price_per_1000"] * (dolar_kuru / RATE_BASELINE), 2),
            }
            for t in tiers
            if round(t["price_per_1000"] * (dolar_kuru / RATE_BASELINE), 4) < floor_tl
        ]

        if violations:
            _TIER_FLOOR[sid] = floor_tl
            changes.append({"sid": sid, "floor": floor_tl, "violations": violations})
        else:
            _TIER_FLOOR.pop(sid, None)  # Maliyet düştüyse floor'u kaldır

    return changes


# ──────────────────────────────────────────────────────────────
# Landing / öne çıkan hazır paketler — HEPSİ SERVICE_TIERS'te (retail fiyatlı)
# jap_service_id → DB'deki gerçek servisle eşleşir, fiyat tier'dan gelir
# ──────────────────────────────────────────────────────────────
_QTY_STD = [100, 250, 500, 750, 1000]          # takipçi / beğeni / abone
_QTY_VIEW = [1000, 5000, 10000, 25000, 50000]  # izlenme

FEATURED_PACKAGES: List[dict] = [
    # Instagram
    {"jap_service_id": 418,  "default_qty": 1000,  "options": _QTY_STD,  "label": "Instagram Türk Takipçi",   "emoji": "📸", "platform": "Instagram", "badge": "🔥 En Popüler"},
    {"jap_service_id": 469,  "default_qty": 1000,  "options": _QTY_STD,  "label": "Instagram Global Takipçi", "emoji": "🌍", "platform": "Instagram"},
    {"jap_service_id": 3,    "default_qty": 1000,  "options": _QTY_STD,  "label": "Instagram Beğeni",          "emoji": "❤️", "platform": "Instagram"},
    # TikTok
    {"jap_service_id": 4686, "default_qty": 1000,  "options": _QTY_STD,  "label": "TikTok Takipçi",            "emoji": "🎵", "platform": "TikTok", "badge": "⭐ En Çok Satan"},
    {"jap_service_id": 1840, "default_qty": 10000, "options": _QTY_VIEW, "label": "TikTok İzlenme",            "emoji": "👁️", "platform": "TikTok"},
    # YouTube
    {"jap_service_id": 1588, "default_qty": 250,   "options": _QTY_STD,  "label": "YouTube Abone",             "emoji": "▶️", "platform": "YouTube", "badge": "🏆 Trend"},
    {"jap_service_id": 4048, "default_qty": 10000, "options": _QTY_VIEW, "label": "YouTube İzlenme",           "emoji": "🎬", "platform": "YouTube"},
    # X
    {"jap_service_id": 4259, "default_qty": 1000,  "options": _QTY_STD,  "label": "X Takipçi",                 "emoji": "✖️", "platform": "X"},
]

MIN_PRICE_TL = 5.0  # 1000 adet için minimum satış fiyatı (TL)


def calculate_hypeup_price(jap_dolar_per_1000: float, dolar_kuru: float | None = None) -> float:
    """
    Maliyet bazlı kademeli fiyatlandırma (1000 adet TL).

      < 3 TL   × 5.0  → izlenme/traffic
      3–15 TL  × 3.2  → LinkedIn, Telegram ucuz (~₺34)
      15–30 TL × 1.75 → Instagram global takipçi (~₺40)
      30–80 TL × 3.90 → TikTok Organik (~₺169), Instagram garantili
      > 80 TL  × 5.0  → X, YouTube abone, premium
    """
    if dolar_kuru is None:
        dolar_kuru = get_current_rate()

    # Marj/bant seçimi RATE_BASELINE kurunda yapılır, sonuç güncel kura orantılanır.
    # Böylece kur değişince fiyat tam orantılı değişir (bant sınırında zıplama olmaz)
    # ve sağlayıcı maliyetine olan kat sabit kalır. dolar_kuru == RATE_BASELINE iken
    # sonuç eski formülle birebir aynıdır.
    base_cost = jap_dolar_per_1000 * RATE_BASELINE

    if base_cost < 3.0:
        base_price = max(base_cost * 5.0, MIN_PRICE_TL)
    elif base_cost < 15.0:
        base_price = base_cost * 3.2
    elif base_cost < 30.0:
        base_price = base_cost * 1.75
    elif base_cost < 80.0:
        base_price = base_cost * 3.90
    else:
        base_price = base_cost * 5.0

    return round(base_price * (dolar_kuru / RATE_BASELINE), 4)


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
