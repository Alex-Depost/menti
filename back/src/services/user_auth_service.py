from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from src.config import Roles
from src.data.models import User
import src.repository.user_repository as user_repo
from src.schemas.schemas import UserCreationSchema, UserUpdateSchema
from src.security.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)


async def register_user(user_data: UserCreationSchema) -> User:
    existing_user = await user_repo.get_user_by_email(user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, password_hash=hashed_password)

    try:
        await user_repo.create_user(new_user)

        created_user = await user_repo.get_user_by_email(user_data.email)
        return created_user
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed"
        )


async def authenticate_user(email: str, password: str):
    user = await user_repo.get_user_by_email(email)

    if not user:
        return False

    if not verify_password(password, user.password_hash):
        return False

    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        role=Roles.USER, data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


async def update_user_profile_service(user_id: int, update_data: UserUpdateSchema) -> User:
    """
    Обновляет профиль пользователя
    
    Args:
        user_id: ID пользователя
        update_data: Данные для обновления
        
    Returns:
        Обновленный объект пользователя
    
    Raises:
        HTTPException: Если пользователь не найден
    """
    # Преобразуем данные в словарь и удаляем None значения
    update_dict = update_data.dict(exclude_unset=True)
    
    # Если передан пароль, хэшируем его
    if "password" in update_dict:
        update_dict["password_hash"] = get_password_hash(update_dict.pop("password"))
    
    # Обновляем профиль
    updated_user = await user_repo.update_user_profile(user_id, update_dict)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )
    
    return updated_user
