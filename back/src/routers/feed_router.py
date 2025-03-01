from typing import Optional
from math import ceil

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select

from src.data.base import session_scope
from src.data.models import MentorResume, Tag
from src.schemas.schemas import FeedResponse, MentorResumeFeedResponse, MentorFeedInfo

router = APIRouter(
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=FeedResponse)
async def get_all_resumes(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    tag: Optional[str] = Query(None, description="Filter resumes by tag"),
):
    """
    Fetch all available mentor resumes with pagination and tag filtering.
    """
    async with session_scope() as session:
        query = select(MentorResume)
        count_query = select(func.count(MentorResume.id))  # type: ignore

        if tag:
            tag_query = select(Tag).where(func.lower(Tag.name) == func.lower(tag))
            db_tag = await session.execute(tag_query)
            db_tag = db_tag.scalars().first()

            if not db_tag:
                raise HTTPException(status_code=404, detail=f"Tag '{tag}' not found")

            query = query.where(MentorResume.tags.any(id=db_tag.id))
            count_query = count_query.where(MentorResume.tags.any(id=db_tag.id))

        total_result = await session.execute(count_query)
        total = total_result.scalar() or 0

        skip = (page - 1) * size
        total_pages = ceil(total / size) if total > 0 else 1

        query = query.offset(skip).limit(size)

        result = await session.execute(query)
        resumes = result.scalars().all()

        items = []
        for resume in resumes:
            mentor = await resume.awaitable_attrs.mentor
            tags = await resume.awaitable_attrs.tags

            mentor_info = MentorFeedInfo(
                id=mentor.id, name=mentor.name, email=mentor.email
            )

            items.append(
                MentorResumeFeedResponse(
                    id=resume.id,
                    title=resume.title,
                    description=resume.description,
                    mentor=mentor_info,
                    tags=tags,
                )
            )

        return FeedResponse(
            items=items, total=total, page=page, size=size, pages=total_pages
        )
