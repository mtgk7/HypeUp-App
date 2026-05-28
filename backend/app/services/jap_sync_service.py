"""
JAP Otomatik Sipariş Takibi
Her saat processing/pending siparişlerin durumunu JAP'tan çekip günceller.
"""

import logging
from app.database import get_supabase
from app.services.jap_service import get_jap_client
from app.routers.notifications import create_notification

logger = logging.getLogger(__name__)

JAP_TO_HYPEUP = {
    "Pending":     "pending",
    "In progress": "processing",
    "Processing":  "processing",
    "Completed":   "completed",
    "Partial":     "completed",
    "Canceled":    "cancelled",
    "Refunded":    "refunded",
}

BATCH_SIZE = 100


async def sync_order_statuses():
    db = get_supabase()
    jap = get_jap_client()

    result = (
        db.table("orders")
        .select("id, user_id, jap_order_id, status, quantity, services(service_name)")
        .in_("status", ["processing", "pending"])
        .not_.is_("jap_order_id", "null")
        .execute()
    )

    orders = result.data or []
    if not orders:
        logger.info("[JAPSync] Güncellenecek sipariş yok.")
        return

    jap_ids = [o["jap_order_id"] for o in orders]
    updated = 0

    for i in range(0, len(jap_ids), BATCH_SIZE):
        batch_ids   = jap_ids[i : i + BATCH_SIZE]
        batch_orders = [o for o in orders if o["jap_order_id"] in batch_ids]

        try:
            jap_statuses = await jap.get_orders_bulk(batch_ids)
        except Exception as e:
            logger.error(f"[JAPSync] Toplu sorgu hatası: {e}")
            continue

        for order in batch_orders:
            jap_data = jap_statuses.get(str(order["jap_order_id"]))
            if not jap_data:
                continue

            jap_status = jap_data.get("status", "")
            new_status = JAP_TO_HYPEUP.get(jap_status)

            if not new_status or new_status == order["status"]:
                continue

            db.table("orders").update({"status": new_status}).eq("id", order["id"]).execute()
            updated += 1

            svc_name = (order.get("services") or {}).get("service_name", "Sipariş")

            if new_status == "completed":
                create_notification(
                    order["user_id"],
                    "Siparişin Tamamlandı ✅",
                    f"{svc_name} için {order['quantity']:,} adet sipariş tamamlandı.",
                    "success",
                )
            elif new_status == "cancelled":
                create_notification(
                    order["user_id"],
                    "Sipariş İptal Edildi",
                    f"{svc_name} siparişin iptal edildi.",
                    "error",
                )

    logger.info(f"[JAPSync] {updated} sipariş güncellendi, {len(orders)} kontrol edildi.")
