from datetime import datetime
from enum import Enum as PyEnum
from typing import cast

from sqlalchemy import (
    ARRAY,
    Boolean,
    Column,
    DateTime,
    Enum,
    Integer,
    MetaData,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import declarative_base

SCHEMA_NAME = "prod"
METADATA = MetaData(
    schema=SCHEMA_NAME,
)
Base = declarative_base(
    metadata=METADATA,
)

class AdmissionType(str, PyEnum):
    """Enum for student admission types."""
    EGE = "ЕГЭ"
    OLYMPIADS = "олимпиады"


class DayOfWeek(str, PyEnum):
    """Enum for days of week."""
    MONDAY = "Понедельник"
    TUESDAY = "Вторник"
    WEDNESDAY = "Среда"
    THURSDAY = "Четверг"
    FRIDAY = "Пятница"
    SATURDAY = "Суббота"
    SUNDAY = "Воскресенье"


class User(Base):
    """User model for authentication and user management."""

    __tablename__ = "users"

    id = cast(int, Column(Integer, primary_key=True, index=True))
    name = cast(str, Column(String(100), nullable=False))
    login = cast(str, Column(String, nullable=True, unique=True))
    telegram_link = cast(str, Column(String(100), nullable=True))
    age = cast(int, Column(Integer, nullable=True))
    email = cast(str, Column(String(100), nullable=True, index=True, unique=True))
    password_hash = cast(str, Column(String(128), nullable=False))
    is_active = cast(bool, Column(Boolean, default=True))
    created_at = cast(datetime, Column(DateTime, default=datetime.now))
    updated_at = cast(
        datetime, Column(DateTime, default=datetime.now, onupdate=datetime.now)
    )
    avatar_uuid =  Column(UUID(as_uuid=True), nullable=True)
    target_universities = cast(
        list[str], Column(ARRAY(String), nullable=True, default=[])
    )
    description = cast(str, Column(String, nullable=True))
    admission_type = cast(str, Column(Enum(AdmissionType), nullable=True))
    


class Mentor(AsyncAttrs, Base):
    """Mentor model for mentorship management."""

    __tablename__ = "mentors"

    id = cast(int, Column(Integer, primary_key=True, index=True))
    name = cast(str, Column(String, nullable=True))
    login = cast(str, Column(String, nullable=True, unique=True))
    email = cast(str, Column(String(100), nullable=True, index=True, unique=True))
    age = cast(int, Column(Integer, nullable=True))
    telegram_link = cast(str, Column(String(100), nullable=True))
    password_hash = cast(str, Column(String(128), nullable=False))
    is_active = cast(bool, Column(Boolean, default=True))
    created_at = cast(datetime, Column(DateTime, default=datetime.now))
    updated_at = cast(
        datetime, Column(DateTime, default=datetime.now, onupdate=datetime.now)
    )
    avatar_uuid =  cast(str, Column(UUID(as_uuid=True), nullable=True))
    # Профессиональная информация
    university = cast(str, Column(String(100), nullable=True))
    free_days = cast(list[str], Column(ARRAY(Enum(DayOfWeek)), nullable=True, default=[]))
    title = cast(str, Column(String(100), nullable=True))
    description = cast(str, Column(String(500), nullable=True))
    admission_type = cast(str, Column(Enum(AdmissionType), nullable=True))

    def __repr__(self):
        return f"<Mentor(id={self.id}, email={self.email})>"
