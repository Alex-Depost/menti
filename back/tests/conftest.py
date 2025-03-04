import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.fixture
def mock_session():
    session = AsyncMock(spec=AsyncSession)
    return session

@pytest.fixture
def mock_session_scope():
    class MockContextManager:
        def __init__(self, session):
            self.session = session

        async def __aenter__(self):
            return self.session

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

    session = AsyncMock(spec=AsyncSession)
    context_manager = MockContextManager(session)
    
    with patch('src.data.base.session_scope', return_value=context_manager):
        yield session

@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = 1
    user.name = "Test User"
    user.login = "test_user"
    user.password_hash = "$2b$12$example_hash"
    user.email = "test@example.com"
    user.is_active = True
    user.avatar_uuid = None
    return user

@pytest.fixture
def mock_mentor():
    mentor = MagicMock()
    mentor.id = 1
    mentor.name = "Test Mentor"
    mentor.login = "test_mentor"
    mentor.password_hash = "$2b$12$example_hash"
    mentor.email = "mentor@example.com"
    mentor.is_active = True
    mentor.avatar_uuid = None
    return mentor