# from src.database import get_db

# async def get_satisfaction_stats():
#     """
#     Получение статистики по удовлетворенности пользователей
#     """
#     async with get_db() as db:
#         # Средняя оценка от менторов
#         mentor_avg = await db.fetch_val(
#             """
#             SELECT COALESCE(AVG(rating), 0)
#             FROM feedback
#             WHERE rater_type = 'mentor'
#             """
#         )
        
#         # Средняя оценка от учеников
#         student_avg = await db.fetch_val(
#             """
#             SELECT COALESCE(AVG(rating), 0)
#             FROM feedback
#             WHERE rater_type = 'student'
#             """
#         )
        
#         return {
#             "mentor_avg": float(mentor_avg),
#             "student_avg": float(student_avg)
#         } 