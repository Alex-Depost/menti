from math import ceil
from typing import Dict, Optional
from urllib.parse import urljoin

from fastapi import APIRouter, Depends, Query, Request

from src.data.models import Mentor, User
from src.repository.mentor_repository import get_filtered_mentors, get_mentors
from src.repository.user_repository import get_filtered_users, get_users
from src.schemas.schemas import FeedResponse, MentorFeedResponse, UserFeedResponse
from src.security.auth import (
    get_optional_current_mentor,
    get_optional_current_user,
)
from src.services.interest_rating import InterestRatingService
from src.services.redis_service import RedisService, get_redis_service

router = APIRouter(
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)

interest_service = InterestRatingService()


def prepare_mentor_data(mentor: Mentor, base_url: str) -> Dict:
    """Подготовка данных ментора для кеширования"""
    avatar_url = None
    if mentor.avatar_uuid is not None:
        avatar_url = urljoin(base_url, f"img/{mentor.avatar_uuid}")

    return {
        "id": mentor.id,
        "name": mentor.name,
        "login": mentor.login,
        "title": mentor.title,
        "description": mentor.description,
        "university": mentor.university,
        "avatar_url": avatar_url,
    }


def prepare_user_data(user: User, base_url: str) -> Dict:
    """Подготовка данных пользователя для кеширования"""
    avatar_url = None
    if user.avatar_uuid is not None:
        avatar_url = urljoin(base_url, f"img/{user.avatar_uuid}")

    admission_type = str(user.admission_type) if user.admission_type else None

    return {
        "id": user.id,
        "name": user.name,
        "login": user.login,
        "description": user.description,
        "target_universities": user.target_universities,
        "admission_type": admission_type,
        "avatar_url": avatar_url,
    }


@router.get("/mentors", response_model=FeedResponse)
async def get_mentors_feed(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
    redis_service: RedisService = Depends(get_redis_service),
    filtered: bool = Query(True, description="Whether to filter by profile parameters"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    prompt: Optional[str] = Query(None, description="Custom prompt for AI to determine order instead of user profile"),
):
    """
    Fetch feed of mentors with pagination.
    If filtered=true, returns mentors that match the current user's profile.
    If filtered=false, returns all mentors.
    Mentors are sorted by interest relevance if user is authenticated.
    If prompt is provided, it will be used instead of user profile for determining order.
    """
    if page < 1:
        page = 1
    if size < 1:
        size = 10
    elif size > 100:
        size = 100

    items = []
    total = 0

    # Получаем список менторов
    if filtered and current_user:
        target_universities = current_user.target_universities if current_user else []
        admission_type_value = ""

        if current_user and current_user.admission_type:
            admission_type_value = str(current_user.admission_type)

        mentors, total = await get_filtered_mentors(
            target_universities=target_universities,
            admission_type=admission_type_value,
            page=1,
            size=1000,
        )
    else:
        mentors, total = await get_mentors(page=1, size=1000)

    # Подготавливаем данные менторов
    mentor_list = []
    mentor_data_list = []
    base_url = str(request.base_url)

    for mentor in mentors:
        mentor_data = prepare_mentor_data(mentor, base_url)
        mentor_data_list.append(mentor_data)
        mentor_list.append(MentorFeedResponse(**mentor_data))

    # Determine which description to use for ranking (prompt or user description)
    description_for_ranking = prompt if prompt else (current_user.description if current_user else None)
    
    # Проверяем кеш, если есть описание для ранжирования
    if description_for_ranking:
        cache_key = redis_service.generate_feed_cache_key(
            description_for_ranking,
            mentor_data_list,
            filtered,
            page,
            size,
        )
        cached_response = await redis_service.get_cache(cache_key)
        if cached_response:
            return FeedResponse(**cached_response)

    if description_for_ranking:
        mentors_for_ranking = [
            {"id": m.id, "description": m.description or ""} for m in mentor_list
        ]

        ranked_mentor_ids = await interest_service.get_ranked_mentors(
            mentors=mentors_for_ranking, user_description=description_for_ranking
        )

        mentor_dict = {m.id: m for m in mentor_list}

        sorted_mentors = []
        for mentor_id in ranked_mentor_ids:
            if mentor_id in mentor_dict:
                sorted_mentors.append(mentor_dict[mentor_id])

        remaining_mentors = [m for m in mentor_list if m.id not in ranked_mentor_ids]
        sorted_mentors.extend(remaining_mentors)

        start_idx = (page - 1) * size
        end_idx = start_idx + size
        items = sorted_mentors[start_idx:end_idx]
    else:
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        items = mentor_list[start_idx:end_idx]

    total_pages = ceil(total / size) if total > 0 else 1

    response = FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )

    # Сохраняем результат в кеш, если есть описание для ранжирования
    if description_for_ranking:
        cache_key = redis_service.generate_feed_cache_key(
            description_for_ranking,
            mentor_data_list,
            filtered,
            page,
            size,
        )
        await redis_service.set_cache(cache_key, response.dict())

    return response


