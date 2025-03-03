from typing import Optional, List, Union
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
import uuid
import re
from src.data.models import AdmissionType, DayOfWeek


class CoreUserSchema(BaseModel):
    """Base user schema with common attributes."""

    name: str = Field(..., min_length=3, max_length=20, description="Имя должно содержать от 3 до 20 символов")


class UserCreationSchema(CoreUserSchema):
    """Schema for user creation/registration."""

    password: str = "1"

    # Временно закомментировано для демонстрации
    # password: str = Field(..., min_length=10, max_length=30, description="Пароль должен содержать от 10 до 30 символов, включая буквы, цифры и специальные символы")
    
    # @validator('password')
    # def password_complexity(cls, v):
    #     """Проверка сложности пароля."""
    #     if not (re.search(r'[A-Za-z]', v) and re.search(r'\d', v) and re.search(r'[^A-Za-z\d]', v)):
    #         raise ValueError('Пароль должен содержать буквы, цифры и специальные символы')
    #     return v


class MentorCreationSchema(CoreUserSchema):
    """Schema for mentor creation/registration."""
    password: str = "1"
    
    
    # Временно закомментировано для демонстрации
    # password: str = Field(..., min_length=10, max_length=30, description="Пароль должен содержать от 10 до 30 символов, включая буквы, цифры и специальные символы")
    
    # @validator('password')
    # def password_complexity(cls, v):
    #     """Проверка сложности пароля."""
    #     if not (re.search(r'[A-Za-z]', v) and re.search(r'\d', v) and re.search(r'[^A-Za-z\d]', v)):
    #         raise ValueError('Пароль должен содержать буквы, цифры и специальные символы')
    #     return v


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
    name: Optional[str] = Field(None, min_length=3, max_length=20)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=10, le=100)
    telegram_link: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    avatar_uuid: Optional[uuid.UUID] = None
    avatar_url: Optional[str] = None
    target_universities: Optional[List[str]] = None
    description: Optional[str] = Field(None, min_length=10, max_length=300)
    admission_type: Optional[AdmissionType] = None
    
    @validator('telegram_link')
    def validate_telegram_link(cls, v):
        """Проверка формата ссылки на телеграм."""
        if v and not re.match(r'^(https:\/\/)?t\.me\/[A-Za-z\d_]{5,32}$', v):
            raise ValueError('Ссылка на телеграм должна соответствовать формату: t.me/username или https://t.me/username, где username состоит из английских букв, цифр и подчеркиваний, длиной от 5 до 32 символов')
        if v and v.startswith('t.me/'):
            v = 'https://' + v
        return v
    
    @validator('target_universities')
    def validate_universities(cls, v):
        """Проверка названий университетов."""
        if v:
            for uni in v:
                if len(uni) < 2 or len(uni) > 50:
                    raise ValueError('Название каждого университета должно содержать от 2 до 50 символов')
        return v

    class Config:
        """Pydantic config."""

        from_attributes = True


class MentorResponse(BaseModel):
    """Schema for mentor response."""

    id: int
    login: Optional[str] = None
    name: Optional[str] = Field(None, min_length=3, max_length=20)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=10, le=100)
    telegram_link: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    avatar_uuid: Optional[uuid.UUID] = None
    avatar_url: Optional[str] = None
    university: Optional[str] = Field(None, min_length=2, max_length=50)
    title: Optional[str] = None
    description: Optional[str] = Field(None, min_length=10, max_length=300)
    free_days: Optional[List[DayOfWeek]] = None
    admission_type: Optional[AdmissionType] = None
    
    @validator('telegram_link')
    def validate_telegram_link(cls, v):
        """Проверка формата ссылки на телеграм."""
        if v and not re.match(r'^(https:\/\/)?t\.me\/[A-Za-z\d_]{5,32}$', v):
            raise ValueError('Ссылка на телеграм должна соответствовать формату: t.me/username или https://t.me/username, где username состоит из английских букв, цифр и подчеркиваний, длиной от 5 до 32 символов')
        if v and v.startswith('t.me/'):
            v = 'https://' + v
        return v

    class Config:
        """Pydantic config."""

        from_attributes = True


class MentorFeedInfo(BaseModel):
    """Schema for mentor information in feed responses."""

    id: int
    name: str = Field(..., min_length=3, max_length=20)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class UserDisplay(BaseModel):
    """Полная схема пользователя для отображения."""

    id: int
    login: Optional[str] = None
    name: str = Field(..., min_length=3, max_length=20)
    email: Optional[EmailStr] = None
    avatar_uuid: Optional[uuid.UUID] = None
    telegram_link: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=100)
    is_active: bool
    created_at: datetime
    updated_at: datetime
    target_universities: Optional[List[str]] = None
    description: Optional[str] = Field(None, min_length=10, max_length=300)
    admission_type: Optional[AdmissionType] = None
    
    @validator('telegram_link')
    def validate_telegram_link(cls, v):
        """Проверка формата ссылки на телеграм."""
        if v and not re.match(r'^(https:\/\/)?t\.me\/[A-Za-z\d_]{5,32}$', v):
            raise ValueError('Ссылка на телеграм должна соответствовать формату: t.me/username или https://t.me/username, где username состоит из английских букв, цифр и подчеркиваний, длиной от 5 до 32 символов')
        if v and v.startswith('t.me/'):
            v = 'https://' + v
        return v
    
    @validator('target_universities')
    def validate_universities(cls, v):
        """Проверка названий университетов."""
        if v:
            for uni in v:
                if len(uni) < 2 or len(uni) > 50:
                    raise ValueError('Название каждого университета должно содержать от 2 до 50 символов')
        return v

    class Config:
        """Pydantic config."""
        from_attributes = True


