# backend/app/routers/services.py

from fastapi import APIRouter, Depends, HTTPException, status, Response
from app.database import get_supabase_client
from app.services.pricing_service import hesapla_hypeup_satis_fiyati, get_tier_price, FEATURED_PACKAGES
from app.services.jap_service import JustAnotherPanelClient
from app.models.schemas import ServicePriceQuery, ServicePriceResponse
from app.utils.auth import get_current_user
from app.services.currency_service import get_current_rate
from app.services.pricing_service import calculate_order_cost
import os

router = APIRouter(
    prefix="/services",
    tags=["Services"]
)

PRM4U_URL = os.getenv("PRM4U_API_URL", "https://prm4u.com/api/v2")
PRM4U_KEY = os.getenv("PRM4U_API_KEY", "")


# --- 0. PUBLIC — Auth gerektirmez, landing page için ---
@router.get("/public")
async def list_public_services(response: Response):
    """Giriş gerektirmez. Landing page servis + fiyat listesi için. Tüm aktif servisleri sayfalayarak döner."""
    supabase = get_supabase_client()
    rate = get_current_rate()
    response.headers["Cache-Control"] = "no-store"  # fiyat asla önbellekten gelmesin
    services = []
    page_size = 1000
    offset = 0
    while True:
        result = (
            supabase.table("services")
            .select("id, service_name, jap_service_id, jap_dolar_price, hypeup_tl_price, min_order, max_order, categories(platform_name, category_name)")
            .eq("is_active", True)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = result.data or []
        for svc in batch:
            cat = svc.pop("categories", {}) or {}
            # Tier'lı servislerde gösterilen fiyat = retail tier fiyatı (checkout ile aynı),
            # diğerlerinde formül fiyatı — ikisi de güncel kurdan CANLI hesaplanır (DB'ye bağlı değil).
            tier = get_tier_price(int(svc["jap_service_id"]), 1000, rate)
            if tier is not None:
                display_price = tier
            else:
                jd = svc.get("jap_dolar_price")
                display_price = hesapla_hypeup_satis_fiyati(float(jd), rate) if jd else float(svc["hypeup_tl_price"])
            services.append({
                "id":              svc["id"],
                "service_name":    svc["service_name"],
                "hypeup_tl_price": float(display_price),
                "min_order":       svc["min_order"],
                "max_order":       svc["max_order"],
                "platform_name":   cat.get("platform_name", ""),
                "category_name":   cat.get("category_name", ""),
            })
        if len(batch) < page_size:
            break
        offset += page_size
    return services


# --- 0b. PUBLIC — Öne çıkan hazır paketler (landing page) ---
@router.get("/featured")
async def list_featured_packages(response: Response):
    """Giriş gerektirmez. Landing page'deki popüler paketler — kesin (tier) retail fiyatlarıyla."""
    supabase = get_supabase_client()
    rate = get_current_rate()
    response.headers["Cache-Control"] = "no-store"  # fiyat asla önbellekten gelmesin
    jap_ids = [p["jap_service_id"] for p in FEATURED_PACKAGES]
    rows = (
        supabase.table("services")
        .select("id, service_name, jap_service_id, jap_dolar_price, min_order, max_order, hypeup_tl_price, is_active, categories(platform_name)")
        .in_("jap_service_id", jap_ids)
        .eq("is_active", True)
        .execute()
    ).data or []
    by_jap = {int(r["jap_service_id"]): r for r in rows}

    out = []
    for pkg in FEATURED_PACKAGES:
        svc = by_jap.get(pkg["jap_service_id"])
        if not svc:
            continue
        cat = svc.get("categories") or {}
        min_order = svc["min_order"] or 1
        max_order = svc["max_order"] or 0

        # Servis min/max sınırına uyan miktar seçenekleri + her biri için tier fiyatı
        options = []
        for q in pkg["options"]:
            if q < min_order or (max_order and q > max_order):
                continue
            unit = get_tier_price(pkg["jap_service_id"], q, rate)
            if unit is None:
                jd = svc.get("jap_dolar_price")
                unit = hesapla_hypeup_satis_fiyati(float(jd), rate) if jd else float(svc["hypeup_tl_price"])
            options.append({
                "qty":           q,
                "unit_per_1000": round(unit, 2),
                "price_tl":      round(unit / 1000 * q, 2),
            })
        if not options:
            # Tüm seçenekler aralık dışıysa min_order'ı tek seçenek yap
            jd = svc.get("jap_dolar_price")
            unit = get_tier_price(pkg["jap_service_id"], min_order, rate) or (
                hesapla_hypeup_satis_fiyati(float(jd), rate) if jd else float(svc["hypeup_tl_price"]))
            options.append({"qty": min_order, "unit_per_1000": round(unit, 2),
                            "price_tl": round(unit / 1000 * min_order, 2)})

        default_qty = pkg["default_qty"]
        if not any(o["qty"] == default_qty for o in options):
            default_qty = options[0]["qty"]

        out.append({
            "label":          pkg["label"],
            "emoji":          pkg["emoji"],
            "platform":       cat.get("platform_name", pkg["platform"]),
            "service_id":     svc["id"],
            "jap_service_id": pkg["jap_service_id"],
            "min_order":      min_order,
            "default_qty":    default_qty,
            "options":        options,
        })
    return out


# --- 1. MÜŞTERİNİN GÖRECEĞİ AKTİF SERVİSLERİ LİSTELEME ---

# Gösterilecek servisler — JAP service ID listesi.
# Buraya eklenen ID'ler sipariş formunda görünür, diğerleri gizlenir.
ALLOWED_JAP_SERVICE_IDS = [
    47,     # Instagram Türk Takipçi
    8216,   # Instagram Beğeni
    10216,  # Instagram Global Takipçi
    3519,   # YouTube Abone [TR]
    7533,   # YouTube İzlenme
    10055,  # TikTok Takipçi
    10023,  # TikTok Beğeni
    10019,  # TikTok İzlenme
    8695,   # X (Twitter) Takipçi
    9393,   # X (Twitter) Beğeni
]

@router.get("/list")
async def list_services(response: Response, _user: dict = Depends(get_current_user)):
    """
    Kullanıcının sipariş formunda göreceği platform ve servis listesini döner.
    Fiyatlar güncel kurdan CANLI hesaplanır (tier veya formül) — DB'deki eski değere bağlı değil.
    """
    supabase = get_supabase_client()
    rate = get_current_rate()
    response.headers["Cache-Control"] = "no-store"  # fiyat asla önbellekten gelmesin

    # Veritabanındaki aktif kategorileri ve servisleri çek
    categories = (
        supabase.table("categories")
        .select("*")
        .eq("is_active", True)
        .order("display_order")
        .execute()
    )
    # Sadece izin verilen JAP ID'lerini çek — sayfalamaya gerek kalmaz
    batch = (
        supabase.table("services")
        .select("*, categories(platform_name, category_name)")
        .eq("is_active", True)
        .in_("jap_service_id", ALLOWED_JAP_SERVICE_IDS)
        .execute()
    ).data or []

    if not categories.data:
        return {"categories": [], "services": []}

    # Flatten: category join alanlarını servis root'una taşı
    services_flat = []
    for svc in batch:
        cat = svc.pop("categories", {}) or {}
        svc["platform_name"] = cat.get("platform_name", "")
        svc["category_name"] = cat.get("category_name", "")
        # Tier'lı servislerde gösterilen fiyat = retail tier fiyatı (sipariş ile aynı)
        try:
            tier = get_tier_price(int(svc["jap_service_id"]), 1000, rate)
        except (TypeError, ValueError):
            tier = None
        if tier is not None:
            svc["hypeup_tl_price"] = float(tier)
        else:
            jd = svc.get("jap_dolar_price")
            if jd:
                svc["hypeup_tl_price"] = hesapla_hypeup_satis_fiyati(float(jd), rate)
        services_flat.append(svc)

    return {
        "categories": categories.data,
        "services": services_flat,
    }


# --- 2. ANLLIK FİYAT HESAPLAMA (Sipariş formundaki dinamik hesap) ---
@router.post("/price", response_model=ServicePriceResponse)
async def calculate_price(
    body: ServicePriceQuery,
    _user: dict = Depends(get_current_user),
):
    """Belirli servis + adet için anlık TL fiyat hesapla."""
    supabase = get_supabase_client()

    result = (
        supabase.table("services")
        .select("*")
        .eq("id", body.service_id)
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Servis bulunamadı")

    svc = result.data[0]

    if body.quantity < svc["min_order"]:
        raise HTTPException(status_code=400, detail=f"Minimum sipariş: {svc['min_order']}")
    if body.quantity > svc["max_order"]:
        raise HTTPException(status_code=400, detail=f"Maksimum sipariş: {svc['max_order']}")

    dolar_kuru = get_current_rate()

    # Tier varsa tier, yoksa formül — ikisi de güncel kurdan CANLI hesaplanır
    tier_price = get_tier_price(int(svc["jap_service_id"]), body.quantity, dolar_kuru)
    if tier_price is not None:
        effective_tl_per_1000 = tier_price
    else:
        jd = svc.get("jap_dolar_price")
        effective_tl_per_1000 = hesapla_hypeup_satis_fiyati(float(jd), dolar_kuru) if jd else float(svc["hypeup_tl_price"])

    costs = calculate_order_cost(
        jap_dolar_per_1000=float(svc["jap_dolar_price"]),
        hypeup_tl_per_1000=effective_tl_per_1000,
        quantity=body.quantity,
        dolar_kuru=dolar_kuru,
    )

    return ServicePriceResponse(
        service_id=body.service_id,
        quantity=body.quantity,
        unit_tl_price=round(effective_tl_per_1000 / 1000, 6),
        total_tl=costs["charge_tl"],
        total_dolar=costs["cost_dolar"],
    )


# --- 3. ADMIN İÇİN TOPTANCI (JAP) FİYATLARINI SENKRONİZE ETME ---
@router.post("/sync-from-provider", status_code=status.HTTP_200_OK)
async def sync_services_from_provider():
    """
    Sadece Adminin tetikleyeceği, JAP API'sinden güncel dolar maliyetlerini çekip
    HypeUp veritabanındaki tüm TL satış fiyatlarını anlık kurla yeniden hesaplayan modül.
    """
    supabase = get_supabase_client()

    # 1. Güncel Sistem Kurunu Al
    kur_query = (
        supabase.table("settings")
        .select("value")
        .eq("key", "dolar_kuru")
        .limit(1)
        .execute()
    )
    if not kur_query.data:
        raise HTTPException(status_code=404, detail="Sistemde dolar kuru ayarı bulunamadı.")

    current_kur = float(kur_query.data[0]["value"])

    # 2. JAP API'sinden tüm servis listesini ham olarak iste
    try:
        import httpx
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(PRM4U_URL, data={"key": PRM4U_KEY, "action": "services"})
            r.raise_for_status()
            jap_services = r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Toptancı API'sine bağlanılamadı: {str(e)}")

    if isinstance(jap_services, dict) and "error" in jap_services:
        raise HTTPException(status_code=400, detail=f"PRM4U Hatası: {jap_services['error']}")

    # 3. Bizim yerelde eşleştirdiğimiz servisleri güncelle
    local_services = (
        supabase.table("services")
        .select("id, jap_service_id")
        .execute()
    )

    if not local_services.data:
        return {
            "success": True,
            "message": "Veritabanında henüz eşleşmiş servis bulunmuyor. Önce servisleri ekleyin.",
        }

    updated_count = 0

    # JAP'tan gelen veriyi hızlı arama için map'e çeviriyoruz (Hız optimizasyonu)
    jap_map = {str(item["service"]): item for item in jap_services if "service" in item}

    for local_srv in local_services.data:
        jap_id_str = str(local_srv["jap_service_id"])

        if jap_id_str in jap_map:
            jap_item = jap_map[jap_id_str]

            # Toptancının ham dolar fiyatı (Örn: 0.28 = 1000 adet için)
            new_dolar_price = float(jap_item["rate"])

            # Kâr motorumuz devrede! Yeni TL fiyatı hesaplanıyor
            new_tl_price = hesapla_hypeup_satis_fiyati(new_dolar_price, current_kur)

            # Veritabanını güncelle
            supabase.table("services").update({
                "jap_dolar_price": new_dolar_price,
                "hypeup_tl_price": new_tl_price,
                "min_order": int(jap_item.get("min", 10)),
                "max_order": int(jap_item.get("max", 500000)),
            }).eq("id", local_srv["id"]).execute()

            updated_count += 1

    return {
        "success": True,
        "message": (
            f"Senkronizasyon tamamlandı. "
            f"{updated_count} adet servisin fiyatı "
            f"güncel {current_kur} kuruyla yenilendi."
        ),
    }
