from datetime import datetime
from typing import cast

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    MetaData,
    String,
)
from sqlalchemy.orm import declarative_base

SCHEMA_NAME = "prod"
METADATA = MetaData(
    schema=SCHEMA_NAME,
)
Base = declarative_base(
    metadata=METADATA,
)


class User(Base):
    """User model for authentication and user management."""

    __tablename__ = "users"

    id = cast(int, Column(Integer, primary_key=True, index=True))
    email = cast(str, Column(String(100), nullable=False, index=True, unique=True))
    password_hash = cast(str, Column(String(128), nullable=False))
    is_active = cast(bool, Column(Boolean, default=True))
    created_at = cast(datetime, Column(DateTime, default=datetime.now))
    updated_at = cast(datetime, Column(DateTime, default=datetime.now, onupdate=datetime.now))

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Mentor(Base):
    """Mentor model for mentorship management."""

    __tablename__ = "mentors"

    id = cast(int, Column(Integer, primary_key=True, index=True))
    email = cast(str, Column(String(100), nullable=False, index=True, unique=True))
    password_hash = cast(str, Column(String(128), nullable=False))
    is_active = cast(bool, Column(Boolean, default=True))
    created_at = cast(datetime, Column(DateTime, default=datetime.now))
    updated_at = cast(datetime, Column(DateTime, default=datetime.now, onupdate=datetime.now))

    def __repr__(self):
        return f"<Mentor(id={self.id}, user_id={self.user_id})>"