class UserUpdateSchema(BaseModel):
    """Схема для обновления профиля пользователя."""

    name: Optional[str] = Field(None, min_length=3, max_length=20)
    telegram_link: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=10, max_length=30)
    description: Optional[str] = Field(None, min_length=10, max_length=300)
    target_universities: Optional[List[str]] = None
    admission_type: Optional[AdmissionType] = None
    
    @validator('password')
    def password_complexity(cls, v):
        """Проверка сложности пароля."""
        if v and not (re.search(r'[A-Za-z]', v) and re.search(r'\d', v) and re.search(r'[^A-Za-z\d]', v)):
            raise ValueError('Пароль должен содержать буквы, цифры и специальные символы')
        return v
    
    @validator('telegram_link')
    def validate_telegram_link(cls, v):
        """Проверка формата ссылки на телеграм."""
        if v and not re.match(r'^(https:\/\/)?t\.me\/[A-Za-z\d_]{5,32}$', v):
            raise ValueError('Ссылка на телеграм должна соответствовать формату: t.me/username или https://t.me/username, где username состоит из английских букв, цифр и подчеркиваний, длиной от 5 до 32 символов')
        if v and v.startswith('t.me/'):
            v = 'https://' + v
        return v
    
    @validator('target_universities')
    def validate_universities(cls, v):
        """Проверка названий университетов."""
        if v:
            for uni in v:
                if len(uni) < 2 or len(uni) > 50:
                    raise ValueError('Название каждого университета должно содержать от 2 до 50 символов')
        return v

    class Config:
        """Pydantic config."""
        from_attributes = True


class MentorDisplay(BaseModel):
    """Полная схема ментора для отображения."""

    id: int
    login: Optional[str] = None
    name: str = Field(..., min_length=3, max_length=20)
    email: Optional[EmailStr] = None
    avatar_uuid: Optional[uuid.UUID] = None
    telegram_link: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=100)
    is_active: bool
    created_at: datetime
    updated_at: datetime
    description: Optional[str] = Field(None, min_length=10, max_length=300)
    university: Optional[str] = Field(None, min_length=2, max_length=50)
    title: Optional[str] = None
    admission_type: Optional[AdmissionType] = None
    free_days: Optional[List[DayOfWeek]] = None
    
    @validator('telegram_link')
    def validate_telegram_link(cls, v):
        """Проверка формата ссылки на телеграм."""
        if v and not re.match(r'^(https:\/\/)?t\.me\/[A-Za-z\d_]{5,32}$', v):
            raise ValueError('Ссылка на телеграм должна соответствовать формату: t.me/username или https://t.me/username, где username состоит из английских букв, цифр и подчеркиваний, длиной от 5 до 32 символов')
        if v and v.startswith('t.me/'):
            v = 'https://' + v
        return v

    class Config:
        """Pydantic config."""
        from_attributes = True


class MentorUpdateSchema(BaseModel):
    """Схема для обновления профиля ментора."""

    name: Optional[str] = Field(None, min_length=3, max_length=20)
    telegram_link: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=10, max_length=30)
    description: Optional[str] = Field(None, min_length=10, max_length=300)
    university: Optional[str] = Field(None, min_length=2, max_length=50)
    title: Optional[str] = None
    admission_type: Optional[AdmissionType] = None
    free_days: Optional[List[DayOfWeek]] = None
    
    @validator('password')
    def password_complexity(cls, v):
        """Проверка сложности пароля."""
        if v and not (re.search(r'[A-Za-z]', v) and re.search(r'\d', v) and re.search(r'[^A-Za-z\d]', v)):
            raise ValueError('Пароль должен содержать буквы, цифры и специальные символы')
        return v
    
    @validator('telegram_link')
    def validate_telegram_link(cls, v):
        """Проверка формата ссылки на телеграм."""
        if v and not re.match(r'^(https:\/\/)?t\.me\/[A-Za-z\d_]{5,32}$', v):
            raise ValueError('Ссылка на телеграм должна соответствовать формату: t.me/username или https://t.me/username, где username состоит из английских букв, цифр и подчеркиваний, длиной от 5 до 32 символов')
        if v and v.startswith('t.me/'):
            v = 'https://' + v
        return v

    class Config:
        """Pydantic config."""
        from_attributes = True


class MentorFeedResponse(BaseModel):
    """Schema for mentor in feed responses."""

    id: int
    login: Optional[str] = None
    name: str = Field(..., min_length=3, max_length=20)
    title: Optional[str] = None
    description: Optional[str] = Field(None, min_length=10, max_length=300)
    university: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    telegram_link: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class UserFeedResponse(BaseModel):
    """Schema for user in feed responses."""

    id: int
    login: Optional[str] = None
    name: str = Field(..., min_length=3, max_length=20)
    description: Optional[str] = Field(None, min_length=10, max_length=300)
    target_universities: Optional[List[str]] = None
    admission_type: Optional[AdmissionType] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    telegram_link: Optional[str] = None

    class Config:
        """Pydantic config."""
        from_attributes = True


class FeedResponse(BaseModel):
    """Schema for paginated feed responses."""

    items: List[Union[MentorFeedResponse, UserFeedResponse]]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        """Pydantic config."""
        from_attributes = True
