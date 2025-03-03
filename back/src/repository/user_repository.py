from sqlalchemy import select, update, func
from src.data.base import session_scope
from src.data.models import User
from sqlalchemy import insert
import uuid
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession


async def get_user_by_email(email: str) -> User:
    async with session_scope() as session:
        # Find user by email
        result = await session.execute(
            select(User).where(User.email == email)  # type: ignore
        )  # type: ignore
        return result.scalars().first()


async def get_user_by_login(login: str) -> User:
    async with session_scope() as session:
        # Find user by login
        result = await session.execute(
            select(User).where(User.login == login)  # type: ignore
        )  # type: ignore
        return result.scalars().first()


async def create_user(user_data: User) -> User:
    async with session_scope() as session:
        stmt = insert(User).values(
            name=user_data.name,
            login=user_data.login,
            password_hash=user_data.password_hash,
        )
        await session.execute(stmt)
        await session.commit()
        return await get_user_by_login(user_data.login)


async def update_user_avatar(db: AsyncSession, user_id: int, avatar_uuid: Optional[uuid.UUID]) -> None:
    """
    Обновляет UUID аватарки пользователя
    
    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        avatar_uuid: UUID аватарки или None для удаления
    """
    stmt = update(User).where(User.id == user_id).values(avatar_uuid=avatar_uuid) # type: ignore
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
        user_query = select(User).where(User.id == user_id) # type: ignore
        result = await session.execute(user_query)
        user = result.scalars().first()
        
        if not user:
            return None # type: ignore
        
        # Обновляем профиль
        stmt = update(User).where(User.id == user_id).values(**update_data) # type: ignore
        await session.execute(stmt)
        await session.commit()
        
        # Получаем и возвращаем обновленного пользователя
        result = await session.execute(user_query)
        return result.scalars().first()


async def get_users(page: int = 1, size: int = 10) -> Tuple[List[User], int]:
    """Получить список пользователей с пагинацией."""
    async with session_scope() as session:
        # Базовый запрос
        query = select(User)
        
        # Считаем общее количество
        count_result = await session.execute(select(func.count(User.id))) # type: ignore
        total = count_result.scalar() or 0
        
        # Применяем пагинацию
        skip = (page - 1) * size
        query = query.offset(skip).limit(size)
        
        result = await session.execute(query)
        users = list(result.scalars().all())
        
        return users, total


async def get_filtered_users(
    university: Optional[str] = None,
    admission_type: Optional[str] = None,
    page: int = 1,
    size: int = 10,
) -> Tuple[List[User], int]:
    """
    Получить список пользователей с фильтрацией по университету
    и типу поступления
    
    Args:
        university: Университет для фильтрации
        admission_type: Тип поступления для фильтрации
        page: Номер страницы для пагинации
        size: Размер страницы для пагинации
        
    Returns:
        Кортеж из списка пользователей и общего количества пользователей
    """
    async with session_scope() as session:
        # Базовый запрос и условия фильтрации
        conditions = []
        if university:
            conditions.append(User.target_universities.any(university))  # type: ignore
        if admission_type:
            conditions.append(User.admission_type == admission_type)  # type: ignore
            
        # Создаем запрос с фильтрами
        query = select(User)
        if conditions:
            query = query.where(*conditions)
            
        # Считаем общее количество с учетом фильтров
        count_result = await session.execute(select(func.count(User.id)).where(*conditions) if conditions else select(func.count(User.id))) # type: ignore
        total = count_result.scalar() or 0
        
        # Применяем пагинацию
        skip = (page - 1) * size
        query = query.offset(skip).limit(size)
        
        result = await session.execute(query)
        users = list(result.scalars().all())
        
        return users, total
