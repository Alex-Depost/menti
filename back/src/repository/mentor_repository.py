from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from src.data.base import session_scope
from src.data.models import Mentor
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
    """Получить ментора по ID."""
    async with session_scope() as session:
        result = await session.execute(
            select(Mentor)
            .where(Mentor.id == mentor_id)
        )
        return result.scalars().first()


async def get_mentors(page: int = 1, size: int = 10) -> tuple[list[Mentor], int]:
    """Получить список менторов с пагинацией."""
    async with session_scope() as session:
        query = select(Mentor)
        
        # Считаем общее количество
        count_result = await session.execute(select(Mentor.id).select_from(query.subquery()))
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
        )
        return result.scalars().first()


async def get_filtered_mentors(
    target_universities: list[str] = None,
    admission_type: str = None,
    page: int = 1,
    size: int = 10,
) -> tuple[list[Mentor], int]:
    """
    Получить список менторов с фильтрацией по целевым университетам,
    типу поступления и опционально по тегу
    
    Args:
        target_universities: Список университетов для фильтрации
        admission_type: Тип поступления для фильтрации
        page: Номер страницы для пагинации
        size: Размер страницы для пагинации
        
    Returns:
        Кортеж из списка менторов и общего количества менторов
    """
    async with session_scope() as session:
        # Базовый запрос
        query = select(Mentor)
        count_query = select(Mentor)
        
        # Фильтрация по университетам
        if target_universities and len(target_universities) > 0:
            query = query.where(Mentor.university.in_(target_universities))
            count_query = count_query.where(Mentor.university.in_(target_universities))
        
        # Фильтрация по типу поступления
        if admission_type:
            query = query.where(Mentor.admission_type == admission_type)
            count_query = count_query.where(Mentor.admission_type == admission_type)
        
        # Считаем общее количество
        count_result = await session.execute(select(Mentor.id).select_from(count_query.subquery()))
        total = len(count_result.all())
        
        # Применяем пагинацию
        skip = (page - 1) * size
        query = query.offset(skip).limit(size)
        
        result = await session.execute(query)
        mentors = result.scalars().all()
        
        return mentors, total
