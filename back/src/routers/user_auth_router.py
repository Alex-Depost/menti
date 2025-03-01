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
    if current_user.avatar_uuid:
        base_url = str(request.base_url)
        avatar_url = urljoin(base_url, f"api/v1/storage/avatar/{current_user.avatar_uuid}")
    
    # Создаем полный объект для отображения
    return UserDisplay(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        avatar_uuid=current_user.avatar_uuid,
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
    name: Optional[str] = Form(None),
    telegram_link: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    email: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    target_universities: Optional[str] = Form(None),
    admission_type: Optional[str] = Form(None),
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
    - Целевые университеты (target_universities) - строка с университетами, разделенными запятыми
    - Тип поступления (admission_type)
    
    Для изменения аватара используйте отдельный эндпоинт /me/avatar
    """
    # Создаем словарь с обновляемыми данными
    update_dict = {}
    
    if name is not None:
        update_dict["name"] = name
        
    if telegram_link is not None:
        update_dict["telegram_link"] = telegram_link
        
    if age is not None:
        update_dict["age"] = age
        
    if email is not None:
        update_dict["email"] = email
        
    if password is not None:
        update_dict["password"] = password
        
    if description is not None:
        update_dict["description"] = description
        
    if target_universities is not None:
        # Преобразуем строку с университетами в список
        update_dict["target_universities"] = [uni.strip() for uni in target_universities.split(",") if uni.strip()]
        
    if admission_type is not None:
        try:
            # Проверяем, что тип поступления валиден
            update_dict["admission_type"] = AdmissionType(admission_type)
        except ValueError:
            valid_types = [t.value for t in AdmissionType]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неверный тип поступления. Допустимые значения: {', '.join(valid_types)}"
            )
    
    # Создаем объект схемы для валидации
    update_data = UserUpdateSchema(**update_dict)
    
    # Обновляем профиль и возвращаем обновленные данные
    updated_user = await update_user_profile_service(current_user.id, update_data)
    return updated_user
