# from src.database import get_db

# async def get_sessions_stats():
#     """
#     Получение статистики по сессиям менторства
#     """
#     async with get_db() as db:
#         # Количество завершенных сессий
#         completed = await db.fetch_val(
#             """
#             SELECT COUNT(*) 
#             FROM sessions 
#             WHERE status = 'completed'
#             """
#         )
        
#         # Общее количество часов менторства
#         total_hours = await db.fetch_val(
#             """
#             SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600), 0)
#             FROM sessions 
#             WHERE status = 'completed'
#             """
#         )
        
#         return {
#             "completed": completed,
#             "total_hours": float(total_hours)
#         } 