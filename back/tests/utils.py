"""
Модуль с утилитами для тестирования API с помощью Tavern.
"""
from typing import Dict, Any, List


def verify_mentor_feed(response: Dict[str, Any]) -> None:
    """
    Проверяет структуру ответа API для списка менторов.
    
    Args:
        response: Ответ API в виде словаря
    
    Raises:
        AssertionError: Если ответ не соответствует ожидаемой структуре
    """
    assert "total" in response, "Ответ не содержит поле 'total'"
    assert isinstance(response["total"], int), "Поле 'total' не является целым числом"
    
    assert "items" in response, "Ответ не содержит поле 'items'"
    assert isinstance(response["items"], list), "Поле 'items' не является списком"
    
    if response["items"]:
        mentor = response["items"][0]
        assert "id" in mentor, "Ментор не содержит поле 'id'"
        assert "name" in mentor, "Ментор не содержит поле 'name'"
        assert "description" in mentor, "Ментор не содержит поле 'description'"
        assert "universities" in mentor, "Ментор не содержит поле 'universities'"
        assert "faculty" in mentor, "Ментор не содержит поле 'faculty'"


def verify_user_feed(response: Dict[str, Any]) -> None:
    """
    Проверяет структуру ответа API для списка пользователей.
    
    Args:
        response: Ответ API в виде словаря
    
    Raises:
        AssertionError: Если ответ не соответствует ожидаемой структуре
    """
    assert "total" in response, "Ответ не содержит поле 'total'"
    assert isinstance(response["total"], int), "Поле 'total' не является целым числом"
    
    assert "items" in response, "Ответ не содержит поле 'items'"
    assert isinstance(response["items"], list), "Поле 'items' не является списком"
    
    if response["items"]:
        user = response["items"][0]
        assert "id" in user, "Пользователь не содержит поле 'id'"
        assert "login" in user, "Пользователь не содержит поле 'login'"
        assert "name" in user, "Пользователь не содержит поле 'name'"
        assert "description" in user, "Пользователь не содержит поле 'description'"
        assert "target_universities" in user, "Пользователь не содержит поле 'target_universities'"
        assert isinstance(user["target_universities"], list), "Поле 'target_universities' не является списком"


def verify_request_list(response: Dict[str, Any]) -> None:
    """
    Проверяет структуру ответа API для списка запросов.
    
    Args:
        response: Ответ API в виде словаря
    
    Raises:
        AssertionError: Если ответ не соответствует ожидаемой структуре
    """
    assert isinstance(response, list), "Ответ не является списком"
    
    if response:
        request = response[0]
        assert "id" in request, "Запрос не содержит поле 'id'"
        assert "status" in request, "Запрос не содержит поле 'status'"
        assert "message" in request, "Запрос не содержит поле 'message'"
        assert "created_at" in request, "Запрос не содержит поле 'created_at'"
        
        # Проверка поля статуса
        valid_statuses = ["PENDING", "APPROVED", "REJECTED"]
        assert request["status"] in valid_statuses, f"Неверный статус запроса: {request['status']}" 