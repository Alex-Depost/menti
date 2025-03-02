from fastapi import APIRouter, Response
from prometheus_client import Gauge, generate_latest, CONTENT_TYPE_LATEST
from src.repository.mentor_repository import get_mentors
from src.repository.user_repository import get_users

router = APIRouter()

# Создаем метрики-гейджи
mentors_count = Gauge('mentors_count', 'Количество менторов в системе')
students_count = Gauge('students_count', 'Количество школьников в системе')

@router.get("/", response_class=Response)
async def get_business_metrics():
    """
    Эндпоинт для получения бизнес-метрик в формате Prometheus:
    - количество менторов
    - количество школьников
    """
    # Получаем данные из репозиториев
    _, total_mentors = await get_mentors(page=1, size=1)
    _, total_students = await get_users(page=1, size=1)
    
    # Обновляем значения метрик
    mentors_count.set(total_mentors)
    students_count.set(total_students)
    
    # Возвращаем метрики в формате Prometheus
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )
