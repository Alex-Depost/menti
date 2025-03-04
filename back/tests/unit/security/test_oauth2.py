import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException

from src.security.oauth2 import get_current_user, get_current_mentor
from src.schemas.schemas import UserDisplay, MentorDisplay


@pytest.mark.asyncio
async def test_get_current_user_no_token():
    result = await get_current_user(None)
    assert result is None


@pytest.mark.asyncio
async def test_get_current_user_valid_token():
    with patch("src.security.oauth2._get_current_user", new_callable=AsyncMock) as mock_get_user:
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.name = "Test User"
        mock_user.email = "test@example.com"
        mock_user.avatar_uuid = "avatar-uuid"
        mock_user.telegram_link = "https://t.me/test"
        mock_user.age = 25
        mock_user.is_active = True
        mock_user.created_at = "2023-01-01T12:00:00"
        mock_user.updated_at = "2023-01-02T12:00:00"
        mock_user.target_universities = ["University 1", "University 2"]
        mock_user.description = "Test description"
        mock_user.admission_type = "Test admission"
        
        mock_get_user.return_value = mock_user
        
        result = await get_current_user("valid_token")
        
        assert isinstance(result, UserDisplay)
        assert result.id == 1
        assert result.name == "Test User"
        assert result.email == "test@example.com"
        assert result.avatar_uuid == "avatar-uuid"
        assert result.telegram_link == "https://t.me/test"
        assert result.age == 25
        assert result.is_active is True
        assert result.created_at == "2023-01-01T12:00:00"
        assert result.updated_at == "2023-01-02T12:00:00"
        assert result.target_universities == ["University 1", "University 2"]
        assert result.description == "Test description"
        assert result.admission_type == "Test admission"
        
        mock_get_user.assert_called_once_with("valid_token")


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    with patch("src.security.oauth2._get_current_user", new_callable=AsyncMock) as mock_get_user:
        mock_get_user.side_effect = HTTPException(status_code=401, detail="Invalid token")
        
        result = await get_current_user("invalid_token")
        
        assert result is None
        mock_get_user.assert_called_once_with("invalid_token")


@pytest.mark.asyncio
async def test_get_current_mentor_no_token():
    result = await get_current_mentor(None)
    assert result is None


@pytest.mark.asyncio
async def test_get_current_mentor_valid_token():
    with patch("src.security.oauth2._get_current_mentor", new_callable=AsyncMock) as mock_get_mentor:
        mock_mentor = MagicMock()
        mock_mentor.id = 1
        mock_mentor.name = "Test Mentor"
        mock_mentor.login = "test_mentor"
        mock_mentor.email = "mentor@example.com"
        mock_mentor.avatar_uuid = "mentor-avatar-uuid"
        mock_mentor.telegram_link = "https://t.me/mentor"
        mock_mentor.age = 30
        mock_mentor.is_active = True
        mock_mentor.created_at = "2023-01-01T12:00:00"
        mock_mentor.updated_at = "2023-01-02T12:00:00"
        mock_mentor.description = "Mentor description"
        mock_mentor.university = "Test University"
        mock_mentor.title = "Professor"
        mock_mentor.free_days = ["Monday", "Wednesday"]
        mock_mentor.admission_type = "Mentor admission"
        
        mock_get_mentor.return_value = mock_mentor
        
        result = await get_current_mentor("valid_token")
        
        assert isinstance(result, MentorDisplay)
        assert result.id == 1
        assert result.name == "Test Mentor"
        assert result.login == "test_mentor"
        assert result.email == "mentor@example.com"
        assert result.avatar_uuid == "mentor-avatar-uuid"
        assert result.telegram_link == "https://t.me/mentor"
        assert result.age == 30
        assert result.is_active is True
        assert result.created_at == "2023-01-01T12:00:00"
        assert result.updated_at == "2023-01-02T12:00:00"
        assert result.description == "Mentor description"
        assert result.university == "Test University"
        assert result.title == "Professor"
        assert result.free_days == ["Monday", "Wednesday"]
        assert result.admission_type == "Mentor admission"
        
        mock_get_mentor.assert_called_once_with("valid_token")


@pytest.mark.asyncio
async def test_get_current_mentor_invalid_token():
    with patch("src.security.oauth2._get_current_mentor", new_callable=AsyncMock) as mock_get_mentor:
        mock_get_mentor.side_effect = HTTPException(status_code=401, detail="Invalid token")
        
        result = await get_current_mentor("invalid_token")
        
        assert result is None
        mock_get_mentor.assert_called_once_with("invalid_token")