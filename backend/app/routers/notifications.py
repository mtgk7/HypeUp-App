from fastapi import APIRouter, Depends
from app.database import get_supabase
from app.utils.auth import get_current_user
import uuid

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
async def get_notifications(user: dict = Depends(get_current_user)):
    db = get_supabase()
    result = (
        db.table("notifications")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(30)
        .execute()
    )
    return result.data


@router.get("/unread-count")
async def unread_count(user: dict = Depends(get_current_user)):
    db = get_supabase()
    result = (
        db.table("notifications")
        .select("id", count="exact")
        .eq("user_id", user["id"])
        .eq("is_read", False)
        .execute()
    )
    return {"count": result.count or 0}


@router.patch("/{notification_id}/read")
async def mark_read(notification_id: str, user: dict = Depends(get_current_user)):
    db = get_supabase()
    db.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user["id"]).execute()
    return {"ok": True}


@router.patch("/read-all")
async def mark_all_read(user: dict = Depends(get_current_user)):
    db = get_supabase()
    db.table("notifications").update({"is_read": True}).eq("user_id", user["id"]).eq("is_read", False).execute()
    return {"ok": True}


# ──────────────────────────────────────────────
# Yardımcı fonksiyon — diğer router'lardan çağrılır
# ──────────────────────────────────────────────
def create_notification(user_id: str, title: str, message: str, notif_type: str = "info"):
    try:
        db = get_supabase()
        db.table("notifications").insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notif_type,
        }).execute()
    except Exception:
        pass  # Bildirim oluşturulamazsa ana işlemi engelleme
