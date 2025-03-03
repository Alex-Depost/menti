from typing import List, Union, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.base import session_scope
from src.data.models import Request, RequestStatus, EntityType, User, Mentor
from src.schemas.request_schemas import RequestCreate, RequestResponse, RequestResponseWithSender, RequestResponseWithReceiver
from src.security.auth import get_optional_current_user, get_optional_current_mentor
from src.schemas.schemas import UserFeedResponse, MentorFeedResponse
from src.utils.constants import AVATAR_URL


async def get_current_user_or_mentor(
    user: User = Depends(get_optional_current_user),
    mentor: Mentor = Depends(get_optional_current_mentor)
) -> Union[User, Mentor]:
    """Получить текущего пользователя или ментора."""
    if user:
        return user
    if mentor:
        return mentor
    raise HTTPException(
        status_code=401,
        detail="Требуется аутентификация"
    )


router = APIRouter(
    prefix="/requests",
    tags=["requests"]
)


@router.post("/send", response_model=RequestResponse)
async def send_request(
    request_data: RequestCreate,
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """
    Отправить заявку на менторство.
    
    - Пользователь может отправить заявку ментору
    - Ментор может отправить заявку пользователю
    - Нельзя отправить заявку самому себе
    - Нельзя отправить заявку, если уже есть активная заявка к этому получателю
    """
    # Определяем тип отправителя
    sender_type = EntityType.USER if isinstance(current_user, User) else EntityType.MENTOR

    # Проверяем, что отправитель не отправляет заявку самому себе
    if current_user.id == request_data.receiver_id and sender_type == request_data.receiver_type:
        raise HTTPException(
            status_code=400,
            detail="Нельзя отправить заявку самому себе"
        )

    # Проверяем, что пользователь отправляет заявку ментору и наоборот
    if sender_type == request_data.receiver_type:
        raise HTTPException(
            status_code=400,
            detail="Пользователь может отправлять заявки только менторам, а ментор только пользователям"
        )

    # Проверяем существование получателя
    async with session_scope() as session:
        if request_data.receiver_type == EntityType.USER:
            query = select(User).where(User.id == request_data.receiver_id)
        else:
            query = select(Mentor).where(Mentor.id == request_data.receiver_id)
        
        result = await session.execute(query)
        receiver = result.scalar_one_or_none()
        
        if not receiver:
            raise HTTPException(
                status_code=404,
                detail="Получатель не найден"
            )

        # Проверяем, не существует ли уже активная заявка
        existing_request = await session.execute(
            select(Request).where(
                and_(
                    Request.sender_id == current_user.id,
                    Request.sender_type == sender_type,
                    Request.receiver_id == request_data.receiver_id,
                    Request.receiver_type == request_data.receiver_type,
                    Request.status == RequestStatus.PENDING
                )
            )
        )
        if existing_request.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="У вас уже есть активная заявка к этому получателю"
            )

        # Создаем новую заявку
        new_request = Request(
            sender_id=current_user.id,
            sender_type=sender_type,
            receiver_id=request_data.receiver_id,
            receiver_type=request_data.receiver_type,
            message=request_data.message,
            status=RequestStatus.PENDING
        )

        session.add(new_request)
        await session.commit()
        await session.refresh(new_request)
        return new_request


