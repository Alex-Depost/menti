from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select

from src.data.base import session_scope
from src.data.models import MentorResume, Tag

router = APIRouter(
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_all_resumes(
    skip: int = Query(0, ge=0, description="Number of resumes to skip"),
    limit: int = Query(
        10, ge=1, le=100, description="Maximum number of resumes to return"
    ),
    tag: Optional[str] = Query(None, description="Filter resumes by tag"),
):
    """
    Fetch all available mentor resumes with optional pagination and tag filtering.
    """
    async with session_scope() as session:  # type: ignore
        query = select(MentorResume)

        if tag:
            # Find tag by name (case insensitive)
            tag_query = select(Tag).where(func.lower(Tag.name) == func.lower(tag))
            db_tag = await session.execute(tag_query)  # type: ignore
            db_tag = db_tag.scalars().first()

            if not db_tag:
                raise HTTPException(status_code=404, detail=f"Tag '{tag}' not found")

            # Filter resumes by tag
            query = query.where(MentorResume.tags.any(id=db_tag.id))

        # Apply pagination
        query = query.offset(skip).limit(limit)

        # Execute query
        result = await session.execute(query)  # type: ignore
        resumes: list[MentorResume] = result.scalars().all()  # type: ignore
        res = []
        for resume in resumes:
            mentor = await resume.awaitable_attrs.mentor
            res.append(
                {
                    "id": resume.id,
                    "title": resume.title,
                    "description": resume.description,
                    "mentor": {
                        "id": mentor.id,
                        "name": mentor.name,
                        "email": mentor.email,
                    },
                }
            )
        return res
