import os
import uuid
import shutil
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Tuple

from src.data.base import session_scope
from src.repository.user_repository import update_user_avatar
from src.repository.mentor_repository import update_mentor_avatar


# Директория для хранения аватарок
AVATARS_DIR = os.path.join("static", "avatars")

# Создаем директорию для аватарок, если она не существует
os.makedirs(AVATARS_DIR, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """Получает расширение файла из имени файла"""
    if "." in filename:
        return os.path.splitext(filename)[1].lower()
    return ""


def get_avatar_path(avatar_uuid: uuid.UUID, extension: str = None) -> str:
    """
    Получаем путь к файлу аватарки по UUID
    
    Args:
        avatar_uuid: UUID аватарки
        extension: Расширение файла (если известно)
    
    Returns:
        Полный путь к файлу аватарки
    """
    if extension:
        return os.path.join(AVATARS_DIR, f"{avatar_uuid}{extension}")
    
    # Если расширение не указано, ищем файл по UUID в директории
    base_filename = str(avatar_uuid)
    for file in os.listdir(AVATARS_DIR):
        if file.startswith(base_filename):
            return os.path.join(AVATARS_DIR, file)
    
    # Если файл не найден, возвращаем путь без расширения (обратная совместимость)
    return os.path.join(AVATARS_DIR, f"{avatar_uuid}")


async def save_avatar(
    file: UploadFile,
    avatar_uuid: uuid.UUID,
    user_id: Optional[int] = None,
    mentor_id: Optional[int] = None,
) -> Tuple[uuid.UUID, str]:
    """
    Сохраняет аватарку на диск и обновляет ссылку в БД
    
    Args:
        file: Загруженный файл
        avatar_uuid: UUID для аватарки
        user_id: ID пользователя (если аватарка пользователя)
        mentor_id: ID ментора (если аватарка ментора)
        
    Returns:
        Кортеж (UUID аватарки, расширение файла)
    """
    # Получаем расширение исходного файла
    extension = get_file_extension(file.filename)
    
    # Создаем путь для сохранения аватарки с расширением
    avatar_path = get_avatar_path(avatar_uuid, extension)
    
    # Сохраняем файл на диск
    with open(avatar_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Закрываем файл после копирования
    file.file.close()
    
    # Обновляем ссылку на аватарку в БД
    async with session_scope() as db:
        if user_id:
            await update_user_avatar(db, user_id, avatar_uuid)
        elif mentor_id:
            await update_mentor_avatar(db, mentor_id, avatar_uuid)
    
    return avatar_uuid, extension


async def delete_avatar(
    avatar_uuid: uuid.UUID,
    user_id: Optional[int] = None,
    mentor_id: Optional[int] = None,
) -> None:
    """
    Удаляет аватарку с диска и очищает ссылку в БД
    
    Args:
        avatar_uuid: UUID аватарки
        user_id: ID пользователя (если аватарка пользователя)
        mentor_id: ID ментора (если аватарка ментора)
    """
    # Создаем путь для удаления аватарки
    avatar_path = get_avatar_path(avatar_uuid)
    
    # Удаляем файл, если он существует
    if os.path.exists(avatar_path):
        os.remove(avatar_path)
    
    # Если указан ID пользователя или ментора, то очищаем ссылку в БД
    if user_id or mentor_id:
        async with session_scope() as db:
            # Обновляем ссылку на аватарку в БД (устанавливаем None)
            if user_id:
                await update_user_avatar(db, user_id, None)
            elif mentor_id:
                await update_mentor_avatar(db, mentor_id, None) 