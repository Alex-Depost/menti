# from src.database import get_db

# async def get_matches_stats():
#     """
#     Получение статистики по матчам менторов и учеников
#     """
#     async with get_db() as db:
#         # Активные менторы (имеют хотя бы одного ученика)
#         active_mentors = await db.fetch_val(
#             """
#             SELECT COUNT(DISTINCT mentor_id) 
#             FROM matches 
#             WHERE status = 'active'
#             """
#         )
        
#         # Активные ученики (имеют ментора)
#         active_students = await db.fetch_val(
#             """
#             SELECT COUNT(DISTINCT student_id) 
#             FROM matches 
#             WHERE status = 'active'
#             """
#         )
        
#         # Среднее количество учеников на ментора
#         avg_students = await db.fetch_val(
#             """
#             SELECT COALESCE(AVG(student_count), 0)
#             FROM (
#                 SELECT mentor_id, COUNT(student_id) as student_count
#                 FROM matches
#                 WHERE status = 'active'
#                 GROUP BY mentor_id
#             ) as mentor_stats
#             """
#         )
        
#         # Успешные пары (завершили хотя бы одну сессию)
#         successful_matches = await db.fetch_val(
#             """
#             SELECT COUNT(DISTINCT match_id)
#             FROM sessions
#             WHERE status = 'completed'
#             """
#         )
        
#         return {
#             "active_mentors": active_mentors,
#             "active_students": active_students,
#             "avg_students_per_mentor": float(avg_students),
#             "successful_matches": successful_matches
#         } 