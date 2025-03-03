import os
import json
import httpx
from typing import List, Dict, Any

class InterestRatingService:
    """Сервис для ранжирования менторов и пользователей по интересности на основе их описаний."""
    
    def __init__(self):
        # Получаем API ключ из переменной окружения или используем значение по умолчанию
        self.api_key = os.getenv("GEMINI_API_KEY", "sk-9c33e1ecb15640c8b060fe63eeaea71c")
        self.api_url = "https://chat.batsura.ru/api/chat/completions"
        
    async def get_ranked_mentors(self, mentors: List[Dict[str, Any]], user_description: str) -> List[str]:
        """
        Сортирует менторов по убыванию их интересности для пользователя.
        
        Args:
            mentors: Список словарей с информацией о менторах, каждый словарь содержит id и description
            user_description: Описание пользователя
            
        Returns:
            Список id менторов, отсортированный по убыванию интересности
        """
        if not mentors or not user_description:
            return [mentor["id"] for mentor in mentors]  # Возвращаем оригинальный порядок, если нет данных
            
        # Формируем описания менторов для промпта
        mentors_descriptions = "\n".join([
            f"ID: {mentor['id']}, Описание: {mentor['description'] or 'Нет описания'}" 
            for mentor in mentors
        ])
        
        # Формируем промпт
        prompt = f"""
Ответь в формате массива json, содержашего только id. Отсортируй менторов по убыванию их интересности для пользователя. 

Описание пользователя:
{user_description}

Описания менторов:
{mentors_descriptions}
"""
        
        try:
            # Отправляем запрос к API
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "model": "qodo/gemini-2.0-flash",
                        "messages": [
                            {"role": "system", "content": "Ты помогаешь сортировать менторов по их интересности для пользователя на основе описаний."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7
                    }
                )
                
                # Проверяем успешность запроса
                response.raise_for_status()
                data = response.json()
                
                # Извлекаем результат
                result_text = data["choices"][0]["message"]["content"]
                
                # Пытаемся распарсить JSON
                result_text = result_text.replace("```json", "").replace("```", "")
                try:
                    ranked_ids = json.loads(result_text)
                    # Проверяем, что результат - список
                    if isinstance(ranked_ids, list):
                        return ranked_ids
                except (json.JSONDecodeError, ValueError):
                    # Если не удалось распарсить JSON, пытаемся извлечь ID другими способами
                    import re
                    # Ищем что-то похожее на список ID в тексте
                    matches = re.findall(r'\[(.*?)\]', result_text)
                    if matches:
                        # Берем первое совпадение и разбиваем по запятой
                        items = matches[0].split(',')
                        # Очищаем элементы от лишних символов
                        cleaned_ids = [item.strip(' "\'\t\n') for item in items]
                        # Возвращаем только непустые элементы
                        return [item for item in cleaned_ids if item]
            
            # Если не удалось получить ранжированный список, возвращаем исходный порядок
            return [mentor["id"] for mentor in mentors]
                
        except Exception as e:
            # В случае ошибки логируем ее и возвращаем исходный порядок
            print(f"Error ranking mentors: {str(e)}")
            return [mentor["id"] for mentor in mentors]
            
    async def get_ranked_users(self, users: List[Dict[str, Any]], mentor_description: str) -> List[str]:
        """
        Сортирует пользователей по убыванию их интересности для ментора.
        
        Args:
            users: Список словарей с информацией о пользователях, каждый словарь содержит id и description
            mentor_description: Описание ментора
            
        Returns:
            Список id пользователей, отсортированный по убыванию интересности
        """
        # Функционально идентичен get_ranked_mentors, но с другими названиями в промпте
        if not users or not mentor_description:
            return [user["id"] for user in users]
            
        users_descriptions = "\n".join([
            f"ID: {user['id']}, Описание: {user['description'] or 'Нет описания'}" 
            for user in users
        ])
        
        prompt = f"""
Ответь в формате массива json, содержашего только id. Отсортируй пользователей по убыванию их интересности для ментора. 

Описание ментора:
{mentor_description}

Описания пользователей:
{users_descriptions}
"""
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "model": "qodo/gemini-2.0-flash",
                        "messages": [
                            {"role": "system", "content": "Ты помогаешь сортировать пользователей по их интересности для ментора на основе описаний."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7
                    }
                )
                
                response.raise_for_status()
                data = response.json()
                result_text = data["choices"][0]["message"]["content"]
                result_text = result_text.replace("```json", "").replace("```", "")

                try:
                    ranked_ids = json.loads(result_text)
                    if isinstance(ranked_ids, list):
                        return ranked_ids
                except (json.JSONDecodeError, ValueError):
                    import re
                    matches = re.findall(r'\[(.*?)\]', result_text)
                    if matches:
                        items = matches[0].split(',')
                        cleaned_ids = [item.strip(' "\'\t\n') for item in items]
                        return [item for item in cleaned_ids if item]
            
            return [user["id"] for user in users]
                
        except Exception as e:
            print(f"Error ranking users: {str(e)}")
            return [user["id"] for user in users] 