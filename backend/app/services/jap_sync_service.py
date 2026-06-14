"""
JAP Otomatik Sipariş Takibi
Her saat processing/pending siparişlerin durumunu JAP'tan çekip günceller.
İptal durumunda kullanıcı bakiyesini otomatik iade eder, admin'e Telegram bildirimi gönderir.
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
    "Partial":     "partial",
    "Canceled":    "cancelled",
    "Refunded":    "refunded",
}

BATCH_SIZE = 100


async def _refund_user(db, user_id: str, amount_tl: float, order_id: str):
    """Kullanıcı bakiyesine iade ekle."""
    row = db.table("users").select("balance").eq("id", user_id).limit(1).execute()
    if not row.data:
        logger.warning(f"[JAPSync] İade edilecek kullanıcı bulunamadı: {user_id}")
        return
    current = float(row.data[0]["balance"])
    new_bal = round(current + amount_tl, 4)
    db.table("users").update({"balance": new_bal}).eq("id", user_id).execute()
    logger.info(f"[JAPSync] İade: order={order_id} user={user_id} +₺{amount_tl:.2f} → bakiye ₺{new_bal:.2f}")


async def sync_order_statuses():
    from app.services.telegram_service import send_telegram
    db = get_supabase()
    jap = get_jap_client()

    result = (
        db.table("orders")
        .select("id, user_id, jap_order_id, status, quantity, charge_tl, services(service_name)")
        .in_("status", ["processing", "pending"])
        .not_.is_("jap_order_id", "null")
        .execute()
    )

    orders = result.data or []
    if not orders:
        logger.info("[JAPSync] Güncellenecek sipariş yok.")
        return

    jap_ids = [o["jap_order_id"] for o in orders]
    updated = cancelled_count = 0
    cancelled_alerts = []

    for i in range(0, len(jap_ids), BATCH_SIZE):
        batch_ids    = jap_ids[i : i + BATCH_SIZE]
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

            svc_name   = (order.get("services") or {}).get("service_name", "Sipariş")
            charge_tl  = float(order.get("charge_tl") or 0)

            # ── İptal: tam iade ───────────────────────────────────────────
            if new_status == "cancelled":
                db.table("orders").update({"status": "cancelled"}).eq("id", order["id"]).execute()
                updated += 1
                cancelled_count += 1

                if charge_tl > 0:
                    await _refund_user(db, order["user_id"], charge_tl, order["id"])

                create_notification(
                    order["user_id"],
                    "Sipariş İptal Edildi — Bakiye İade Edildi",
                    f"{svc_name} siparişin iptal edildi. "
                    + (f"₺{charge_tl:.2f} bakiyene iade edildi." if charge_tl > 0 else ""),
                    "error",
                )
                cancelled_alerts.append(
                    f"• {svc_name} | order={order['id']} | ₺{charge_tl:.2f} iade"
                )

            # ── Kısmi tamamlama: eksik miktarı iade et ───────────────────
            elif new_status == "partial":
                remains  = int(jap_data.get("remains", 0))
                qty      = int(order.get("quantity") or 0)
                if qty > 0 and remains > 0 and charge_tl > 0:
                    refund_tl = round(charge_tl * remains / qty, 4)
                else:
                    refund_tl = 0

                db.table("orders").update({"status": "completed"}).eq("id", order["id"]).execute()
                updated += 1

                if refund_tl > 0:
                    await _refund_user(db, order["user_id"], refund_tl, order["id"])

                create_notification(
                    order["user_id"],
                    "Sipariş Kısmen Tamamlandı",
                    f"{svc_name}: {qty - remains:,}/{qty:,} adet teslim edildi."
                    + (f" ₺{refund_tl:.2f} iade edildi." if refund_tl > 0 else ""),
                    "warning",
                )

            # ── Tamamlandı ────────────────────────────────────────────────
            elif new_status == "completed":
                db.table("orders").update({"status": "completed"}).eq("id", order["id"]).execute()
                updated += 1
                create_notification(
                    order["user_id"],
                    "Siparişin Tamamlandı ✅",
                    f"{svc_name} için {order['quantity']:,} adet sipariş tamamlandı.",
                    "success",
                )

            # ── Diğer durum değişiklikleri (pending→processing vb.) ───────
            else:
                db.table("orders").update({"status": new_status}).eq("id", order["id"]).execute()
                updated += 1

    logger.info(f"[JAPSync] {updated} sipariş güncellendi ({cancelled_count} iptal), {len(orders)} kontrol edildi.")

    # Admin'e tek mesajla tüm iptal özeti
    if cancelled_alerts:
        await send_telegram(
            f"🔴 <b>Otomatik İptal Tespiti ({cancelled_count} sipariş)</b>\n\n"
            + "\n".join(cancelled_alerts) +
            "\n\n💡 İlgili servisleri <code>check_prm4u_service_ids</code> ile incele."
        )
