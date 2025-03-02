from math import ceil
from urllib.parse import urljoin
from typing import List, Optional, cast, Union

from fastapi import APIRouter, HTTPException, Query, Request, Depends

from src.data.models import User, Mentor, AdmissionType
from src.repository.mentor_repository import get_mentors, get_filtered_mentors
from src.repository.user_repository import get_users
from src.schemas.schemas import FeedResponse, MentorFeedResponse, UserFeedResponse
from src.security.auth import get_current_user, get_current_mentor

router = APIRouter(
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)


@router.get("/all", response_model=FeedResponse)
async def get_all_feed(
    request: Request,
    current_user: Optional[User] = Depends(get_current_user),
    current_mentor: Optional[Mentor] = Depends(get_current_mentor),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    """
    Fetch feed with pagination.
    For mentors, returns only users.
    For users, returns only mentors.
    """
    if not current_user and not current_mentor:
        raise HTTPException(
            status_code=401, detail="Authentication required to access feed"
        )
        
    # Проверка на корректность входных параметров пагинации
    if page < 1:
        page = 1
    if size < 1:
        size = 10
    elif size > 100:
        size = 100
    
    items = []
    total = 0
    
    if current_mentor:
        # Если запрос от ментора, показываем пользователей
        users, total = await get_users(page=page, size=size)
        
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
    else:
        # Если запрос от пользователя, показываем менторов
        mentors, total = await get_mentors(page=page, size=size)
        
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


@router.get("/filtered", response_model=FeedResponse)
async def get_filtered_feed(
    request: Request,
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    """
    Fetch filtered feed based on user preferences.
    Only users can access this endpoint, and it returns filtered mentors.
    """
    if not current_user:
        raise HTTPException(
            status_code=401, detail="Authentication required to access filtered feed"
        )
        
    # Проверка на корректность входных параметров пагинации
    if page < 1:
        page = 1
    if size < 1:
        size = 10
    elif size > 100:
        size = 100

    # Просто передаем admission_type как есть
    mentors, total = await get_filtered_mentors(
        target_universities=current_user.target_universities,
        admission_type=current_user.admission_type,
        page=page,
        size=size,
    )

    # Корректно вычисляем общее количество страниц
    total_pages = max(ceil(total / size) if total > 0 else 1, 1)

    items = []
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
                title=mentor.title,
                description=mentor.description,
                university=mentor.university,
                email=mentor.email,
                avatar_url=avatar_url,
            )
        )

    return FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )
