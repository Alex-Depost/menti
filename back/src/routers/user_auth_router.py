from fastapi import APIRouter, Depends, status, Request, HTTPException
from urllib.parse import urljoin

from src.data.models import User
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
    "/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def signup(user_data: UserCreationSchema):
    return await register_user(user_data)


@router.post("/signin", response_model=Token)
async def signin(user_data: UserLoginSchema):
    result = await authenticate_user(user_data.email, user_data.password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return result


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    # Формируем URL для аватара
    avatar_url = None
    if current_user.avatar_uuid:
        base_url = str(request.base_url)
        avatar_url = urljoin(base_url, f"api/v1/storage/avatar/{current_user.avatar_uuid}")
    
    # Создаем копию объекта пользователя и добавляем avatar_url
    user_dict = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "avatar_url": avatar_url
    }
    
    return user_dict


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
