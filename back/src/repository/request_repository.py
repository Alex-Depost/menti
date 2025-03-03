# from src.database import get_db

# async def get_requests_stats():
#     """
#     Получение статистики по запросам на менторство
#     """
#     async with get_db() as db:
#         # Общее количество запросов
#         total = await db.fetch_val(
#             "SELECT COUNT(*) FROM requests"
#         )
        
#         # Запросы от менторов
#         from_mentors = await db.fetch_val(
#             "SELECT COUNT(*) FROM requests WHERE initiator_type = 'mentor'"
#         )
        
#         # Запросы от учеников
#         from_students = await db.fetch_val(
#             "SELECT COUNT(*) FROM requests WHERE initiator_type = 'student'"
#         )
        
#         # Принятые запросы
#         accepted = await db.fetch_val(
#             "SELECT COUNT(*) FROM requests WHERE status = 'accepted'"
#         )
        
#         # Отклоненные запросы
#         rejected = await db.fetch_val(
#             "SELECT COUNT(*) FROM requests WHERE status = 'rejected'"
#         )
        
#         return {
#             "total": total,
#             "from_mentors": from_mentors,
#             "from_students": from_students,
#             "accepted": accepted,
#             "rejected": rejected
#         } 