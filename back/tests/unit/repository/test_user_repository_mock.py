import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from src.repository.user_repository import (
    create_user,
    update_user_avatar,
    get_user_by_email,
    get_user_by_login,
    update_user_profile,
    get_users,
    get_filtered_users,
)


# Create a proper async context manager
class AsyncContextManager:
    def __init__(self, session):
        self.session = session

    async def __aenter__(self):
        return self.session

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass


@pytest.fixture
def mock_db_session():
    session = AsyncMock()
    return session


@pytest.mark.asyncio
async def test_create_user(mock_db_session):
    user_data = MagicMock()
    user_data.name = "Test User"
    user_data.login = "test_user"
    user_data.password_hash = "hashed_password"

    mock_created_user = MagicMock()

    # Create a context manager that returns our mock session
    async_context = AsyncContextManager(mock_db_session)

    # Patch the session_scope to return our context manager
    with patch(
        "src.repository.user_repository.session_scope", return_value=async_context
    ), patch(
        "src.repository.user_repository.get_user_by_login",
        return_value=mock_created_user,
    ):
        result = await create_user(user_data)

        assert result == mock_created_user
        mock_db_session.execute.assert_called_once()
        mock_db_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_update_user_avatar():
    mock_db = AsyncMock()
    user_id = 1
    avatar_uuid = uuid.uuid4()

    await update_user_avatar(mock_db, user_id, avatar_uuid)

    mock_db.execute.assert_called_once()
    mock_db.commit.assert_called_once()
