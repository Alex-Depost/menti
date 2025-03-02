from fastapi import APIRouter, Depends, status, Request, HTTPException, Form, UploadFile, File
from urllib.parse import urljoin
from typing import Optional
from datetime import timedelta
from src.config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY, Roles

import logging
from src.data.models import Mentor
from src.schemas.schemas import (
    MentorCreationSchema,
    MentorLoginSchema,
    MentorResponse,
    Token,
    MentorUpdateSchema,
    MentorDisplay,
)
from src.security.auth import get_current_mentor, create_access_token
from src.services.mentor_auth_service import authenticate_mentor, register_mentor, update_mentor_profile_service

router = APIRouter(tags=["authentication"])

logger = logging.getLogger(__name__)


@router.post(
    "/signup", response_model=Token, status_code=status.HTTP_201_CREATED
)
async def signup(user_data: MentorCreationSchema):
    result = await register_mentor(user_data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed",
        )
    return result


@router.post("/signin", response_model=Token)
async def signin(user_data: MentorLoginSchema):
    _, access_token = await authenticate_mentor(user_data.login, user_data.password)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=MentorResponse)
async def get_current_user_info(
    request: Request,
    current_user: Mentor = Depends(get_current_mentor)
):
    # Формируем URL для аватара
    avatar_url = None
    if current_user.avatar_uuid:
        base_url = str(request.base_url)
        avatar_url = urljoin(base_url, f"img/{current_user.avatar_uuid}")
    
    # Создаем копию объекта ментора и добавляем avatar_url
    mentor_dict = {
        "id": current_user.id,
        "name": current_user.name,
        "is_active": current_user.is_active,
        "avatar_url": avatar_url
    }
    
    # Добавляем email, только если он существует
    if hasattr(current_user, "email") and current_user.email:
        mentor_dict["email"] = current_user.email
    
    return mentor_dict


@router.patch("/me", response_model=MentorDisplay)
async def update_mentor_profile(
    request: Request,
    name: Optional[str] = Form(None),
    telegram_link: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    email: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_mentor: Mentor = Depends(get_current_mentor)
):
    """
    Обновление профиля текущего ментора
    
    Позволяет изменить:
    - Имя (name)
    - Ссылку на телеграм (telegram_link)
    - Возраст (age)
    - Почту (email)
    - Пароль (password)
    - Описание (description)
    
    Для изменения аватара используйте отдельный эндпоинт /me/avatar
    """
    # Создаем словарь с обновляемыми данными
    update_dict = {}
    
    if name is not None:
        update_dict["name"] = name
    logger.error(f"Обновление имени ментора: {name}")
        
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
    
    # Создаем объект схемы для валидации
    update_data = MentorUpdateSchema(**update_dict)
    
    # Обновляем профиль и возвращаем обновленные данные
    updated_mentor = await update_mentor_profile_service(current_mentor.id, update_data)
    
    # Формируем URL для аватара
    avatar_url = None
    if updated_mentor.avatar_uuid:
        base_url = str(request.base_url)
        avatar_url = urljoin(base_url, f"img/{updated_mentor.avatar_uuid}")
    
    # Возвращаем полный объект ментора
    return MentorDisplay(
        id=updated_mentor.id,
        name=updated_mentor.name,
        email=updated_mentor.email,
        avatar_uuid=updated_mentor.avatar_uuid,
        telegram_link=updated_mentor.telegram_link,
        age=updated_mentor.age,
        is_active=updated_mentor.is_active,
        created_at=updated_mentor.created_at,
        updated_at=updated_mentor.updated_at
    )
