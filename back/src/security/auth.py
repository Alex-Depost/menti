from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from src.config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY, Roles
from src.data.models import Mentor, User
from src.repository.mentor_repository import get_mentor_by_login
from src.repository.user_repository import get_user_by_login

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/signin")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/users/signin", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(
    role: str, data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "role": role})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login: str = payload.get("sub")
        role = payload.get("role")

        if login is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    if role != Roles.USER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Users only")
    user = await get_user_by_login(login)

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )

    return user


async def get_current_mentor(token: str = Depends(oauth2_scheme)) -> Mentor:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login: str = payload.get("sub")
        role = payload.get("role")

        if login is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    if role != Roles.MENTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Mentors only"
        )
    mentor = await get_mentor_by_login(login)

    if mentor is None:
        raise credentials_exception

    if not mentor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )

    return mentor


async def get_optional_current_user(token: str = Depends(oauth2_scheme_optional)) -> Optional[User]:
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login: str = payload.get("sub")
        role = payload.get("role")

        if login is None or role != Roles.USER:
            return None
            
        user = await get_user_by_login(login)
        if user is None or not user.is_active:
            return None
            
        return user
    except (jwt.PyJWTError, HTTPException):
        return None


async def get_optional_current_mentor(token: str = Depends(oauth2_scheme_optional)) -> Optional[Mentor]:
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login: str = payload.get("sub")
        role = payload.get("role")

        if login is None or role != Roles.MENTOR:
            return None
            
        mentor = await get_mentor_by_login(login)
        if mentor is None or not mentor.is_active:
            return None
            
        return mentor
    except (jwt.PyJWTError, HTTPException):
        return None
