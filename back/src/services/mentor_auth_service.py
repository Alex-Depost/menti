from datetime import timedelta
import re
from transliterate import translit

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


async def generate_unique_login(name: str) -> str:
    """
    Генерирует уникальный логин на основе имени.
    Если имя на русском, транслитерирует его.
    Если логин не уникален, добавляет число в конец.

    Args:
        name: Имя пользователя

    Returns:
        Уникальный логин
    """
    # Проверка на русские символы
    if re.search("[а-яА-Я]", name):
        login = translit(name, "ru", reversed=True)
    else:
        login = name

    # Делаем логин в нижнем регистре и заменяем пробелы на подчеркивания
    login = login.lower().replace(" ", "_")

    # Проверяем, существует ли такой логин
    existing_mentor = await mentor_repo.get_mentor_by_login(login)

    if not existing_mentor:
        return login

    # Если логин существует, добавляем число
    counter = 1
    while True:
        new_login = f"{login}{counter}"
        existing_mentor = await mentor_repo.get_mentor_by_login(new_login)
        if not existing_mentor:
            return new_login
        counter += 1


async def register_mentor(user_data: MentorCreationSchema):
    # Генерируем уникальный логин
    login = await generate_unique_login(user_data.name)

    # Создаем хеш пароля
    hashed_password = get_password_hash(user_data.password)

    # Создаем нового ментора
    new_mentor = Mentor(
        name=user_data.name,  # type: ignore
        login=login,  # type: ignore
        password_hash=hashed_password,  # type: ignore
    )

    try:
        await mentor_repo.create_mentor(new_mentor)
        
        # Генерируем JWT токен
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            role=Roles.MENTOR, data={"sub": login}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed"
        )


async def authenticate_mentor(login: str, password: str) -> tuple[Mentor, str]:
    entity = await mentor_repo.get_mentor_by_login(login)
    # Verify user exists and password is correct
    if not entity or not verify_password(password, entity.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        Roles.MENTOR, data={"sub": entity.login}, expires_delta=access_token_expires
    )

    return entity, access_token


async def update_mentor_profile_service(
    mentor_id: int, update_data: MentorUpdateSchema
) -> Mentor:
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
    
    # Убеждаемся, что поле login не может быть изменено
    if "login" in update_dict:
        # Убираем логин из обновляемых данных
        update_dict.pop("login")

    # Обновляем профиль
    updated_mentor = await mentor_repo.update_mentor_profile(mentor_id, update_dict)

    if not updated_mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ментор не найден",
        )

    return updated_mentor
