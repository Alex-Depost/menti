from fastapi import APIRouter, Depends, status

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
async def get_current_user_info(current_user: Mentor = Depends(get_current_mentor)):
    return current_user
