from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel

from src.data.models import RequestStatus, EntityType
from src.schemas.schemas import UserFeedResponse, MentorFeedResponse


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


class RequestResponseWithSender(RequestResponse):
    """Схема для ответа с заявкой, включающая информацию об отправителе."""

    sender: Optional[Union[UserFeedResponse, MentorFeedResponse]] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class RequestResponseWithReceiver(RequestResponse):
    """Схема для ответа с заявкой, включающая информацию о получателе."""

    receiver: Optional[Union[UserFeedResponse, MentorFeedResponse]] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


# Новые схемы для ответов на запросы подтверждения/отклонения заявок


class ContactInfo(BaseModel):
    """Схема для контактной информации отправителя заявки."""

    email: Optional[str] = None
    telegram_link: Optional[str] = None

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "telegram_link": "https://t.me/username",
            }
        }


class RequestApproveResponse(BaseModel):
    """Схема для ответа при подтверждении заявки."""

    message: str
    contact_info: ContactInfo

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "message": "Заявка успешно подтверждена",
                "contact_info": {
                    "email": "user@example.com",
                    "telegram_link": "https://t.me/username",
                },
            }
        }


class RequestRejectResponse(BaseModel):
    """Схема для ответа при отклонении заявки."""

    message: str

    class Config:
        """Pydantic config."""

        json_schema_extra = {"example": {"message": "Заявка успешно отклонена"}}
