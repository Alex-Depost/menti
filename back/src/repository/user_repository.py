from sqlalchemy import select, update
from src.data.base import session_scope
from src.data.models import User
from sqlalchemy import insert
import uuid
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession


async def get_user_by_email(email: str) -> User:
    async with session_scope() as session:
        # Find user by email
        result = await session.execute(
            select(User).where(User.email == email)  # type: ignore
        )  # type: ignore
        return result.scalars().first()


async def create_user(user_data: User) -> User:
    async with session_scope() as session:
        stmt = insert(User).values(
            name=user_data.email.split("@")[0],
            email=user_data.email,
            password_hash=user_data.password_hash,
        )
        await session.execute(stmt)
        await session.commit()
        return await get_user_by_email(user_data.email)


async def update_user_avatar(db: AsyncSession, user_id: int, avatar_uuid: Optional[uuid.UUID]) -> None:
    """
    Обновляет UUID аватарки пользователя
    
    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        avatar_uuid: UUID аватарки или None для удаления
    """
    stmt = update(User).where(User.id == user_id).values(avatar_uuid=avatar_uuid)
    await db.execute(stmt)
    await db.commit()


async def update_user_profile(user_id: int, update_data: Dict[str, Any]) -> User:
    """
    Обновляет профиль пользователя
    
    Args:
        user_id: ID пользователя
        update_data: Словарь с обновляемыми полями
        
    Returns:
        Обновленный объект пользователя
    """
    async with session_scope() as session:
        # Сначала получаем пользователя, чтобы убедиться, что он существует
        user_query = select(User).where(User.id == user_id)
        result = await session.execute(user_query)
        user = result.scalars().first()
        
        if not user:
            return None
        
        # Обновляем профиль
        stmt = update(User).where(User.id == user_id).values(**update_data)
        await session.execute(stmt)
        await session.commit()
        
        # Получаем и возвращаем обновленного пользователя
        result = await session.execute(user_query)
        return result.scalars().first()
