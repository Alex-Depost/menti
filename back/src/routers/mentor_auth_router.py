from fastapi import APIRouter, Depends, status, Request
from urllib.parse import urljoin

from src.data.models import Mentor
from src.schemas.schemas import (
    MentorCreationSchema,
    MentorLoginSchema,
    MentorResponse,
    Token,
)
from src.security.auth import get_current_mentor
from src.services.mentor_auth_service import authenticate_mentor, register_mentor

router = APIRouter(tags=["authentication"])


@router.post(
    "/signup", response_model=MentorResponse, status_code=status.HTTP_201_CREATED
)
async def signup(user_data: MentorCreationSchema):
    return await register_mentor(user_data)


@router.post("/signin", response_model=Token)
async def signin(user_data: MentorLoginSchema):
    _, access_token = await authenticate_mentor(user_data.email, user_data.password)
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
        avatar_url = urljoin(base_url, f"api/v1/storage/avatar/{current_user.avatar_uuid}")
    
    # Создаем копию объекта ментора и добавляем avatar_url
    mentor_dict = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "avatar_url": avatar_url
    }
    
    return mentor_dict
