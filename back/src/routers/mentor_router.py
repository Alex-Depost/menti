from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from urllib.parse import urljoin

from src.data.models import Mentor
from src.repository.mentor_repository import (
    get_mentor_by_id,
    update_mentor,
    add_tags_to_mentor,
    remove_tags_from_mentor
)
from src.schemas.schemas import (
    MentorDisplay,
    MentorUpdateSchema,
    TagSchema
)
from src.security.auth import get_current_mentor

router = APIRouter(tags=["mentors"])


@router.get("/me", response_model=MentorDisplay)
async def get_current_mentor_profile(
    request: Request,
    current_mentor: Mentor = Depends(get_current_mentor)
):
    """Получить профиль текущего ментора."""
    # Получаем ментора с загруженными тегами
    mentor = await get_mentor_by_id(current_mentor.id)
    
    # Формируем URL для аватара
    avatar_url = None
    if mentor.avatar_uuid:
        base_url = str(request.base_url)
        avatar_url = urljoin(base_url, f"api/v1/storage/avatar/{mentor.avatar_uuid}")
    
    # Создаем объект для ответа
    mentor_display = MentorDisplay.from_orm(mentor)
    mentor_display.avatar_url = avatar_url
    
    return mentor_display


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
        avatar_url = urljoin(base_url, f"api/v1/storage/avatar/{mentor.avatar_uuid}")
    
    # Создаем объект для ответа
    mentor_display = MentorDisplay.from_orm(mentor)
    mentor_display.avatar_url = avatar_url
    
    return mentor_display


@router.put("/me", response_model=MentorDisplay)
async def update_current_mentor_profile(
    update_data: MentorUpdateSchema,
    current_mentor: Mentor = Depends(get_current_mentor)
):
    """Обновить профиль текущего ментора."""
    updated_mentor = await update_mentor(current_mentor.id, update_data)
    return MentorDisplay.from_orm(updated_mentor)


@router.post("/me/tags", response_model=MentorDisplay)
async def add_tags(
    tag_ids: List[int],
    current_mentor: Mentor = Depends(get_current_mentor)
):
    """Добавить теги к профилю ментора."""
    updated_mentor = await add_tags_to_mentor(current_mentor.id, tag_ids)
    return MentorDisplay.from_orm(updated_mentor)


@router.delete("/me/tags", response_model=MentorDisplay)
async def remove_tags(
    tag_ids: List[int],
    current_mentor: Mentor = Depends(get_current_mentor)
):
    """Удалить теги из профиля ментора."""
    updated_mentor = await remove_tags_from_mentor(current_mentor.id, tag_ids)
    return MentorDisplay.from_orm(updated_mentor) 