@router.get("/sent", response_model=List[RequestResponseWithReceiver])
async def get_sent_requests(
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """
    Получить список отправленных заявок.
    
    - Для пользователей: список заявок, отправленных менторам
    - Для менторов: список заявок, отправленных пользователям
    """
    # Определяем тип отправителя
    sender_type = EntityType.USER if isinstance(current_user, User) else EntityType.MENTOR

    async with session_scope() as session:
        query = select(Request).where(
            and_(
                Request.sender_id == current_user.id,
                Request.sender_type == sender_type
            )
        )
        result = await session.execute(query)
        requests = result.scalars().all()
        
        requests_with_receivers = []
        
        for request in requests:
            # Получаем информацию об получателе
            receiver = None
            if request.receiver_type == EntityType.USER:
                # Если получатель - пользователь, получаем информацию о нем
                user_query = select(User).where(User.id == request.receiver_id)
                user_result = await session.execute(user_query)
                user = user_result.scalars().first()
                if user:
                    receiver = UserFeedResponse.model_validate(user)
                    # Добавляем URL аватара, если есть UUID
                    if user.avatar_uuid and not receiver.avatar_url:
                        receiver.avatar_url = f"{AVATAR_URL}/{user.avatar_uuid}"
            else:
                # Если получатель - ментор, получаем информацию о нем
                mentor_query = select(Mentor).where(Mentor.id == request.receiver_id)
                mentor_result = await session.execute(mentor_query)
                mentor = mentor_result.scalars().first()
                if mentor:
                    receiver = MentorFeedResponse.model_validate(mentor)
                    # Добавляем URL аватара, если есть UUID
                    if mentor.avatar_uuid and not receiver.avatar_url:
                        receiver.avatar_url = f"{AVATAR_URL}/{mentor.avatar_uuid}"
            
            # Создаем объект ответа с информацией об отправителе
            request_response = RequestResponseWithReceiver.model_validate(request)
            request_response.receiver = receiver
            requests_with_receivers.append(request_response)
        
        return requests_with_receivers
        

@router.get("/got", response_model=List[RequestResponseWithSender])
async def get_received_requests(
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """
    Получить список полученных заявок.
    
    - Для пользователей: список заявок, полученных от менторов
    - Для менторов: список заявок, полученных от пользователей
    """
    # Определяем тип получателя
    receiver_type = EntityType.USER if isinstance(current_user, User) else EntityType.MENTOR

    async with session_scope() as session:
        query = select(Request).where(
            and_(
                Request.receiver_id == current_user.id,
                Request.receiver_type == receiver_type
            )
        )
        result = await session.execute(query)
        requests = result.scalars().all()
        
        # Создаем список для хранения ответов с информацией об отправителях
        requests_with_senders = []
        
        for request in requests:
            # Получаем информацию об отправителе
            sender = None
            if request.sender_type == EntityType.USER:
                # Если отправитель - пользователь, получаем информацию о нем
                user_query = select(User).where(User.id == request.sender_id)
                user_result = await session.execute(user_query)
                user = user_result.scalars().first()
                if user:
                    sender = UserFeedResponse.model_validate(user)
                    # Добавляем URL аватара, если есть UUID
                    if user.avatar_uuid and not sender.avatar_url:
                        sender.avatar_url = f"{AVATAR_URL}/{user.avatar_uuid}"
            else:
                # Если отправитель - ментор, получаем информацию о нем
                mentor_query = select(Mentor).where(Mentor.id == request.sender_id)
                mentor_result = await session.execute(mentor_query)
                mentor = mentor_result.scalars().first()
                if mentor:
                    sender = MentorFeedResponse.model_validate(mentor)
                    # Добавляем URL аватара, если есть UUID
                    if mentor.avatar_uuid and not sender.avatar_url:
                        sender.avatar_url = f"{AVATAR_URL}/{mentor.avatar_uuid}"
            
            # Создаем объект ответа с информацией об отправителе
            request_response = RequestResponseWithSender.model_validate(request)
            request_response.sender = sender
            requests_with_senders.append(request_response)
        
        return requests_with_senders


@router.post("/approve/{request_id}")
async def approve_request(
    request_id: int,
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """
    Подтвердить полученную заявку.
    
    - Пользователь может подтвердить заявку от ментора
    - Ментор может подтвердить заявку от пользователя
    - Можно подтвердить только заявки в статусе "в ожидании"
    """
    # Определяем тип получателя
    receiver_type = EntityType.USER if isinstance(current_user, User) else EntityType.MENTOR

    async with session_scope() as session:
        # Получаем заявку
        query = select(Request).where(
            and_(
                Request.id == request_id,
                Request.receiver_id == current_user.id,
                Request.receiver_type == receiver_type,
                Request.status == RequestStatus.PENDING
            )
        )
        result = await session.execute(query)
        request = result.scalar_one_or_none()

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Заявка не найдена или уже обработана"
            )

        # Получаем данные отправителя
        if request.sender_type == EntityType.USER:
            sender_query = select(User).where(User.id == request.sender_id)
        else:
            sender_query = select(Mentor).where(Mentor.id == request.sender_id)
        
        sender_result = await session.execute(sender_query)
        sender = sender_result.scalar_one_or_none()

        if not sender:
            raise HTTPException(
                status_code=404,
                detail="Отправитель не найден"
            )

        # Обновляем статус заявки
        request.status = RequestStatus.ACCEPTED
        await session.commit()
        
        return {
            "message": "Заявка успешно подтверждена",
            "contact_info": {
                "email": sender.email,
                "telegram_link": sender.telegram_link
            }
        }


@router.post("/reject/{request_id}")
async def reject_request(
    request_id: int,
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """
    Отклонить полученную заявку.
    
    - Пользователь может отклонить заявку от ментора
    - Ментор может отклонить заявку от пользователя
    - Можно отклонить только заявки в статусе "в ожидании"
    """
    # Определяем тип получателя
    receiver_type = EntityType.USER if isinstance(current_user, User) else EntityType.MENTOR

    async with session_scope() as session:
        # Получаем заявку
        query = select(Request).where(
            and_(
                Request.id == request_id,
                Request.receiver_id == current_user.id,
                Request.receiver_type == receiver_type,
                Request.status == RequestStatus.PENDING
            )
        )
        result = await session.execute(query)
        request = result.scalar_one_or_none()

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Заявка не найдена или уже обработана"
            )

        # Обновляем статус заявки
        request.status = RequestStatus.REJECTED
        await session.commit()
        
        return {"message": "Заявка успешно отклонена"} 