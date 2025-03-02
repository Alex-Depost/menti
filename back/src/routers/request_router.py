from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.base import session_scope
from src.data.models import Request, RequestStatus, EntityType, User, Mentor
from src.schemas.request_schemas import RequestCreate, RequestResponse
from src.security.auth import get_current_user, get_current_mentor


async def get_current_user_or_mentor(
    user: User = Depends(get_current_user, use_cache=True),
    mentor: Mentor = Depends(get_current_mentor, use_cache=True)
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
    """Отправить заявку."""
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


@router.get("/sent", response_model=List[RequestResponse])
async def get_sent_requests(
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """Получить отправленные заявки."""
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
        return list(requests)


@router.get("/got", response_model=List[RequestResponse])
async def get_received_requests(
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """Получить полученные заявки."""
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
        return list(requests)


@router.post("/approve/{request_id}")
async def approve_request(
    request_id: int,
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """Подтвердить заявку."""
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
        request.status = RequestStatus.ACCEPTED
        await session.commit()
        
        return {"message": "Заявка успешно подтверждена"}


@router.post("/reject/{request_id}")
async def reject_request(
    request_id: int,
    current_user: Union[User, Mentor] = Depends(get_current_user_or_mentor),
):
    """Отклонить заявку."""
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