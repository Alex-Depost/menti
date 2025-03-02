from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from src.data.models import RequestStatus, EntityType


class RequestCreate(BaseModel):
    """Схема для создания заявки."""
    receiver_id: int
    message: Optional[str] = None
    receiver_type: EntityType


class RequestResponse(BaseModel):
    """Схема для ответа с заявкой."""
    id: int
    sender_id: int
    sender_type: EntityType
    receiver_id: int
    receiver_type: EntityType
    message: Optional[str] = None
    status: RequestStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True 