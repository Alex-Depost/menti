import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from src.schemas.schemas import MentorDisplay, UserDisplay
from src.security.oauth2 import get_current_mentor, get_current_user
from src.services.avatar_service import (
    delete_avatar,
    get_avatar_path,
    save_avatar,
)

router = APIRouter(tags=["Images"])


@router.post("/me/avatar", status_code=status.HTTP_201_CREATED)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: Optional[UserDisplay] = Depends(get_current_user),
    current_mentor: Optional[MentorDisplay] = Depends(get_current_mentor),
):
    """Загрузка аватарки текущим пользователем или ментором"""
    if not current_user and not current_mentor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Авторизуйтесь для загрузки аватарки",
        )

    # Генерируем UUID для аватарки
    avatar_uuid = uuid.uuid4()
    
    # Определяем, кто загружает аватарку (пользователь или ментор)
    user_id = None
    mentor_id = None
    if current_user:
        user_id = current_user.id
    else:
        mentor_id = current_mentor.id # type: ignore
    
    # Сохраняем аватарку и обновляем avatar_uuid в базе данных
    avatar_uuid, _ = await save_avatar(file, avatar_uuid, user_id, mentor_id)
    
    return {"avatar_uuid": str(avatar_uuid)}


@router.get("/img/{avatar_uuid}")
async def get_avatar(avatar_uuid: uuid.UUID):
    """Получение аватарки по UUID"""
    avatar_path = get_avatar_path(avatar_uuid)
    
    if not os.path.exists(avatar_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Аватарка не найдена",
        )
    
    return FileResponse(avatar_path)


@router.delete("/me/avatar")
async def remove_avatar(
    current_user: Optional[UserDisplay] = Depends(get_current_user),
    current_mentor: Optional[MentorDisplay] = Depends(get_current_mentor),
):
    """Удаление аватарки текущим пользователем или ментором"""
    if not current_user and not current_mentor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Авторизуйтесь для удаления аватарки",
        )
    
    # Определяем, кто удаляет аватарку (пользователь или ментор)
    user_id = None
    mentor_id = None
    avatar_uuid = None
    
    if current_user:
        user_id = current_user.id
        avatar_uuid = current_user.avatar_uuid
    else:
        mentor_id = current_mentor.id # type: ignore
        avatar_uuid = current_mentor.avatar_uuid # type: ignore
    
    # Проверяем, есть ли аватарка для удаления
    if not avatar_uuid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Аватарка не найдена",
        )
    
    # Удаляем аватарку и сбрасываем avatar_uuid в базе данных
    await delete_avatar(avatar_uuid, user_id, mentor_id)
    
    return {"message": "Аватарка успешно удалена"} 