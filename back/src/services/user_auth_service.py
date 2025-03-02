from datetime import timedelta
import re
from transliterate import translit

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
    if re.search('[а-яА-Я]', name):
        login = translit(name, 'ru', reversed=True)
    else:
        login = name
        
    # Делаем логин в нижнем регистре и заменяем пробелы на подчеркивания
    login = login.lower().replace(' ', '_')
    
    # Проверяем, существует ли такой логин
    existing_user = await user_repo.get_user_by_login(login)
    
    if not existing_user:
        return login
    
    # Если логин существует, добавляем число
    counter = 1
    while True:
        new_login = f"{login}{counter}"
        existing_user = await user_repo.get_user_by_login(new_login)
        if not existing_user:
            return new_login
        counter += 1


async def register_user(user_data: UserCreationSchema):
    # Генерируем уникальный логин
    login = await generate_unique_login(user_data.name)
    
    # Создаем хеш пароля
    hashed_password = get_password_hash(user_data.password)
    
    # Создаем нового пользователя
    new_user = User(
        name=user_data.name,
        login=login,
        password_hash=hashed_password
    )

    try:
        await user_repo.create_user(new_user)
        created_user = await user_repo.get_user_by_login(login)
        
        # Генерируем JWT токен
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            role=Roles.USER, data={"sub": login}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed"
        )


async def authenticate_user(login: str, password: str):
    user = await user_repo.get_user_by_login(login)

    if not user:
        return False

    if not verify_password(password, user.password_hash):
        return False

    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        role=Roles.USER, data={"sub": user.login}, expires_delta=access_token_expires
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
    update_dict = update_data.dict(exclude_unset=True, exclude_none=False)
    
    # Если передан пароль, хэшируем его
    if "password" in update_dict:
        update_dict["password_hash"] = get_password_hash(update_dict.pop("password"))
    
    # Убеждаемся, что поле login не может быть изменено
    if "login" in update_dict:
        # Убираем логин из обновляемых данных
        update_dict.pop("login")
    
    # Обновляем профиль
    updated_user = await user_repo.update_user_profile(user_id, update_dict)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )
    
    return updated_user
