"""
Dinamik Kâr Marjı Motoru
────────────────────────
Kural: 1000 adet TL maliyeti baz alınır.

  < 1 TL   → maliyet × 5   (%400 kâr — izlenme/beğeni gibi ucuz servisler)
  ≥ 1 TL   → maliyet × 4   (%300 kâr — takipçi, abone vb.)
"""

from app.services.currency_service import get_current_rate


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

    multiplier = 5 if cost_tl_per_1000 < 1.0 else 4

    return round(cost_tl_per_1000 * multiplier, 4)


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
