from math import ceil
from urllib.parse import urljoin
from typing import List, Optional, cast, Union

from fastapi import APIRouter, HTTPException, Query, Request, Depends

from src.data.models import User, Mentor, AdmissionType
from src.repository.mentor_repository import get_mentors, get_filtered_mentors
from src.repository.user_repository import get_users, get_filtered_users
from src.schemas.schemas import FeedResponse, MentorFeedResponse, UserFeedResponse
from src.security.auth import get_current_user, get_current_mentor

router = APIRouter(
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)


@router.get("/mentors", response_model=FeedResponse)
async def get_mentors_feed(
    request: Request,
    current_user: Optional[User] = Depends(get_current_user),
    # current_mentor: Optional[Mentor] = Depends(get_current_mentor),
    filtered: bool = Query(True, description="Whether to filter by profile parameters"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    """
    Fetch feed of mentors with pagination.
    If filtered=true, returns mentors that match the current user's profile.
    If filtered=false, returns all mentors.
    """
    # Проверка на корректность входных параметров пагинации
    if page < 1:
        page = 1
    if size < 1:
        size = 10
    elif size > 100:
        size = 100
    
    items = []
    total = 0
    
    # Если filtered=true и есть авторизованный пользователь, применяем фильтры
    if filtered and current_user:
        # Фильтрация по параметрам профиля
        target_universities = current_user.target_universities if current_user else []
        admission_type_value = ""
        
        if current_user and current_user.admission_type:
            admission_type_value = str(current_user.admission_type)
        
        mentors, total = await get_filtered_mentors(
            target_universities=target_universities,
            admission_type=admission_type_value,
            page=page,
            size=size,
        )
    else:
        # Возвращаем всех менторов без фильтрации
        mentors, total = await get_mentors(page=page, size=size)
    
    # Формируем ответ
    for mentor in mentors:
        # Формируем URL для аватара
        avatar_url = None
        if mentor.avatar_uuid is not None:
            base_url = str(request.base_url)
            avatar_url = urljoin(base_url, f"img/{mentor.avatar_uuid}")
            
        items.append(
            MentorFeedResponse(
                id=mentor.id,
                name=mentor.name,
                login=mentor.login,
                title=mentor.title,
                description=mentor.description,
                university=mentor.university,
                email=mentor.email,
                avatar_url=avatar_url,
            )
        )
    
    # Корректно вычисляем общее количество страниц
    total_pages = max(ceil(total / size) if total > 0 else 1, 1)
    
    return FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )


@router.get("/users", response_model=FeedResponse)
async def get_users_feed(
    request: Request,
    # current_user: Optional[User] = Depends(get_current_user),
    current_mentor: Optional[Mentor] = Depends(get_current_mentor),
    filtered: bool = Query(True, description="Whether to filter by profile parameters"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    """
    Fetch feed of users with pagination.
    If filtered=true, returns users that match the current mentor's profile.
    If filtered=false, returns all users.
    """
    # Проверка на корректность входных параметров пагинации
    if page < 1:
        page = 1
    if size < 1:
        size = 10
    elif size > 100:
        size = 100

    items = []
    total = 0
    
    # Если filtered=true и есть авторизованный ментор, применяем фильтры
    if filtered and current_mentor:
        # Фильтрация по параметрам профиля
        university = current_mentor.university
        admission_type_value = ""
        
        if current_mentor and current_mentor.admission_type:
            admission_type_value = str(current_mentor.admission_type)
        
        users, total = await get_filtered_users(
            university=university,
            admission_type=admission_type_value,
            page=page,
            size=size,
        )
    else:
        # Возвращаем всех пользователей без фильтрации
        users, total = await get_users(page=page, size=size)
    
    # Формируем ответ
    for user in users:
        # Формируем URL для аватара
        avatar_url = None
        if user.avatar_uuid is not None:
            base_url = str(request.base_url)
            avatar_url = urljoin(base_url, f"img/{user.avatar_uuid}")
            
        # Применяем type cast к enum
        admission_type: Optional[AdmissionType] = None
        if user.admission_type:
            admission_type = cast(AdmissionType, user.admission_type)
            
        items.append(
            UserFeedResponse(
                id=user.id,
                name=user.name,
                login=user.login,
                description=user.description,
                target_universities=user.target_universities,
                admission_type=admission_type,
                email=user.email,
                avatar_url=avatar_url,
            )
        )

    # Корректно вычисляем общее количество страниц
    total_pages = max(ceil(total / size) if total > 0 else 1, 1)

    return FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )
