from datetime import datetime
from typing import cast
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    MetaData,
    String,
    Table,
    ARRAY,
)
from sqlalchemy.orm import declarative_base, relationship

SCHEMA_NAME = "prod"
METADATA = MetaData(
    schema=SCHEMA_NAME,
)
Base = declarative_base(
    metadata=METADATA,
)

# Association table for MentorResume and Tag (many-to-many)
resume_tags = Table(
    "resume_tags",
    Base.metadata,
    Column(
        "resume_id",
        Integer,
        ForeignKey(f"{SCHEMA_NAME}.mentor_resumes.id"),
        primary_key=True,
    ),
    Column("tag_id", Integer, ForeignKey(f"{SCHEMA_NAME}.tags.id"), primary_key=True),
    Column("created_at", DateTime, default=datetime.now),
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
    telegram_link = cast(str, Column(String(100), nullable=True))
    age = cast(int, Column(Integer, nullable=True))
    email = cast(str, Column(String(100), nullable=True, index=True, unique=True))
    password_hash = cast(str, Column(String(128), nullable=False))
    is_active = cast(bool, Column(Boolean, default=True))
    created_at = cast(datetime, Column(DateTime, default=datetime.now))
    updated_at = cast(
        datetime, Column(DateTime, default=datetime.now, onupdate=datetime.now)
    )
    target_universities = cast(
        list[str], Column(ARRAY(String), nullable=True, default=[])
    )
    description = cast(str, Column(String(500), nullable=True))
    admission_type = cast(str, Column(Enum(AdmissionType), nullable=True))
    


class Mentor(Base):
    """Mentor model for mentorship management."""

    __tablename__ = "mentors"

    id = cast(int, Column(Integer, primary_key=True, index=True))
    name = cast(str, Column(String, nullable=True))
    email = cast(str, Column(String(100), nullable=False, index=True, unique=True))
    age = cast(int, Column(Integer, nullable=True))
    telegram_link = cast(str, Column(String(100), nullable=True))
    password_hash = cast(str, Column(String(128), nullable=False))
    is_active = cast(bool, Column(Boolean, default=True))
    created_at = cast(datetime, Column(DateTime, default=datetime.now))
    updated_at = cast(
        datetime, Column(DateTime, default=datetime.now, onupdate=datetime.now)
    )

    resumes = relationship(
        "MentorResume", back_populates="mentor", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Mentor(id={self.id}, email={self.email})>"


class MentorResume(AsyncAttrs, Base):
    """Mentor resume model for mentorship management."""

    __tablename__ = "mentor_resumes"

    id = cast(int, Column(Integer, primary_key=True, index=True))
    mentor_id = cast(
        int,
        Column(
            Integer, ForeignKey(f"{SCHEMA_NAME}.mentors.id"), nullable=False, index=True
        ),
    )
    university = cast(str, Column(String(100), nullable=False))
    free_days = cast(list[str], Column(ARRAY(PyEnum(DayOfWeek)), nullable=True, default=[]))
    title = cast(str, Column(String(100), nullable=False))
    description = cast(str, Column(String(500), nullable=False))
    created_at = cast(datetime, Column(DateTime, default=datetime.now))
    updated_at = cast(
        datetime, Column(DateTime, default=datetime.now, onupdate=datetime.now)
    )

    mentor = relationship("Mentor", back_populates="resumes")
    tags = relationship("Tag", secondary=resume_tags, back_populates="mentor_resumes")

    def __repr__(self):
        return f"<MentorResume(id={self.id}, mentor_id={self.mentor_id})>"


class Tag(Base):
    """Tag model for mentorship management."""

    __tablename__ = "tags"

    id = cast(int, Column(Integer, primary_key=True, index=True))
    name = cast(str, Column(String(100), nullable=False, index=True, unique=True))
    created_at = cast(datetime, Column(DateTime, default=datetime.now))
    updated_at = cast(
        datetime, Column(DateTime, default=datetime.now, onupdate=datetime.now)
    )
    mentor_resumes = relationship(
        "MentorResume", secondary=resume_tags, back_populates="tags"
    )

    def __repr__(self):
        return f"<Tag(id={self.id}, name={self.name})>"
