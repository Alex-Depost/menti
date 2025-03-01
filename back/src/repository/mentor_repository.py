from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from src.data.base import session_scope
from src.data.models import Mentor, Tag
from sqlalchemy import insert
import uuid
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from src.schemas.schemas import MentorUpdateSchema


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


async def update_mentor_profile(mentor_id: int, update_data: Dict[str, Any]) -> Mentor:
    """
    Обновляет профиль ментора
    
    Args:
        mentor_id: ID ментора
        update_data: Словарь с обновляемыми полями
        
    Returns:
        Обновленный объект ментора
    """
    async with session_scope() as session:
        # Сначала получаем ментора, чтобы убедиться, что он существует
        mentor_query = select(Mentor).where(Mentor.id == mentor_id)
        result = await session.execute(mentor_query)
        mentor = result.scalars().first()
        
        if not mentor:
            return None
        
        # Обновляем профиль
        stmt = update(Mentor).where(Mentor.id == mentor_id).values(**update_data)
        await session.execute(stmt)
        await session.commit()
        
        # Получаем и возвращаем обновленного ментора
        result = await session.execute(mentor_query)
        return result.scalars().first()


async def get_mentor_by_id(mentor_id: int) -> Mentor:
    """Получить ментора по ID с загрузкой тегов."""
    async with session_scope() as session:
        result = await session.execute(
            select(Mentor)
            .where(Mentor.id == mentor_id)
            .options(selectinload(Mentor.tags))
        )
        return result.scalars().first()


async def get_mentors(page: int = 1, size: int = 10, tag_name: str = None) -> tuple[list[Mentor], int]:
    """Получить список менторов с пагинацией и фильтрацией по тегу."""
    async with session_scope() as session:
        query = select(Mentor).options(selectinload(Mentor.tags))
        count_query = select(Mentor)
        
        if tag_name:
            tag_query = select(Tag).where(Tag.name.ilike(f"%{tag_name}%"))
            tag_result = await session.execute(tag_query)
            tag = tag_result.scalars().first()
            
            if tag:
                query = query.where(Mentor.tags.any(Tag.id == tag.id))
                count_query = count_query.where(Mentor.tags.any(Tag.id == tag.id))
        
        # Считаем общее количество
        count_result = await session.execute(select(Mentor.id).select_from(count_query.subquery()))
        total = len(count_result.all())
        
        # Применяем пагинацию
        skip = (page - 1) * size
        query = query.offset(skip).limit(size)
        
        result = await session.execute(query)
        mentors = result.scalars().all()
        
        return mentors, total


async def update_mentor(mentor_id: int, update_data: MentorUpdateSchema) -> Mentor:
    """Обновить профиль ментора."""
    async with session_scope() as session:
        update_values = {}
        
        # Фильтруем None значения
        for key, value in update_data.dict(exclude_none=True).items():
            # Обрабатываем пароль отдельно, если потребуется хеширование
            if key != 'password':
                update_values[key] = value
        
        if update_values:
            stmt = update(Mentor).where(Mentor.id == mentor_id).values(**update_values)
            await session.execute(stmt)
        
        # Возвращаем обновленные данные
        result = await session.execute(
            select(Mentor)
            .where(Mentor.id == mentor_id)
            .options(selectinload(Mentor.tags))
        )
        return result.scalars().first()


async def add_tags_to_mentor(mentor_id: int, tag_ids: list[int]) -> Mentor:
    """Добавить теги ментору."""
    async with session_scope() as session:
        mentor = await session.get(Mentor, mentor_id)
        if not mentor:
            return None
        
        tags = []
        for tag_id in tag_ids:
            tag = await session.get(Tag, tag_id)
            if tag:
                tags.append(tag)
        
        mentor.tags.extend(tags)
        await session.commit()
        
        # Перезагружаем ментора с тегами
        result = await session.execute(
            select(Mentor)
            .where(Mentor.id == mentor_id)
            .options(selectinload(Mentor.tags))
        )
        return result.scalars().first()


async def remove_tags_from_mentor(mentor_id: int, tag_ids: list[int]) -> Mentor:
    """Удалить теги у ментора."""
    async with session_scope() as session:
        mentor = await session.get(Mentor, mentor_id)
        if not mentor:
            return None
            
        for tag_id in tag_ids:
            tag = await session.get(Tag, tag_id)
            if tag and tag in mentor.tags:
                mentor.tags.remove(tag)
                
        await session.commit()
        
        # Перезагружаем ментора с тегами
        result = await session.execute(
            select(Mentor)
            .where(Mentor.id == mentor_id)
            .options(selectinload(Mentor.tags))
        )
        return result.scalars().first()
