from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from urllib.parse import urljoin

from src.data.models import Mentor
from src.repository.mentor_repository import (
    get_mentor_by_id,
    update_mentor
)
from src.schemas.schemas import (
    MentorDisplay,
    MentorUpdateSchema
)
from src.security.auth import get_current_mentor

router = APIRouter(tags=["mentors"])


# @router.get("/me", response_model=MentorDisplay)
# async def get_current_mentor_profile(
#     request: Request,
#     current_mentor: Mentor = Depends(get_current_mentor)
# ):
#     """Получить профиль текущего ментора."""
#     # Получаем ментора
#     mentor = await get_mentor_by_id(current_mentor.id)
    
#     # Формируем URL для аватара
#     avatar_url = None
#     if mentor.avatar_uuid:
#         base_url = str(request.base_url)
#         avatar_url = urljoin(base_url, f"img/{mentor.avatar_uuid}")
    
#     # Создаем объект для ответа
#     # Это автоматически включит поле login из модели ментора
#     mentor_display = MentorDisplay.from_orm(mentor)
    
#     # Явно устанавливаем login, чтобы избежать возврата null
#     if mentor.login:
#         mentor_display.login = mentor.login
    
#     # Логин ментора автоматически копируется из модели через from_orm
#     return mentor_display


@router.get("/{mentor_id}", response_model=MentorDisplay)
async def get_mentor_profile(
    mentor_id: int,
    request: Request
):
    """Получить профиль ментора по ID."""
    mentor = await get_mentor_by_id(mentor_id)
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found"
        )
    
    # Формируем URL для аватара
    avatar_url = None
    if mentor.avatar_uuid:
        base_url = str(request.base_url)
        avatar_url = urljoin(base_url, f"img/{mentor.avatar_uuid}")
    
    # Создаем объект для ответа
    # Это автоматически включит поле login из модели ментора
    mentor_display = MentorDisplay.from_orm(mentor)
    
    # Явно устанавливаем login, чтобы избежать возврата null
    if mentor.login:
        mentor_display.login = mentor.login
    
    # Логин ментора автоматически копируется из модели через from_orm
    return mentor_display
