from fastapi import APIRouter, Depends, status

from src.data.models import User
from src.routers.schemas import (
    Token,
    UserCreationSchema,
    UserLoginSchema,
    UserResponse,
)
from src.security.auth import get_current_user
from src.services.user_auth_service import authenticate_user, register_user

router = APIRouter(tags=["authentication"])


@router.post(
    "/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def signup(user_data: UserCreationSchema):
    return await register_user(user_data)


@router.post("/signin", response_model=Token)
async def signin(user_data: UserLoginSchema):
    _, access_token = await authenticate_user(user_data.email, user_data.password)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user
