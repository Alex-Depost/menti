from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from src.data.models import User, Mentor
from src.security.auth import get_current_user as _get_current_user
from src.security.auth import get_current_mentor as _get_current_mentor
from src.schemas.schemas import UserDisplay, MentorDisplay


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/signin", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[UserDisplay]:
    """
    Получение текущего пользователя (если авторизован)
    Если пользователь не авторизован или токен неверный, возвращает None
    """
    if not token:
        return None
    
    try:
        user = await _get_current_user(token)
        return UserDisplay(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar_uuid=user.avatar_uuid,
            telegram_link=user.telegram_link,
            age=user.age,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            target_universities=user.target_universities,
            description=user.description,
            admission_type=user.admission_type,
        )
    except HTTPException:
        return None


async def get_current_mentor(
    token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[MentorDisplay]:
    """
    Получение текущего ментора (если авторизован)
    Если ментор не авторизован или токен неверный, возвращает None
    """
    if not token:
        return None
    
    try:
        mentor = await _get_current_mentor(token)
        return MentorDisplay(
            id=mentor.id,
            name=mentor.name,
            login=mentor.login,
            email=mentor.email,
            avatar_uuid=mentor.avatar_uuid,  # type: ignore
            telegram_link=mentor.telegram_link,
            age=mentor.age,
            is_active=mentor.is_active,
            created_at=mentor.created_at,
            updated_at=mentor.updated_at,
            description=mentor.description,
            university=mentor.university,
            title=mentor.title,
            free_days=mentor.free_days,  # type: ignore
            admission_type=mentor.admission_type  # type: ignore
        )
    except HTTPException:
        return None 