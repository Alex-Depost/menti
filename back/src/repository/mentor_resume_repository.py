from sqlalchemy import insert, select, update
from sqlalchemy.orm import selectinload

from src.data.base import session_scope
from src.data.models import MentorResume
from src.schemas.schemas import MentorResumeCreate, MentorResumeUpdate


async def create_mentor_resume(mentor_id: int, resume_data: MentorResumeCreate) -> MentorResume:
    async with session_scope() as session:
        stmt = insert(MentorResume).values(
            mentor_id=mentor_id,
            university=resume_data.university,
            title=resume_data.title,
            description=resume_data.description,
        )
        result = await session.execute(stmt)
        assert result.inserted_primary_key
        resume_id = result.inserted_primary_key[0]
        
        result = await session.execute(
            select(MentorResume).where(MentorResume.id == resume_id).options(selectinload(MentorResume.tags))
        )
        return result.scalars().first()


async def get_mentor_resumes(mentor_id: int) -> list[MentorResume]:
    async with session_scope() as session:
        result = await session.execute(
            select(MentorResume)
            .where(MentorResume.mentor_id == mentor_id) # type: ignore
            .options(selectinload(MentorResume.tags))
        )
        return result.scalars().all() # type: ignore


async def get_mentor_resume_by_id(resume_id: int) -> MentorResume:
    async with session_scope() as session:
        result = await session.execute(
            select(MentorResume)
            .where(MentorResume.id == resume_id) # type: ignore
            .options(selectinload(MentorResume.tags))
        )
        return result.scalars().first()


async def update_mentor_resume(resume_id: int, resume_data: MentorResumeUpdate) -> MentorResume:
    async with session_scope() as session:
        update_values = {}
        
        if resume_data.university is not None:
            update_values["university"] = resume_data.university
        
        if resume_data.title is not None:
            update_values["title"] = resume_data.title
            
        if resume_data.description is not None:
            update_values["description"] = resume_data.description
            
        if update_values:
            stmt = update(MentorResume).where(MentorResume.id == resume_id).values(**update_values) # type: ignore
            await session.execute(stmt)
            
        result = await session.execute(
            select(MentorResume)
            .where(MentorResume.id == resume_id) # type: ignore
            .options(selectinload(MentorResume.tags))
        )
        return result.scalars().first()