@router.get("/users", response_model=FeedResponse)
async def get_users_feed(
    request: Request,
    current_mentor: Optional[Mentor] = Depends(get_optional_current_mentor),
    redis_service: RedisService = Depends(get_redis_service),
    filtered: bool = Query(True, description="Whether to filter by profile parameters"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    prompt: Optional[str] = Query(None, description="Custom prompt for AI to determine order instead of mentor profile"),
):
    """
    Fetch feed of users with pagination.
    If filtered=true, returns users that match the current mentor's profile.
    If filtered=false, returns all users.
    If prompt is provided, it will be used instead of mentor profile for determining order.
    """
    if page < 1:
        page = 1
    if size < 1:
        size = 10
    elif size > 100:
        size = 100

    items = []
    total = 0

    # Получаем список пользователей
    if filtered and current_mentor:
        university = current_mentor.university
        admission_type_value = ""

        if current_mentor and current_mentor.admission_type:
            admission_type_value = str(current_mentor.admission_type)

        users, total = await get_filtered_users(
            university=university,
            admission_type=admission_type_value,
            page=1,
            size=1000,
        )
    else:
        users, total = await get_users(page=1, size=1000)

    # Подготавливаем данные пользователей
    user_list = []
    user_data_list = []
    base_url = str(request.base_url)

    for user in users:
        user_data = prepare_user_data(user, base_url)
        user_data_list.append(user_data)
        user_list.append(UserFeedResponse(**user_data))

    # Determine which description to use for ranking (prompt or mentor description)
    description_for_ranking = prompt if prompt else (current_mentor.description if current_mentor else None)
    
    # Проверяем кеш, если есть описание для ранжирования
    if description_for_ranking:
        cache_key = redis_service.generate_feed_cache_key(
            description_for_ranking,
            user_data_list,
            filtered,
            page,
            size,
        )
        cached_response = await redis_service.get_cache(cache_key)
        if cached_response:
            return FeedResponse(**cached_response)

    if description_for_ranking:
        users_for_ranking = [
            {"id": u.id, "description": u.description or ""} for u in user_list
        ]

        ranked_user_ids = await interest_service.get_ranked_users(
            users=users_for_ranking, mentor_description=description_for_ranking
        )

        user_dict = {u.id: u for u in user_list}

        sorted_users = []
        for user_id in ranked_user_ids:
            if user_id in user_dict:
                sorted_users.append(user_dict[user_id])

        remaining_users = [u for u in user_list if u.id not in ranked_user_ids]
        sorted_users.extend(remaining_users)

        start_idx = (page - 1) * size
        end_idx = start_idx + size
        items = sorted_users[start_idx:end_idx]
    else:
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        items = user_list[start_idx:end_idx]

    total_pages = ceil(total / size) if total > 0 else 1

    response = FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )

    # Сохраняем результат в кеш, если есть описание для ранжирования
    if description_for_ranking:
        cache_key = redis_service.generate_feed_cache_key(
            description_for_ranking,
            user_data_list,
            filtered,
            page,
            size,
        )
        await redis_service.set_cache(cache_key, response.dict())

    return response
