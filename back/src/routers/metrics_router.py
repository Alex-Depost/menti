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
        
        # # Метрики запросов
        # self.total_requests = 0
        # self.mentor_requests = 0
        # self.student_requests = 0
        # self.accepted_requests = 0
        # self.rejected_requests = 0
        
        # Дополнительные бизнес метрики
        self.active_mentors = 0  # Активные менторы (имеют хотя бы одного ученика)
        self.active_students = 0  # Активные ученики (имеют ментора)
        self.avg_students_per_mentor = 0.0  # Среднее количество учеников на ментора
        self.successful_matches = 0  # Успешные пары ментор-ученик
        self.mentor_satisfaction = 0.0  # Средняя оценка удовлетворенности менторов
        self.student_satisfaction = 0.0  # Средняя оценка удовлетворенности учеников
        self.completed_sessions = 0  # Завершенные сессии менторства
        self.total_mentoring_hours = 0  # Общее количество часов менторства
        
        # Метрики интересности
        self.avg_mentor_interest = 0.0  # Средняя оценка интересности менторов
        self.avg_student_interest = 0.0  # Средняя оценка интересности учеников
        self.high_interest_mentors = 0  # Количество менторов с высокой оценкой интересности (>0.8)
        self.low_interest_mentors = 0  # Количество менторов с низкой оценкой интересности (<0.2)


metrics = Metrics()


@router.get("/", response_class=Response)
async def get_business_metrics():
    """
    Эндпоинт для получения бизнес-метрик в формате OpenMetrics. 
    Служебный endpoint, используется для мониторинга.
    """
    # Получаем данные из репозиториев
    _, total_mentors = await get_mentors(page=1, size=1)
    _, total_students = await get_users(page=1, size=1)

    # # Получаем статистику по запросам
    # requests_stats = await get_requests_stats()
    # metrics.total_requests = requests_stats["total"]
    # metrics.mentor_requests = requests_stats["from_mentors"]
    # metrics.student_requests = requests_stats["from_students"]
    # metrics.accepted_requests = requests_stats["accepted"]
    # metrics.rejected_requests = requests_stats["rejected"]

    # Получаем статистику по активным пользователям и матчам
    matches_stats = await get_matches_stats()
    metrics.active_mentors = matches_stats["active_mentors"]
    metrics.active_students = matches_stats["active_students"]
    metrics.avg_students_per_mentor = matches_stats["avg_students_per_mentor"]
    metrics.successful_matches = matches_stats["successful_matches"]

    # Получаем статистику по сессиям
    sessions_stats = await get_sessions_stats()
    metrics.completed_sessions = sessions_stats["completed"]
    metrics.total_mentoring_hours = sessions_stats["total_hours"]

    # Получаем статистику по удовлетворенности
    satisfaction_stats = await get_satisfaction_stats()
    metrics.mentor_satisfaction = satisfaction_stats["mentor_avg"]
    metrics.student_satisfaction = satisfaction_stats["student_avg"]

    # Получаем статистику по интересности
    # interest_stats = await get_interest_stats()
    # metrics.avg_mentor_interest = interest_stats["mentor_avg"]
    # metrics.avg_student_interest = interest_stats["student_avg"]
    # metrics.high_interest_mentors = interest_stats["high_interest_mentors"]
    # metrics.low_interest_mentors = interest_stats["low_interest_mentors"]

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
        
        # Метрики запросов
        # "# HELP total_requests Общее количество запросов на менторство",
        # "# TYPE total_requests counter",
        # f"total_requests {metrics.total_requests}",
        # "# HELP mentor_requests Количество запросов от менторов",
        # "# TYPE mentor_requests counter",
        # f"mentor_requests {metrics.mentor_requests}",
        # "# HELP student_requests Количество запросов от учеников",
        # "# TYPE student_requests counter",
        # f"student_requests {metrics.student_requests}",
        # "# HELP accepted_requests Количество принятых запросов",
        # "# TYPE accepted_requests counter",
        # f"accepted_requests {metrics.accepted_requests}",
        # "# HELP rejected_requests Количество отклоненных запросов",
        # "# TYPE rejected_requests counter",
        # f"rejected_requests {metrics.rejected_requests}",
        
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
        "# HELP mentor_satisfaction Средняя оценка удовлетворенности менторов",
        "# TYPE mentor_satisfaction gauge",
        f"mentor_satisfaction {metrics.mentor_satisfaction}",
        "# HELP student_satisfaction Средняя оценка удовлетворенности учеников",
        "# TYPE student_satisfaction gauge",
        f"student_satisfaction {metrics.student_satisfaction}",
        "# HELP completed_sessions Количество завершенных сессий менторства",
        "# TYPE completed_sessions counter",
        f"completed_sessions {metrics.completed_sessions}",
        "# HELP total_mentoring_hours Общее количество часов менторства",
        "# TYPE total_mentoring_hours counter",
        f"total_mentoring_hours {metrics.total_mentoring_hours}",
        
        # Метрики интересности
        # "# HELP avg_mentor_interest Средняя оценка интересности менторов",
        # "# TYPE avg_mentor_interest gauge",
        # f"avg_mentor_interest {metrics.avg_mentor_interest}",
        # "# HELP avg_student_interest Средняя оценка интересности учеников",
        # "# TYPE avg_student_interest gauge",
        # f"avg_student_interest {metrics.avg_student_interest}",
        # "# HELP high_interest_mentors Количество менторов с высокой оценкой интересности",
        # "# TYPE high_interest_mentors gauge",
        # f"high_interest_mentors {metrics.high_interest_mentors}",
        # "# HELP low_interest_mentors Количество менторов с низкой оценкой интересности",
        # "# TYPE low_interest_mentors gauge",
        # f"low_interest_mentors {metrics.low_interest_mentors}",
    ]

    # Возвращаем метрики в формате Prometheus
    return Response(content="\n".join(prometheus_metrics), media_type="text/plain")
