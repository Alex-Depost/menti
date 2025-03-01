from typing import Optional
from math import ceil
import os
from urllib.parse import urljoin

from fastapi import APIRouter, HTTPException, Query, Request
from sqlalchemy import func, select

from src.data.base import session_scope
from src.data.models import Mentor, Tag
from src.repository.mentor_repository import get_mentors
from src.schemas.schemas import FeedResponse, MentorFeedResponse

router = APIRouter(
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=FeedResponse)
async def get_all_mentors(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    tag: Optional[str] = Query(None, description="Filter mentors by tag"),
):
    """
    Fetch all available mentors with pagination and tag filtering.
    """
    mentors, total = await get_mentors(page=page, size=size, tag_name=tag)
    
    total_pages = ceil(total / size) if total > 0 else 1
    
    items = []
    for mentor in mentors:
        # Формируем URL для аватара
        avatar_url = None
        if mentor.avatar_uuid:
            base_url = str(request.base_url)
            avatar_url = urljoin(base_url, f"api/v1/storage/avatar/{mentor.avatar_uuid}")

        items.append(
            MentorFeedResponse(
                id=mentor.id,
                name=mentor.name,
                title=mentor.title,
                description=mentor.description,
                university=mentor.university,
                email=mentor.email,
                avatar_url=avatar_url,
                tags=mentor.tags,
            )
        )

    return FeedResponse(
        items=items, 
        total=total, 
        page=page, 
        size=size, 
        pages=total_pages
    )
