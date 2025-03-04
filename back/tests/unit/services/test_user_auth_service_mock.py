import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from src.services.user_auth_service import (
    generate_unique_login,
    register_user,
    authenticate_user,
    update_user_profile_service
)
from src.schemas.schemas import UserCreationSchema, UserUpdateSchema

# Create a proper async context manager mock
class AsyncContextManagerMock:
    def __init__(self, mock_session):
        self.mock_session = mock_session

    async def __aenter__(self):
        return self.mock_session

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

@pytest.fixture
def mock_session():
    session = AsyncMock()
    
    # Set up default behavior for common methods
    mock_result = AsyncMock()
    mock_result.scalars.return_value.first.return_value = MagicMock()
    
    session.execute.return_value = mock_result
    
    return session

@pytest.fixture
def mock_session_scope(mock_session):
    with patch('src.repository.user_repository.session_scope') as mock_scope:
        # Return our async context manager that yields the mock session
        mock_scope.return_value = AsyncContextManagerMock(mock_session)
        yield mock_session

# Mock the database-related functions to avoid actual database connections
@pytest.fixture(autouse=True)
def mock_db_functions(mock_session_scope):
    with patch('src.repository.user_repository.get_user_by_login', new_callable=AsyncMock) as mock_get_login, \
         patch('src.repository.user_repository.get_user_by_email', new_callable=AsyncMock) as mock_get_email, \
         patch('src.repository.user_repository.create_user', new_callable=AsyncMock) as mock_create, \
         patch('src.repository.user_repository.update_user_profile', new_callable=AsyncMock) as mock_update:
        
        # Default behavior
        mock_get_login.return_value = None
        mock_get_email.return_value = None
        mock_create.return_value = None
        mock_update.return_value = MagicMock()
        
        yield {
            'get_login': mock_get_login,
            'get_email': mock_get_email,
            'create_user': mock_create,
            'update_profile': mock_update
        }

# Override the password validator for testing
@pytest.fixture(autouse=True)
def mock_password_validator():
    with patch('src.schemas.schemas.UserUpdateSchema.password_complexity') as mock_validator:
        mock_validator.return_value = True
        yield mock_validator

@pytest.mark.asyncio
async def test_generate_unique_login_english():
    with patch('src.repository.user_repository.get_user_by_login', new_callable=AsyncMock) as mock_get_user:
        mock_get_user.return_value = None
        
        result = await generate_unique_login("John Doe")
        
        assert result == "john_doe"
        mock_get_user.assert_called_once_with("john_doe")

@pytest.mark.asyncio
async def test_generate_unique_login_russian():
    with patch('src.repository.user_repository.get_user_by_login', new_callable=AsyncMock) as mock_get_user:
        mock_get_user.return_value = None
        
        result = await generate_unique_login("Иван Иванов")
        
        assert result == "ivan_ivanov"
        mock_get_user.assert_called_once_with("ivan_ivanov")

@pytest.mark.asyncio
async def test_generate_unique_login_with_counter():
    with patch('src.repository.user_repository.get_user_by_login', new_callable=AsyncMock) as mock_get_user:
        mock_get_user.side_effect = [MagicMock(), None]
        
        result = await generate_unique_login("John Doe")
        
        assert result == "john_doe1"
        assert mock_get_user.call_count == 2
        mock_get_user.assert_any_call("john_doe")
        mock_get_user.assert_any_call("john_doe1")

@pytest.mark.asyncio
async def test_register_user_success():
    user_data = UserCreationSchema(name="Test User", password="password123")
    
    with patch('src.services.user_auth_service.generate_unique_login', new_callable=AsyncMock) as mock_generate_login, \
         patch('src.services.user_auth_service.get_password_hash') as mock_hash, \
         patch('src.repository.user_repository.create_user', new_callable=AsyncMock) as mock_create, \
         patch('src.repository.user_repository.get_user_by_login', new_callable=AsyncMock) as mock_get, \
         patch('src.services.user_auth_service.create_access_token') as mock_token:
        
        mock_generate_login.return_value = "test_user"
        mock_hash.return_value = "hashed_password"
        mock_create.return_value = None
        mock_get.return_value = MagicMock()
        mock_token.return_value = "test_token"
        
        result = await register_user(user_data)
        
        assert result == {"access_token": "test_token", "token_type": "bearer"}
        mock_generate_login.assert_called_once_with("Test User")
        mock_hash.assert_called_once_with("password123")
        mock_create.assert_called_once()
        mock_get.assert_called_once_with("test_user")
        mock_token.assert_called_once()

@pytest.mark.asyncio
async def test_register_user_failure():
    user_data = UserCreationSchema(name="Test User", password="password123")
    
    with patch('src.services.user_auth_service.generate_unique_login', new_callable=AsyncMock) as mock_generate_login, \
         patch('src.services.user_auth_service.get_password_hash') as mock_hash, \
         patch('src.repository.user_repository.create_user', new_callable=AsyncMock) as mock_create:
        
        mock_generate_login.return_value = "test_user"
        mock_hash.return_value = "hashed_password"
        # Use IntegrityError instead of generic Exception to match what's caught in the service
        mock_create.side_effect = IntegrityError("statement", "params", "orig")
        
        with pytest.raises(HTTPException) as exc_info:
            await register_user(user_data)
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Registration failed"

