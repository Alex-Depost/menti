from fastapi import APIRouter, Response

from src.repository.mentor_repository import get_mentors
from src.repository.user_repository import get_users
# from src.repository.request_repository import get_requests_stats
# from src.repository.match_repository import get_matches_stats
# from src.repository.session_repository import get_sessions_stats
# from src.repository.satisfaction_repository import get_satisfaction_stats
# from src.repository.interest_repository import get_interest_stats

router = APIRouter(prefix="/metrics", tags=["metrics"])


# Хранилище для метрик
class Metrics:
    def __init__(self):
        # Базовые метрики пользователей
        self.mentors_count = 0
        self.students_count = 0
        
        # Дополнительные бизнес метрики
        self.active_mentors = 0  # Активные менторы (имеют хотя бы одного ученика)
        self.active_students = 0  # Активные ученики (имеют ментора)
        self.avg_students_per_mentor = 0.0  # Среднее количество учеников на ментора
        self.successful_matches = 0  # Успешные пары ментор-ученик


metrics = Metrics()


@router.get("/", response_class=Response, include_in_schema=False)
async def get_business_metrics():
    """ 
    Служебный endpoint для prometheus, используется для получения метрик в формате OpenMetrics.
    Работает только изнутри.
    """
    # Получаем данные из репозиториев
    _, total_mentors = await get_mentors(page=1, size=1)
    _, total_students = await get_users(page=1, size=1)

    # Обновляем значения базовых метрик
    metrics.mentors_count = total_mentors
    metrics.students_count = total_students

    # Формируем метрики в текстовом формате Prometheus
    prometheus_metrics = [
        # Базовые метрики пользователей
        "# HELP mentors_count Количество менторов в системе",
        "# TYPE mentors_count gauge",
        f"mentors_count {metrics.mentors_count}",
        "# HELP students_count Количество школьников в системе",
        "# TYPE students_count gauge",
        f"students_count {metrics.students_count}",
        
        # Дополнительные бизнес метрики
        "# HELP active_mentors Количество активных менторов",
        "# TYPE active_mentors gauge",
        f"active_mentors {metrics.active_mentors}",
        "# HELP active_students Количество активных учеников",
        "# TYPE active_students gauge",
        f"active_students {metrics.active_students}",
        "# HELP avg_students_per_mentor Среднее количество учеников на ментора",
        "# TYPE avg_students_per_mentor gauge",
        f"avg_students_per_mentor {metrics.avg_students_per_mentor}",
        "# HELP successful_matches Количество успешных пар ментор-ученик",
        "# TYPE successful_matches counter",
        f"successful_matches {metrics.successful_matches}",
        
    ]

    # Возвращаем метрики в формате Prometheus
    return Response(content="\n".join(prometheus_metrics), media_type="text/plain")
