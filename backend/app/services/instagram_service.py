"""
Instagram Graph API — İçerik Yayınlama Servisi
Adım 1: Media container oluştur (image_url + caption)
Adım 2: Yayınla (media_publish)
"""

import logging
import os
import httpx

logger = logging.getLogger(__name__)

IG_BASE = "https://graph.instagram.com/v21.0"


def _token() -> str:
    return os.getenv("META_IG_TOKEN", "")


def _user_id() -> str:
    return os.getenv("META_IG_USER_ID", "")


async def create_media_container(image_url: str, caption: str) -> str:
    """Adım 1: Image container oluştur, creation_id döner."""
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{IG_BASE}/{_user_id()}/media",
            data={
                "image_url": image_url,
                "caption": caption,
                "access_token": _token(),
            },
        )
        data = r.json()
        if "id" not in data:
            raise ValueError(f"Container oluşturulamadı: {data}")
        logger.info(f"[IG] Container: {data['id']}")
        return data["id"]


async def wait_until_container_ready(creation_id: str, timeout_s: int = 60, interval_s: int = 3) -> None:
    """Container işlenene kadar (status_code=FINISHED) bekle, yoksa publish 'Media ID is not available' hatası verir."""
    import asyncio

    async with httpx.AsyncClient(timeout=15) as client:
        elapsed = 0
        while elapsed < timeout_s:
            r = await client.get(
                f"{IG_BASE}/{creation_id}",
                params={"fields": "status_code", "access_token": _token()},
            )
            data = r.json()
            status = data.get("status_code")
            if status == "FINISHED":
                return
            if status == "ERROR":
                raise ValueError(f"Container işlenirken hata: {data}")
            await asyncio.sleep(interval_s)
            elapsed += interval_s
        logger.warning(f"[IG] Container {creation_id} {timeout_s}s içinde hazır olmadı, yine de yayınlamayı deniyorum.")


async def publish_container(creation_id: str) -> str:
    """Adım 2: Container'ı yayınla, media_id döner."""
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{IG_BASE}/{_user_id()}/media_publish",
            data={
                "creation_id": creation_id,
                "access_token": _token(),
            },
        )
        data = r.json()
        if "id" not in data:
            raise ValueError(f"Yayınlama başarısız: {data}")
        logger.info(f"[IG] Yayınlandı: {data['id']}")
        return data["id"]


async def post_to_instagram(image_url: str, caption: str) -> str:
    """Tek adımda image_url + caption ile Instagram'a post at. media_id döner."""
    creation_id = await create_media_container(image_url, caption)
    await wait_until_container_ready(creation_id)
    media_id = await publish_container(creation_id)
    return media_id


async def refresh_token() -> str | None:
    """Token'ı yenile (60 günlük süreyi uzat). Yeni token döner."""
    app_id = os.getenv("META_APP_ID", "")
    app_secret = os.getenv("META_APP_SECRET", "")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(
                f"{IG_BASE}/refresh_access_token",
                params={
                    "grant_type": "ig_refresh_token",
                    "client_secret": app_secret,
                    "access_token": _token(),
                },
            )
            data = r.json()
            if "access_token" in data:
                logger.info(f"[IG] Token yenilendi, geçerlilik: {data.get('expires_in', '?')}s")
                return data["access_token"]
            logger.warning(f"[IG] Token yenileme başarısız: {data}")
    except Exception as e:
        logger.error(f"[IG] Token yenileme hatası: {e}")
    return None
