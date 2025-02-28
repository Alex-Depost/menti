from datetime import datetime
from sqlalchemy import (
    MetaData,
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
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

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False, index=True)
    email = Column(String(100), nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
