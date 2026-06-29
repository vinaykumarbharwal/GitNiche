import httpx
import json
import logging
from typing import Optional, Any
from app.config import settings

logger = logging.getLogger("gitniche.redis")

class RedisService:
    def __init__(self):
        self.url = settings.UPSTASH_REDIS_REST_URL.strip("/") if settings.UPSTASH_REDIS_REST_URL else None
        self.token = settings.UPSTASH_REDIS_REST_TOKEN
        self.headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        self.enabled = bool(self.url and self.token)
        
        # Local fallback in-memory cache for ease of local development
        self._local_cache = {}
        self._local_cache_expiry = {}

        if not self.enabled:
            logger.warning("Upstash Redis URL or Token not configured. Using local in-memory cache fallback.")

    async def get(self, key: str) -> Optional[str]:
        import time
        if not self.enabled:
            # Simple check for local cache with TTL expiration
            expire_at = self._local_cache_expiry.get(key)
            if expire_at and time.time() > expire_at:
                self._local_cache.pop(key, None)
                self._local_cache_expiry.pop(key, None)
                return None
            return self._local_cache.get(key)
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.url,
                    json=["GET", key],
                    headers=self.headers,
                    timeout=1.0
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("result")
                else:
                    logger.error(f"Redis GET failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error querying Redis cache: {str(e)}")
            self.enabled = False
        
        # Try local fallback on remote error
        expire_at = self._local_cache_expiry.get(key)
        if expire_at and time.time() > expire_at:
            self._local_cache.pop(key, None)
            self._local_cache_expiry.pop(key, None)
            return None
        return self._local_cache.get(key)

    async def set(self, key: str, value: str, expire_seconds: int = 3600) -> bool:
        import time
        # Always update local cache just in case
        self._local_cache[key] = value
        self._local_cache_expiry[key] = time.time() + expire_seconds

        if not self.enabled:
            return True
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.url,
                    json=["SET", key, value, "EX", str(expire_seconds)],
                    headers=self.headers,
                    timeout=1.0
                )
                if response.status_code == 200:
                    return True
                else:
                    logger.error(f"Redis SET failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error saving to Redis cache: {str(e)}")
            self.enabled = False
            
        return False

# Create a singleton instance
redis_service = RedisService()