@pytest.mark.asyncio
async def test_authenticate_user_success():
    with patch('src.repository.user_repository.get_user_by_login', new_callable=AsyncMock) as mock_get_user, \
         patch('src.services.user_auth_service.verify_password') as mock_verify, \
         patch('src.services.user_auth_service.create_access_token') as mock_token:
        
        mock_user = MagicMock()
        mock_user.login = "test_user"
        mock_user.password_hash = "hashed_password"
        
        mock_get_user.return_value = mock_user
        mock_verify.return_value = True
        mock_token.return_value = "test_token"
        
        result = await authenticate_user("test_user", "password123")
        
        assert result == {"access_token": "test_token", "token_type": "bearer"}
        mock_get_user.assert_called_once_with("test_user")
        mock_verify.assert_called_once_with("password123", "hashed_password")
        mock_token.assert_called_once()

@pytest.mark.asyncio
async def test_authenticate_user_invalid_login():
    with patch('src.repository.user_repository.get_user_by_login', new_callable=AsyncMock) as mock_get_user:
        mock_get_user.return_value = None
        
        result = await authenticate_user("invalid_user", "password123")
        
        assert result is False
        mock_get_user.assert_called_once_with("invalid_user")

@pytest.mark.asyncio
async def test_authenticate_user_invalid_password():
    with patch('src.repository.user_repository.get_user_by_login', new_callable=AsyncMock) as mock_get_user, \
         patch('src.services.user_auth_service.verify_password') as mock_verify:
        
        mock_user = MagicMock()
        mock_user.login = "test_user"
        mock_user.password_hash = "hashed_password"
        
        mock_get_user.return_value = mock_user
        mock_verify.return_value = False
        
        result = await authenticate_user("test_user", "wrong_password")
        
        assert result is False
        mock_get_user.assert_called_once_with("test_user")
        mock_verify.assert_called_once_with("wrong_password", "hashed_password")

@pytest.mark.asyncio
async def test_update_user_profile_success():
    user_id = 1
    update_data = UserUpdateSchema(name="Updated Name", email="updated@example.com")
    
    with patch('src.repository.user_repository.update_user_profile', new_callable=AsyncMock) as mock_update, \
         patch('src.repository.user_repository.get_user_by_email', new_callable=AsyncMock) as mock_get_by_email:
        
        mock_updated_user = MagicMock()
        mock_updated_user.name = "Updated Name"
        mock_updated_user.email = "updated@example.com"
        
        mock_get_by_email.return_value = None
        mock_update.return_value = mock_updated_user
        
        result = await update_user_profile_service(user_id, update_data)
        
        assert result == mock_updated_user
        mock_update.assert_called_once()

@pytest.mark.asyncio
async def test_update_user_profile_with_password():
    user_id = 1
    # Use a password that meets the complexity requirements
    update_data = UserUpdateSchema(password="newPassword123!")
    
    with patch('src.repository.user_repository.update_user_profile', new_callable=AsyncMock) as mock_update, \
         patch('src.services.user_auth_service.get_password_hash') as mock_hash, \
         patch('src.schemas.schemas.UserUpdateSchema.password_complexity', return_value=True):
        
        mock_hash.return_value = "new_hashed_password"
        mock_updated_user = MagicMock()
        mock_update.return_value = mock_updated_user
        
        result = await update_user_profile_service(user_id, update_data)
        
        assert result == mock_updated_user
        mock_hash.assert_called_once_with("newPassword123!")
        mock_update.assert_called_once()
        update_dict = mock_update.call_args[0][1]
        assert "password" not in update_dict
        assert update_dict["password_hash"] == "new_hashed_password"

@pytest.mark.asyncio
async def test_update_user_profile_user_not_found():
    user_id = 999
    update_data = UserUpdateSchema(name="Updated Name")
    
    with patch('src.repository.user_repository.update_user_profile', new_callable=AsyncMock) as mock_update:
        mock_update.return_value = None
        
        with pytest.raises(HTTPException) as exc_info:
            await update_user_profile_service(user_id, update_data)
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Пользователь не найден"
        mock_update.assert_called_once()

@pytest.mark.asyncio
async def test_update_user_profile_email_conflict():
    user_id = 1
    update_data = UserUpdateSchema(email="existing@example.com")
    
    with patch('src.repository.user_repository.get_user_by_email', new_callable=AsyncMock) as mock_get_by_email:
        existing_user = MagicMock()
        existing_user.id = 2  # Different user ID
        
        mock_get_by_email.return_value = existing_user
        
        with pytest.raises(HTTPException) as exc_info:
            await update_user_profile_service(user_id, update_data)
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email уже используется другим пользователем"
        mock_get_by_email.assert_called_once_with("existing@example.com")