# backend/app/routers/services.py

from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_supabase_client
from app.services.pricing_service import hesapla_hypeup_satis_fiyati
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

JAP_URL = os.getenv("JAP_API_URL", "https://justanotherpanel.com/api/v2")
JAP_KEY = os.getenv("JAP_API_KEY", "YOUR_JAP_API_KEY")


# --- 1. MÜŞTERİNİN GÖRECEĞİ AKTİF SERVİSLERİ LİSTELEME ---
@router.get("/list")
async def list_services(_user: dict = Depends(get_current_user)):
    """
    Kullanıcının sipariş formunda göreceği platform ve servis listesini döner.
    Fiyatlar veritabanından kâr motorunun hesapladığı TL cinsinden gelir.
    """
    supabase = get_supabase_client()

    # Veritabanındaki aktif kategorileri ve servisleri çek
    categories = (
        supabase.table("categories")
        .select("*")
        .eq("is_active", True)
        .order("display_order")
        .execute()
    )
    services_raw = (
        supabase.table("services")
        .select("*, categories(platform_name, category_name)")
        .eq("is_active", True)
        .execute()
    )

    if not categories.data:
        return {"categories": [], "services": []}

    # Flatten: category join alanlarını servis root'una taşı
    services_flat = []
    for svc in (services_raw.data or []):
        cat = svc.pop("categories", {}) or {}
        svc["platform_name"] = cat.get("platform_name", "")
        svc["category_name"] = cat.get("category_name", "")
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
    costs = calculate_order_cost(
        jap_dolar_per_1000=float(svc["jap_dolar_price"]),
        hypeup_tl_per_1000=float(svc["hypeup_tl_price"]),
        quantity=body.quantity,
        dolar_kuru=dolar_kuru,
    )

    return ServicePriceResponse(
        service_id=body.service_id,
        quantity=body.quantity,
        unit_tl_price=round(float(svc["hypeup_tl_price"]) / 1000, 6),
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
            r = await client.post(JAP_URL, data={"key": JAP_KEY, "action": "services"})
            r.raise_for_status()
            jap_services = r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Toptancı API'sine bağlanılamadı: {str(e)}")

    if isinstance(jap_services, dict) and "error" in jap_services:
        raise HTTPException(status_code=400, detail=f"JAP Hatası: {jap_services['error']}")

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
