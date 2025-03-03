from math import ceil
from urllib.parse import urljoin
from typing import List, Optional, cast, Union

from fastapi import APIRouter, HTTPException, Query, Request, Depends

from src.data.models import User, Mentor, AdmissionType
from src.repository.mentor_repository import get_mentors, get_filtered_mentors
from src.repository.user_repository import get_users, get_filtered_users
from src.schemas.schemas import FeedResponse, MentorFeedResponse, UserFeedResponse
from src.security.auth import get_current_user, get_current_mentor, get_optional_current_user, get_optional_current_mentor
from src.services.interest_rating import InterestRatingService

router = APIRouter(
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)

interest_service = InterestRatingService()


@router.get("/mentors", response_model=FeedResponse)
async def get_mentors_feed(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
    filtered: bool = Query(True, description="Whether to filter by profile parameters"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    """
    Fetch feed of mentors with pagination.
    If filtered=true, returns mentors that match the current user's profile.
    If filtered=false, returns all mentors.
    Mentors are sorted by interest relevance if user is authenticated.
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
            page=1,  # Получаем все менторы для сортировки
            size=1000,  # Используем большой размер, чтобы получить всех менторов
        )
    else:
        # Возвращаем всех менторов без фильтрации
        mentors, total = await get_mentors(page=1, size=1000)
    
    # Подготавливаем список менторов для сортировки
    mentor_list = []
    for mentor in mentors:
        # Формируем URL для аватара
        avatar_url = None
        if mentor.avatar_uuid is not None:
            base_url = str(request.base_url)
            avatar_url = urljoin(base_url, f"img/{mentor.avatar_uuid}")
            
        mentor_data = MentorFeedResponse(
            id=mentor.id,
            name=mentor.name,
            login=mentor.login,
            title=mentor.title,
            description=mentor.description,
            university=mentor.university,
            email=mentor.email,
            avatar_url=avatar_url,
        )
        mentor_list.append(mentor_data)
    
    # Если есть авторизованный пользователь, сортируем менторов по интересности
    if current_user and current_user.description:
        # Подготавливаем данные для сервиса интересности
        mentors_for_ranking = [
            {"id": m.id, "description": m.description or ""} 
            for m in mentor_list
        ]
        
        # Получаем отсортированный список ID менторов
        ranked_mentor_ids = await interest_service.get_ranked_mentors(
            mentors=mentors_for_ranking,
            user_description=current_user.description
        )
        
        # Создаем словарь для быстрого поиска менторов по ID
        mentor_dict = {m.id: m for m in mentor_list}
        
        # Сортируем список менторов согласно рейтингу
        sorted_mentors = []
        for mentor_id in ranked_mentor_ids:
            if mentor_id in mentor_dict:
                sorted_mentors.append(mentor_dict[mentor_id])
        
        # Добавляем оставшихся менторов (если такие есть)
        remaining_mentors = [m for m in mentor_list if m.id not in ranked_mentor_ids]
        sorted_mentors.extend(remaining_mentors)
        
        # Применяем пагинацию к отсортированному списку
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        items = sorted_mentors[start_idx:end_idx]
    else:
        # Если нет авторизованного пользователя или описания, применяем обычную пагинацию
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        items = mentor_list[start_idx:end_idx]
    
    # Корректно вычисляем общее количество страниц
    total_pages = ceil(total / size) if total > 0 else 1
    
    return FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )


@router.get("/users", response_model=FeedResponse)
async def get_users_feed(
    request: Request,
    current_mentor: Optional[Mentor] = Depends(get_optional_current_mentor),
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
            page=1,  # Получаем всех пользователей для сортировки
            size=1000,  # Используем большой размер, чтобы получить всех пользователей
        )
    else:
        # Возвращаем всех пользователей без фильтрации
        users, total = await get_users(page=1, size=1000)
    
    # Формируем список пользователей
    user_list = []
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
            
        user_data = UserFeedResponse(
            id=user.id,
            name=user.name,
            login=user.login,
            description=user.description,
            target_universities=user.target_universities,
            admission_type=admission_type,
            email=user.email,
            avatar_url=avatar_url,
        )
        user_list.append(user_data)
    
    # Если есть авторизованный ментор, сортируем пользователей по интересности
    if current_mentor and current_mentor.description:
        # Подготавливаем данные для сервиса интересности
        users_for_ranking = [
            {"id": u.id, "description": u.description or ""} 
            for u in user_list
        ]
        
        # Получаем отсортированный список ID пользователей
        ranked_user_ids = await interest_service.get_ranked_users(
            users=users_for_ranking,
            mentor_description=current_mentor.description
        )
        
        # Создаем словарь для быстрого поиска пользователей по ID
        user_dict = {u.id: u for u in user_list}
        
        # Сортируем список пользователей согласно рейтингу
        sorted_users = []
        for user_id in ranked_user_ids:
            if user_id in user_dict:
                sorted_users.append(user_dict[user_id])
        
        # Добавляем оставшихся пользователей (если такие есть)
        remaining_users = [u for u in user_list if u.id not in ranked_user_ids]
        sorted_users.extend(remaining_users)
        
        # Применяем пагинацию к отсортированному списку
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        items = sorted_users[start_idx:end_idx]
    else:
        # Если нет авторизованного ментора или описания, применяем обычную пагинацию
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        items = user_list[start_idx:end_idx]
    
    # Корректно вычисляем общее количество страниц
    total_pages = ceil(total / size) if total > 0 else 1

    return FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )
