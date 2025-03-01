from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
import uuid
from src.data.models import AdmissionType


class CoreUserSchema(BaseModel):
    """Base user schema with common attributes."""

    email: EmailStr


class UserCreationSchema(CoreUserSchema):
    """Schema for user creation/registration."""

    password: str = Field(..., min_length=8)


class MentorCreationSchema(CoreUserSchema):
    """Schema for mentor creation/registration."""

    password: str = Field(..., min_length=8)


class UserLoginSchema(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


class MentorLoginSchema(BaseModel):
    """Schema for mentor login."""

    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for token response."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token data."""

    username: Optional[str] = None


class UserResponse(CoreUserSchema):
    """Schema for user response."""

    name: str
    id: int
    is_active: bool
    avatar_url: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class MentorResponse(CoreUserSchema):
    """Schema for mentor response."""

    name: str
    id: int
    is_active: bool
    avatar_url: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class TagSchema(BaseModel):
    """Schema for tag."""

    id: int
    name: str

    class Config:
        """Pydantic config."""

        from_attributes = True


class MentorResumeBase(BaseModel):
    """Base schema for mentor resume."""

    university: str
    title: str
    description: str


class MentorResumeCreate(MentorResumeBase):
    """Schema for mentor resume creation."""

    pass


class MentorResumeUpdate(BaseModel):
    """Schema for mentor resume update."""

    university: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


class MentorResumeResponse(MentorResumeBase):
    """Schema for mentor resume response."""

    id: int
    mentor_id: int
    created_at: datetime
    updated_at: datetime
    tags: List[TagSchema] = []

    class Config:
        """Pydantic config."""

        from_attributes = True


class MentorFeedInfo(BaseModel):
    """Schema for mentor information in feed responses."""

    id: int
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class MentorResumeFeedResponse(BaseModel):
    """Schema for mentor resume in feed responses."""

    id: int
    title: str
    description: str
    mentor: MentorFeedInfo
    tags: List[TagSchema] = []

    class Config:
        """Pydantic config."""

        from_attributes = True


class FeedResponse(BaseModel):
    """Schema for paginated feed responses."""

    items: List[MentorResumeFeedResponse]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        """Pydantic config."""

        from_attributes = True


class UserDisplay(BaseModel):
    """Полная схема пользователя для отображения."""

    id: int
    name: str
    email: EmailStr
    avatar_uuid: Optional[uuid.UUID] = None
    telegram_link: Optional[str] = None
    age: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    target_universities: Optional[List[str]] = None
    description: Optional[str] = None
    admission_type: Optional[AdmissionType] = None

    class Config:
        """Pydantic config."""
        from_attributes = True


class UserUpdateSchema(BaseModel):
    """Схема для обновления профиля пользователя."""

    name: Optional[str] = None
    telegram_link: Optional[str] = None
    age: Optional[int] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    description: Optional[str] = None
    target_universities: Optional[List[str]] = None
    admission_type: Optional[AdmissionType] = None

    class Config:
        """Pydantic config."""
        from_attributes = True


class MentorDisplay(BaseModel):
    """Полная схема ментора для отображения."""

    id: int
    name: str
    email: EmailStr
    avatar_uuid: Optional[uuid.UUID] = None
    telegram_link: Optional[str] = None
    age: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True
