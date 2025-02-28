from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import insert, select
from sqlalchemy.exc import IntegrityError

from src.data.base import session_scope
from src.data.models import User
from src.routers.schemas import UserCreate
from src.security.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)


async def register_user(user_data: UserCreate) -> User:
    async with session_scope() as session:
        # Check if email already exists
        result = await session.execute(
            select(User).where(User.email == user_data.email)  # type: ignore
        )  # type: ignore
        existing_user = result.scalars().first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(email=user_data.email, password_hash=hashed_password)

        try:
            stmt = insert(User).values(
                email=new_user.email,
                password_hash=new_user.password_hash,
            )
            await session.execute(stmt)

            # Get the created user
            result = await session.execute(
                select(User).where(User.email == user_data.email)  # type: ignore
            )  # type: ignore
            created_user = result.scalars().first()

            return created_user
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed"
            )


async def authenticate_user(email: str, password: str) -> tuple[User, str]:
    async with session_scope() as session:
        # Find user by email
        result = await session.execute(
            select(User).where(User.email == email)  # type: ignore
        )  # type: ignore
        user = result.scalars().first()

        # Verify user exists and password is correct
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        return user, access_token
