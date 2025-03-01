from sqlalchemy import select
from src.data.base import session_scope
from src.data.models import Mentor
from sqlalchemy import insert


async def get_mentor_by_email(email: str) -> Mentor:
    async with session_scope() as session:
        # Find Mentor by email
        result = await session.execute(
            select(Mentor).where(Mentor.email == email)  # type: ignore
        )  # type: ignore
        return result.scalars().first()


async def create_mentor(mentor: Mentor) -> Mentor:
    async with session_scope() as session:
        stmt = insert(Mentor).values(
            name=mentor.email.split("@")[0],
            email=mentor.email,
            password_hash=mentor.password_hash,
        )
        await session.execute(stmt)
    return await get_mentor_by_email(mentor.email)
