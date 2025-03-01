from sqlalchemy import select
from src.data.base import session_scope
from src.data.models import User
from sqlalchemy import insert


async def get_user_by_email(email: str) -> User:
    async with session_scope() as session:
        # Find user by email
        result = await session.execute(
            select(User).where(User.email == email)  # type: ignore
        )  # type: ignore
        return result.scalars().first()


async def create_user(user_data: User) -> User:
    async with session_scope() as session:
        stmt = insert(User).values(
            name=user_data.email.split("@")[0],
            email=user_data.email,
            password_hash=user_data.password_hash,
        )
        await session.execute(stmt)
        await session.commit()
        return await get_user_by_email(user_data.email)
