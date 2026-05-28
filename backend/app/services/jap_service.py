"""
JustAnotherPanel (JAP) API Köprüsü
────────────────────────────────────
Desteklenen metodlar:
  - get_services()   → tüm servisleri çek
  - add_order()      → sipariş ver
  - get_order()      → sipariş durumu sorgula
  - get_balance()    → JAP bakiye kontrolü
"""

import httpx
from typing import Optional
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)


class JAPClient:
    def __init__(self):
        s = get_settings()
        self.api_key = s.JAP_API_KEY
        self.base_url = s.JAP_API_URL

    async def _post(self, action: str, extra: dict = {}) -> dict:
        payload = {"key": self.api_key, "action": action, **extra}
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(self.base_url, data=payload)
                r.raise_for_status()
                data = r.json()
                if isinstance(data, dict) and "error" in data:
                    raise ValueError(f"JAP API hatası: {data['error']}")
                return data
        except httpx.HTTPError as e:
            logger.error(f"[JAPClient] HTTP hatası ({action}): {e}")
            raise
        except Exception as e:
            logger.error(f"[JAPClient] Beklenmeyen hata ({action}): {e}")
            raise

    async def get_services(self) -> list[dict]:
        """JAP'taki tüm servisleri çek."""
        data = await self._post("services")
        if isinstance(data, list):
            return data
        return []

    async def add_order(
        self,
        service_id: int,
        link: str,
        quantity: int,
        runs: Optional[int] = None,
        interval: Optional[int] = None,
    ) -> dict:
        """
        JAP'a sipariş gönder.
        Returns: {"order": <jap_order_id>}
        """
        payload = {
            "service": service_id,
            "link": link,
            "quantity": quantity,
        }
        if runs is not None:
            payload["runs"] = runs
        if interval is not None:
            payload["interval"] = interval

        return await self._post("add", payload)

    async def get_order(self, jap_order_id: int) -> dict:
        """
        Sipariş durumunu sorgula.
        Returns: {"charge": "...", "start_count": "...", "status": "...", "remains": "..."}
        """
        return await self._post("status", {"order": jap_order_id})

    async def get_orders_bulk(self, jap_order_ids: list[int]) -> dict:
        """Toplu sipariş durumu sorgula."""
        ids_str = ",".join(map(str, jap_order_ids))
        return await self._post("status", {"orders": ids_str})

    async def get_balance(self) -> dict:
        """JAP bakiye bilgisi."""
        return await self._post("balance")


# Alias — services.py router'ında bu isimle import edilir
JustAnotherPanelClient = JAPClient


# Singleton
_jap_client: JAPClient | None = None


def get_jap_client() -> JAPClient:
    global _jap_client
    if _jap_client is None:
        _jap_client = JAPClient()
    return _jap_client
