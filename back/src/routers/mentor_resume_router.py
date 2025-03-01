from fastapi import APIRouter, Depends, HTTPException, status

from src.data.models import Mentor
from src.repository.mentor_resume_repository import (
    create_mentor_resume,
    get_mentor_resume_by_id,
    get_mentor_resumes,
    update_mentor_resume,
)
from src.schemas.schemas import (
    MentorResumeCreate,
    MentorResumeResponse,
    MentorResumeUpdate,
)
from src.security.auth import get_current_mentor

router = APIRouter(tags=["mentor_resumes"])


@router.post(
    "/", response_model=MentorResumeResponse, status_code=status.HTTP_201_CREATED
)
async def create_resume(
    resume_data: MentorResumeCreate, current_mentor: Mentor = Depends(get_current_mentor)
):
    return await create_mentor_resume(current_mentor.id, resume_data)


@router.get("/", response_model=list[MentorResumeResponse])
async def list_resumes(current_mentor: Mentor = Depends(get_current_mentor)):
    return await get_mentor_resumes(current_mentor.id)


@router.get("/{resume_id}", response_model=MentorResumeResponse)
async def get_resume(
    resume_id: int, current_mentor: Mentor = Depends(get_current_mentor)
):
    resume = await get_mentor_resume_by_id(resume_id)
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found"
        )
        
    if resume.mentor_id != current_mentor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resume",
        )
        
    return resume


@router.put("/{resume_id}", response_model=MentorResumeResponse)
async def update_resume(
    resume_id: int,
    resume_data: MentorResumeUpdate,
    current_mentor: Mentor = Depends(get_current_mentor),
):
    resume = await get_mentor_resume_by_id(resume_id)
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found"
        )
        
    if resume.mentor_id != current_mentor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this resume",
        )
        
    return await update_mentor_resume(resume_id, resume_data)