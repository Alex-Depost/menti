import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from datetime import datetime

from src.main import app
from src.routers.user_auth_router import signup, signin, get_current_user_info, update_user_profile
from src.schemas.schemas import UserCreationSchema, UserLoginSchema, UserUpdateSchema, UserDisplay
from src.security.auth import get_current_user

# Create a mock user for authentication
@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = 1
    user.name = "Test User"
    user.login = "test_user"
    user.is_active = True
    user.avatar_uuid = None
    user.email = "test@example.com"
    user.created_at = datetime.now()
    user.updated_at = datetime.now()
    user.telegram_link = None
    user.age = None
    user.target_universities = None
    user.description = None
    user.admission_type = None
    return user

# Override the dependency in the app
@pytest.fixture
def test_client(mock_user):
    # Create a function that returns our mock user
    async def override_get_current_user():
        return mock_user
    
    # Override the dependency
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Create the test client
    client = TestClient(app)
    
    # Yield the client for the test to use
    yield client
    
    # Clean up after the test
    app.dependency_overrides = {}

@pytest.mark.asyncio
async def test_signup_success():
    user_data = UserCreationSchema(name="Test User", password="password123")
    
    with patch('src.routers.user_auth_router.register_user', new_callable=AsyncMock) as mock_register:
        mock_register.return_value = {"access_token": "test_token", "token_type": "bearer"}
        
        result = await signup(user_data)
        
        assert result == {"access_token": "test_token", "token_type": "bearer"}
        mock_register.assert_called_once_with(user_data)

@pytest.mark.asyncio
async def test_signup_failure():
    user_data = UserCreationSchema(name="Test User", password="password123")
    
    with patch('src.routers.user_auth_router.register_user', new_callable=AsyncMock) as mock_register:
        mock_register.return_value = None
        
        with pytest.raises(HTTPException) as exc_info:
            await signup(user_data)
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Registration failed"
        mock_register.assert_called_once_with(user_data)

@pytest.mark.asyncio
async def test_signin_success():
    user_data = UserLoginSchema(login="test_user", password="password123")
    
    with patch('src.routers.user_auth_router.authenticate_user', new_callable=AsyncMock) as mock_auth:
        mock_auth.return_value = {"access_token": "test_token", "token_type": "bearer"}
        
        result = await signin(user_data)
        
        assert result == {"access_token": "test_token", "token_type": "bearer"}
        mock_auth.assert_called_once_with("test_user", "password123")

@pytest.mark.asyncio
async def test_signin_failure():
    user_data = UserLoginSchema(login="test_user", password="wrong_password")
    
    with patch('src.routers.user_auth_router.authenticate_user', new_callable=AsyncMock) as mock_auth:
        mock_auth.return_value = False
        
        with pytest.raises(HTTPException) as exc_info:
            await signin(user_data)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Incorrect login or password"
        mock_auth.assert_called_once_with("test_user", "wrong_password")

@pytest.mark.asyncio
async def test_get_current_user_info():
    mock_request = MagicMock()
    mock_request.base_url = "http://testserver/"
    
    mock_user = MagicMock()
    mock_user.avatar_uuid = "test-uuid"
    
    with patch('src.routers.user_auth_router.UserDisplay.from_orm') as mock_from_orm:
        mock_user_display = MagicMock()
        mock_from_orm.return_value = mock_user_display
        
        result = await get_current_user_info(mock_request, mock_user)
        
        assert result == mock_user_display
        mock_from_orm.assert_called_once_with(mock_user)

@pytest.mark.asyncio
async def test_get_current_user_info_no_avatar():
    mock_request = MagicMock()
    mock_request.base_url = "http://testserver/"
    
    mock_user = MagicMock()
    mock_user.avatar_uuid = None
    
    with patch('src.routers.user_auth_router.UserDisplay.from_orm') as mock_from_orm:
        mock_user_display = MagicMock()
        mock_from_orm.return_value = mock_user_display
        
        result = await get_current_user_info(mock_request, mock_user)
        
        assert result == mock_user_display
        mock_from_orm.assert_called_once_with(mock_user)

@pytest.mark.asyncio
async def test_update_user_profile():
    update_data = UserUpdateSchema(name="Updated Name")
    
    mock_user = MagicMock()
    mock_user.id = 1
    
    with patch('src.routers.user_auth_router.update_user_profile_service', new_callable=AsyncMock) as mock_update:
        mock_updated_user = MagicMock()
        mock_update.return_value = mock_updated_user
        
        result = await update_user_profile(update_data, mock_user)
        
        assert result == mock_updated_user
        mock_update.assert_called_once_with(1, update_data)

def test_integration_signup(test_client):
    with patch('src.routers.user_auth_router.register_user', new_callable=AsyncMock) as mock_register:
        mock_register.return_value = {"access_token": "test_token", "token_type": "bearer"}
        
        response = test_client.post(
            "/auth/users/signup",
            json={"name": "Test User", "password": "password123"}
        )
        
        assert response.status_code == 201
        assert response.json() == {"access_token": "test_token", "token_type": "bearer"}

def test_integration_signin(test_client):
    with patch('src.routers.user_auth_router.authenticate_user', new_callable=AsyncMock) as mock_auth:
        mock_auth.return_value = {"access_token": "test_token", "token_type": "bearer"}
        
        response = test_client.post(
            "/auth/users/signin",
            json={"login": "test_user", "password": "password123"}
        )
        
        assert response.status_code == 200
        assert response.json() == {"access_token": "test_token", "token_type": "bearer"}

def test_integration_get_current_user_info(test_client, mock_user):
    with patch('src.routers.user_auth_router.UserDisplay.from_orm') as mock_from_orm:
        # Create a complete mock user display object with all required fields
        now = datetime.now()
        mock_user_display = UserDisplay(
            id=1,
            name="Test User",
            login="test_user",
            is_active=True,
            created_at=now,
            updated_at=now,
            email=None,
            avatar_uuid=None,
            telegram_link=None,
            age=None,
            target_universities=None,
            description=None,
            admission_type=None
        )
        mock_from_orm.return_value = mock_user_display
        
        # Make the request with a token
        response = test_client.get(
            "/auth/users/me",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Check the response
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["id"] == 1
        assert response_json["name"] == "Test User"
        assert response_json["login"] == "test_user"
        assert response_json["is_active"] == True