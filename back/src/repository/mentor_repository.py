from sqlalchemy import select, update
from src.data.base import session_scope
from src.data.models import Mentor
from sqlalchemy import insert
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession


async def get_mentor_by_email(email: str) -> Mentor:
    async with session_scope() as session:
        # Find Mentor by email
        result = await session.execute(
            select(Mentor).where(Mentor.email == email)  # type: ignore
        )  # type: ignore
        return result.scalars().first()


async def create_mentor(mentor: Mentor) -> Mentor:
    async with session_scope() as session:
        stmt = insert(Mentor).values(
            name=mentor.email.split("@")[0],
            email=mentor.email,
            password_hash=mentor.password_hash,
        )
        await session.execute(stmt)
    return await get_mentor_by_email(mentor.email)


async def update_mentor_avatar(db: AsyncSession, mentor_id: int, avatar_uuid: Optional[uuid.UUID]) -> None:
    """
    Обновляет UUID аватарки ментора
    
    Args:
        db: Сессия базы данных
        mentor_id: ID ментора
        avatar_uuid: UUID аватарки или None для удаления
    """
    stmt = update(Mentor).where(Mentor.id == mentor_id).values(avatar_uuid=avatar_uuid)
    await db.execute(stmt)
    await db.commit()
