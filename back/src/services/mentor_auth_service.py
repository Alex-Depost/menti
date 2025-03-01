from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from src.config import Roles
from src.data.models import Mentor
import src.repository.mentor_repository as mentor_repo
from src.schemas.schemas import MentorCreationSchema, MentorUpdateSchema
from src.security.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)


async def register_mentor(user_data: MentorCreationSchema) -> Mentor:
    existing_user = await mentor_repo.get_mentor_by_email(user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = Mentor(email=user_data.email, password_hash=hashed_password)

    try:
        await mentor_repo.create_mentor(new_user)

        created_user = await mentor_repo.get_mentor_by_email(user_data.email)
        return created_user
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed"
        )


async def authenticate_mentor(email: str, password: str) -> tuple[Mentor, str]:
    entity = await mentor_repo.get_mentor_by_email(email)
    # Verify user exists and password is correct
    if not entity or not verify_password(password, entity.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        Roles.MENTOR,
        data={"sub": entity.email}, expires_delta=access_token_expires
    )

    return entity, access_token


async def update_mentor_profile_service(mentor_id: int, update_data: MentorUpdateSchema) -> Mentor:
    """
    Обновляет профиль ментора
    
    Args:
        mentor_id: ID ментора
        update_data: Данные для обновления
        
    Returns:
        Обновленный объект ментора
    
    Raises:
        HTTPException: Если ментор не найден
    """
    # Преобразуем данные в словарь и удаляем None значения
    update_dict = update_data.dict(exclude_unset=True)
    
    # Если передан пароль, хэшируем его
    if "password" in update_dict:
        update_dict["password_hash"] = get_password_hash(update_dict.pop("password"))
    
    # Обновляем профиль
    updated_mentor = await mentor_repo.update_mentor_profile(mentor_id, update_dict)
    
    if not updated_mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ментор не найден",
        )
    
    return updated_mentor
