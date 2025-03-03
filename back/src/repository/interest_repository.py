# from src.database import get_db
# from src.services.interest_rating import InterestRatingService

# interest_service = InterestRatingService()

# async def get_interest_stats():
#     """
#     Получение статистики по интересности пользователей
#     """
#     async with get_db() as db:
#         # Получаем всех менторов с описаниями
#         mentors = await db.fetch_all(
#             """
#             SELECT id, description 
#             FROM mentors 
#             WHERE description IS NOT NULL
#             """
#         )
        
#         # Получаем всех пользователей с описаниями
#         users = await db.fetch_all(
#             """
#             SELECT id, description 
#             FROM users 
#             WHERE description IS NOT NULL
#             """
#         )
        
#         # Для каждого пользователя получаем ранжированный список менторов
#         total_high_interest = 0  # Количество менторов с высоким рангом
#         total_low_interest = 0   # Количество менторов с низким рангом
        
#         for user in users:
#             ranked_mentors = interest_service.get_ranked_mentors(
#                 mentors=[dict(m) for m in mentors],
#                 user_description=user["description"]
#             )
            
#             # Считаем менторов в топ 20% и нижних 20% по интересности
#             mentor_count = len(ranked_mentors)
#             if mentor_count > 0:
#                 top_threshold = int(mentor_count * 0.2)
#                 total_high_interest += len(ranked_mentors[:top_threshold])
#                 total_low_interest += len(ranked_mentors[-top_threshold:])
        
#         # Вычисляем средние значения
#         user_count = len(users)
#         if user_count > 0:
#             avg_high_interest = total_high_interest / user_count
#             avg_low_interest = total_low_interest / user_count
#         else:
#             avg_high_interest = 0
#             avg_low_interest = 0
            
#         return {
#             "mentor_avg": float(avg_high_interest),
#             "student_avg": 0.0,  # Больше не используется
#             "high_interest_mentors": int(avg_high_interest),
#             "low_interest_mentors": int(avg_low_interest)
#         } 