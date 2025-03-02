from math import ceil
from urllib.parse import urljoin

from fastapi import APIRouter, HTTPException, Query, Request, Depends

from src.data.models import User
from src.repository.mentor_repository import get_mentors, get_filtered_mentors
from src.schemas.schemas import FeedResponse, MentorFeedResponse
from src.security.auth import get_current_user

router = APIRouter(
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)


@router.get("/all", response_model=FeedResponse)
async def get_all_mentors(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    """
    Fetch all available mentors with pagination.
    """
    mentors, total = await get_mentors(page=page, size=size)

    total_pages = ceil(total / size) if total > 0 else 1

    items = []
    for mentor in mentors:
        # Формируем URL для аватара
        avatar_url = None
        if mentor.avatar_uuid:
            base_url = str(request.base_url)
            avatar_url = urljoin(base_url, f"img/{mentor.avatar_uuid}")

        items.append(
            MentorFeedResponse(
                id=mentor.id,
                name=mentor.name,
                title=mentor.title,
                description=mentor.description,
                university=mentor.university,
                email=mentor.email,
                avatar_url=avatar_url,
            )
        )

    return FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )


@router.get("/filtered", response_model=FeedResponse)
async def get_filtered_mentors_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    """
    Fetch mentors filtered by the current user's preferences.
    Filters mentors whose university is in the user's target_universities list
    and whose admission_type matches the user's admission_type.
    """
    if not current_user:
        raise HTTPException(
            status_code=401, detail="Authentication required to access filtered feed"
        )

    mentors, total = await get_filtered_mentors(
        target_universities=current_user.target_universities,
        admission_type=current_user.admission_type,
        page=page,
        size=size,
    )

    total_pages = ceil(total / size) if total > 0 else 1

    items = []
    for mentor in mentors:
        # Формируем URL для аватара
        avatar_url = None
        if mentor.avatar_uuid:
            base_url = str(request.base_url)
            avatar_url = urljoin(base_url, f"img/{mentor.avatar_uuid}")

        items.append(
            MentorFeedResponse(
                id=mentor.id,
                name=mentor.name,
                title=mentor.title,
                description=mentor.description,
                university=mentor.university,
                email=mentor.email,
                avatar_url=avatar_url,
            )
        )

    return FeedResponse(
        items=items, total=total, page=page, size=size, pages=total_pages
    )
