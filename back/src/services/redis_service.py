import json
import hashlib
from typing import Any, Optional, List, Dict

import redis.asyncio as redis
from fastapi import Depends

from src.config import REDIS_HOST, REDIS_PORT, REDIS_CACHE_TTL


class RedisService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=REDIS_HOST,
            port=int(REDIS_PORT),
            decode_responses=True
        )
        self.ttl = REDIS_CACHE_TTL

    async def get_cache(self, key: str) -> Optional[dict]:
        """Получить данные из кеша"""
        try:
            data = await self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception:
            return None

    async def set_cache(self, key: str, value: Any) -> bool:
        """Сохранить данные в кеш"""
        try:
            await self.redis_client.setex(
                key,
                self.ttl,
                json.dumps(value)
            )
            return True
        except Exception:
            return False

    def _generate_content_hash(self, items: List[Dict]) -> str:
        """Генерация хеша от списка пользователей/менторов и их описаний"""
        # Сортируем элементы по id для обеспечения стабильного хеша
        sorted_items = sorted(items, key=lambda x: x.get('id', ''))
        
        # Создаем строку из всех описаний и данных
        content_str = json.dumps(sorted_items, sort_keys=True)
        
        # Генерируем хеш
        return hashlib.sha256(content_str.encode()).hexdigest()

    def generate_feed_cache_key(self, description: str, items: List[Dict], filtered: bool, page: int, size: int) -> str:
        """Генерация ключа для кеша фида с учетом хеша контента"""
        content_hash = self._generate_content_hash(items)
        return f"feed:{hash(description)}:{content_hash}:{filtered}:{page}:{size}"


# Singleton instance
redis_service = RedisService()


async def get_redis_service() -> RedisService:
    return redis_service 