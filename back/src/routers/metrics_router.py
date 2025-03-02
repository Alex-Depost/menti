from fastapi import APIRouter, Response, Depends
from src.repositories.mentors_repository import get_mentors
from src.repositories.users_repository import get_users

router = APIRouter(prefix="/metrics", tags=["metrics"])

# Хранилище для метрик
class Metrics:
    def __init__(self):
        self.mentors_count = 0
        self.students_count = 0

metrics = Metrics()

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
    metrics.mentors_count = total_mentors
    metrics.students_count = total_students
    
    # Формируем метрики в текстовом формате Prometheus
    prometheus_metrics = [
        "# HELP mentors_count Количество менторов в системе",
        "# TYPE mentors_count gauge",
        f"mentors_count {metrics.mentors_count}",
        "# HELP students_count Количество школьников в системе",
        "# TYPE students_count gauge",
        f"students_count {metrics.students_count}"
    ]
    
    # Возвращаем метрики в формате Prometheus
    return Response(
        content="\n".join(prometheus_metrics),
        media_type="text/plain"
    )
