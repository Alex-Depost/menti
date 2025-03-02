import logging
from typing import Optional
from urllib.parse import urljoin

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
)

from src.data.models import Mentor
from src.schemas.schemas import (
    MentorCreationSchema,
    MentorDisplay,
    MentorLoginSchema,
    MentorResponse,
    MentorUpdateSchema,
    Token,
)
from src.security.auth import get_current_mentor
from src.services.mentor_auth_service import (
    authenticate_mentor,
    register_mentor,
    update_mentor_profile_service,
)

router = APIRouter(tags=["authentication"])

logger = logging.getLogger(__name__)


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
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
    request: Request, current_user: Mentor = Depends(get_current_mentor)
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
        "university": current_user.university,
        "title": current_user.title,
        "telegram_link": current_user.telegram_link,
        "age": current_user.age,
        "email": current_user.email,
        "description": current_user.description,
        "login": current_user.login,
        "is_active": current_user.is_active,
        "avatar_url": avatar_url,
        "free_days": current_user.free_days,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "admission_type": current_user.admission_type,
    }

    # Добавляем email, только если он существует
    if hasattr(current_user, "email") and current_user.email:
        mentor_dict["email"] = current_user.email

    return mentor_dict


@router.patch("/me", response_model=MentorDisplay)
async def update_mentor_profile(
    request: Request,
    update_data: MentorUpdateSchema,
    current_mentor: Mentor = Depends(get_current_mentor),
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
    # Обновляем профиль и возвращаем обновленные данные
    updated_mentor = await update_mentor_profile_service(current_mentor.id, update_data)

    # Возвращаем полный объект ментора
    return MentorDisplay(
        id=updated_mentor.id,
        name=updated_mentor.name,
        login=updated_mentor.login,
        university=updated_mentor.university,
        description=updated_mentor.description,
        email=updated_mentor.email,
        avatar_uuid=updated_mentor.avatar_uuid,  # type: ignore
        telegram_link=updated_mentor.telegram_link,
        age=updated_mentor.age,
        is_active=updated_mentor.is_active,
        created_at=updated_mentor.created_at,
        updated_at=updated_mentor.updated_at,
        free_days=updated_mentor.free_days,
        admission_type=updated_mentor.admission_type,
    )
