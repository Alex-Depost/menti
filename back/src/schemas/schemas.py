from typing import Optional
from pydantic import BaseModel, EmailStr, Field


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

    id: int
    is_active: bool

    class Config:
        """Pydantic config."""

        orm_mode = True


class MentorResponse(CoreUserSchema):
    """Schema for mentor response."""

    id: int
    is_active: bool

    class Config:
        """Pydantic config."""

        orm_mode = True
