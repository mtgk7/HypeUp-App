"""
PRM4U API Köprüsü (SMM Panel API v2)
──────────────────────────────────────
Desteklenen metodlar:
  - get_services()      → tüm servisleri çek
  - add_order()         → sipariş ver
  - get_order()         → sipariş durumu sorgula
  - get_orders_bulk()   → toplu durum sorgula
  - get_balance()       → bakiye kontrolü
"""

import httpx
from typing import Optional
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)


class PRM4UClient:
    def __init__(self):
        s = get_settings()
        self.api_key = s.PRM4U_API_KEY
        self.base_url = s.PRM4U_API_URL

    async def _post(self, action: str, extra: dict = {}) -> dict:
        if not self.api_key:
            raise ValueError("PRM4U API anahtarı ayarlanmamış. Render/env'e PRM4U_API_KEY ekleyin.")
        payload = {"key": self.api_key, "action": action, **extra}
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(self.base_url, data=payload)
                r.raise_for_status()
                data = r.json()
                if isinstance(data, dict) and "error" in data:
                    raise ValueError(f"PRM4U API hatası: {data['error']}")
                return data
        except httpx.HTTPError as e:
            logger.error(f"[PRM4UClient] HTTP hatası ({action}): {e}")
            raise
        except Exception as e:
            logger.error(f"[PRM4UClient] Beklenmeyen hata ({action}): {e}")
            raise

    async def get_services(self) -> list[dict]:
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
        """Returns: {"order": <prm4u_order_id>}"""
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

    async def get_order(self, order_id: int) -> dict:
        """Returns: {"charge": "...", "start_count": "...", "status": "...", "remains": "..."}"""
        return await self._post("status", {"order": order_id})

    async def get_orders_bulk(self, order_ids: list[int]) -> dict:
        ids_str = ",".join(map(str, order_ids))
        return await self._post("status", {"orders": ids_str})

    async def get_balance(self) -> dict:
        return await self._post("balance")


# Geriye dönük uyumluluk aliasları
JAPClient = PRM4UClient
JustAnotherPanelClient = PRM4UClient

_client: PRM4UClient | None = None


def get_jap_client() -> PRM4UClient:
    global _client
    if _client is None:
        _client = PRM4UClient()
    return _client


get_prm4u_client = get_jap_client
