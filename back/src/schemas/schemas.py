from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
import uuid
from src.data.models import AdmissionType, DayOfWeek


class CoreUserSchema(BaseModel):
    """Base user schema with common attributes."""

    name: str


class UserCreationSchema(CoreUserSchema):
    """Schema for user creation/registration."""

    password: str = "1"


class MentorCreationSchema(CoreUserSchema):
    """Schema for mentor creation/registration."""

    password: str = "1"


class UserLoginSchema(BaseModel):
    """Schema for user login."""

    login: str
    password: str


class MentorLoginSchema(BaseModel):
    """Schema for mentor login."""

    login: str
    password: str


class Token(BaseModel):
    """Schema for token response."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token data."""

    username: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user response."""

    id: int
    login: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    telegram_link: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    avatar_uuid: Optional[uuid.UUID] = None
    avatar_url: Optional[str] = None
    target_universities: Optional[List[str]] = None
    description: Optional[str] = None
    admission_type: Optional[AdmissionType] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class MentorResponse(BaseModel):
    """Schema for mentor response."""

    id: int
    login: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    telegram_link: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    avatar_uuid: Optional[uuid.UUID] = None
    avatar_url: Optional[str] = None
    university: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    free_days: Optional[List[DayOfWeek]] = None
    admission_type: Optional[AdmissionType] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class MentorFeedInfo(BaseModel):
    """Schema for mentor information in feed responses."""

    id: int
    name: str
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class UserDisplay(BaseModel):
    """Полная схема пользователя для отображения."""

    id: int
    login: Optional[str] = None
    name: str
    email: Optional[EmailStr] = None
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
    login: Optional[str] = None
    name: str
    email: Optional[EmailStr] = None
    avatar_uuid: Optional[uuid.UUID] = None
    telegram_link: Optional[str] = None
    age: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    description: Optional[str] = None
    university: Optional[str] = None
    title: Optional[str] = None
    free_days: Optional[List[DayOfWeek]] = None

    class Config:
        """Pydantic config."""
        from_attributes = True


class MentorUpdateSchema(BaseModel):
    """Схема для обновления профиля ментора."""

    name: Optional[str] = None
    telegram_link: Optional[str] = None
    age: Optional[int] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    description: Optional[str] = None
    university: Optional[str] = None
    title: Optional[str] = None
    free_days: Optional[List[DayOfWeek]] = None

    class Config:
        """Pydantic config."""
        from_attributes = True


class MentorFeedResponse(BaseModel):
    """Schema for mentor in feed responses."""

    id: int
    login: Optional[str] = None
    name: str
    title: Optional[str] = None
    description: Optional[str] = None
    university: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class FeedResponse(BaseModel):
    """Schema for paginated feed responses."""

    items: List[MentorFeedResponse]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        """Pydantic config."""

        from_attributes = True
