from fastapi import APIRouter, Depends, status, Request, HTTPException, Form, UploadFile, File
from urllib.parse import urljoin
from typing import Optional, List

from src.data.models import User, AdmissionType
from src.schemas.schemas import (
    Token,
    UserCreationSchema,
    UserLoginSchema,
    UserResponse,
    UserUpdateSchema,
    UserDisplay,
)
from src.security.auth import get_current_user
from src.services.user_auth_service import authenticate_user, register_user, update_user_profile_service

router = APIRouter(tags=["authentication"])


@router.post(
    "/signup", response_model=Token, status_code=status.HTTP_201_CREATED
)
async def signup(user_data: UserCreationSchema):
    result = await register_user(user_data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed",
        )
    return result


@router.post("/signin", response_model=Token)
async def signin(user_data: UserLoginSchema):
    result = await authenticate_user(user_data.login, user_data.password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return result


@router.get("/me", response_model=UserDisplay)
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Получение полной информации о текущем пользователе
    """
    # Формируем URL для аватара
    avatar_url = None
    avatar_uuid = None
    if current_user.avatar_uuid: # type: ignore
        avatar_uuid = str(current_user.avatar_uuid) # type: ignore
        base_url = str(request.base_url)
        avatar_url = urljoin(base_url, f"img/{current_user.avatar_uuid}")
    
    # Создаем полный объект для отображения
    return UserDisplay(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        avatar_uuid=current_user.avatar_uuid, # type: ignore
        telegram_link=current_user.telegram_link,
        age=current_user.age,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        target_universities=current_user.target_universities,
        description=current_user.description,
        admission_type=current_user.admission_type
    )


@router.patch("/me", response_model=UserDisplay)
async def update_user_profile(
    update_data: UserUpdateSchema,
    current_user: User = Depends(get_current_user)
):
    """
    Обновление профиля текущего пользователя
    
    Позволяет изменить:
    - Имя (name)
    - Ссылку на телеграм (telegram_link)
    - Возраст (age)
    - Почту (email)
    - Пароль (password)
    - Описание (description)
    - Целевые университеты (target_universities)
    - Тип поступления (admission_type)
    
    Для изменения аватара используйте отдельный эндпоинт /me/avatar
    """
    # Обновляем профиль и возвращаем обновленные данные
    updated_user = await update_user_profile_service(current_user.id, update_data)
    return updated_user
