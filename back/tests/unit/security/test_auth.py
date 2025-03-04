import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException

from src.security.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_current_mentor,
    get_optional_current_user,
    get_optional_current_mentor,
)
from src.config import SECRET_KEY, ALGORITHM, Roles


@pytest.fixture
def mock_token():
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXIiLCJleHAiOjk5OTk5OTk5OTksInJvbGUiOiJ1c2VyIn0.signature"


def test_verify_password_success():
    with patch("src.security.auth.pwd_context.verify") as mock_verify:
        mock_verify.return_value = True

        result = verify_password("plain_password", "hashed_password")

        assert result is True
        mock_verify.assert_called_once_with("plain_password", "hashed_password")


def test_verify_password_failure():
    with patch("src.security.auth.pwd_context.verify") as mock_verify:
        mock_verify.return_value = False

        result = verify_password("wrong_password", "hashed_password")

        assert result is False
        mock_verify.assert_called_once_with("wrong_password", "hashed_password")


def test_get_password_hash():
    with patch("src.security.auth.pwd_context.hash") as mock_hash:
        mock_hash.return_value = "hashed_password"

        result = get_password_hash("plain_password")

        assert result == "hashed_password"
        mock_hash.assert_called_once_with("plain_password")


def test_create_access_token():
    with patch("src.security.auth.jwt.encode") as mock_encode, patch(
        "src.security.auth.datetime"
    ) as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0)
        mock_datetime.now.return_value = mock_now
        mock_encode.return_value = "encoded_token"

        data = {"sub": "test_user"}
        expires_delta = timedelta(minutes=30)

        result = create_access_token(Roles.USER, data, expires_delta)

        assert result == "encoded_token"

        expected_expire = mock_now + expires_delta
        expected_payload = {
            "sub": "test_user",
            "exp": expected_expire,
            "role": Roles.USER,
        }

        mock_encode.assert_called_once_with(
            expected_payload, SECRET_KEY, algorithm=ALGORITHM
        )


def test_create_access_token_default_expiry():
    with patch("src.security.auth.jwt.encode") as mock_encode, patch(
        "src.security.auth.datetime"
    ) as mock_datetime, patch("src.security.auth.ACCESS_TOKEN_EXPIRE_MINUTES", 15):
        mock_now = datetime(2023, 1, 1, 12, 0, 0)
        mock_datetime.now.return_value = mock_now
        mock_encode.return_value = "encoded_token"

        data = {"sub": "test_user"}

        result = create_access_token(Roles.USER, data)

        assert result == "encoded_token"

        expected_expire = mock_now + timedelta(minutes=15)
        expected_payload = {
            "sub": "test_user",
            "exp": expected_expire,
            "role": Roles.USER,
        }

        mock_encode.assert_called_once_with(
            expected_payload, SECRET_KEY, algorithm=ALGORITHM
        )


def test_create_access_token_mentor_role():
    with patch("src.security.auth.jwt.encode") as mock_encode, patch(
        "src.security.auth.datetime"
    ) as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0)
        mock_datetime.now.return_value = mock_now
        mock_encode.return_value = "encoded_token"

        data = {"sub": "test_mentor"}
        expires_delta = timedelta(minutes=30)

        result = create_access_token(Roles.MENTOR, data, expires_delta)

        assert result == "encoded_token"

        expected_expire = mock_now + expires_delta
        expected_payload = {
            "sub": "test_mentor",
            "exp": expected_expire,
            "role": Roles.MENTOR,
        }

        mock_encode.assert_called_once_with(
            expected_payload, SECRET_KEY, algorithm=ALGORITHM
        )


@pytest.mark.asyncio
async def test_get_current_user_valid_token(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_user_by_login", new_callable=AsyncMock
    ) as mock_get_user:
        mock_decode.return_value = {"sub": "test_user", "role": Roles.USER}

        mock_user = MagicMock()
        mock_user.is_active = True
        mock_get_user.return_value = mock_user

        result = await get_current_user(mock_token)

        assert result == mock_user
        mock_decode.assert_called_once_with(
            mock_token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        mock_get_user.assert_called_once_with("test_user")


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.side_effect = jwt.PyJWTError()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user("invalid_token")

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_current_user_missing_sub(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.return_value = {"role": Roles.USER}  # Missing 'sub'

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_token)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_current_user_wrong_role(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.return_value = {
            "sub": "test_user",
            "role": Roles.MENTOR,
        }  # Wrong role

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_token)

        assert exc_info.value.status_code == 403
        assert exc_info.value.detail == "Users only"


@pytest.mark.asyncio
async def test_get_current_user_not_found(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_user_by_login", new_callable=AsyncMock
    ) as mock_get_user:
        mock_decode.return_value = {"sub": "test_user", "role": Roles.USER}
        mock_get_user.return_value = None  # User not found

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_token)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_current_user_inactive(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_user_by_login", new_callable=AsyncMock
    ) as mock_get_user:
        mock_decode.return_value = {"sub": "test_user", "role": Roles.USER}

        mock_user = MagicMock()
        mock_user.is_active = False  # Inactive user
        mock_get_user.return_value = mock_user

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_token)

        assert exc_info.value.status_code == 403
        assert exc_info.value.detail == "Inactive user"


@pytest.mark.asyncio
async def test_get_current_mentor_valid_token(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_mentor_by_login", new_callable=AsyncMock
    ) as mock_get_mentor:
        mock_decode.return_value = {"sub": "test_mentor", "role": Roles.MENTOR}

        mock_mentor = MagicMock()
        mock_mentor.is_active = True
        mock_get_mentor.return_value = mock_mentor

        result = await get_current_mentor(mock_token)

        assert result == mock_mentor
        mock_decode.assert_called_once_with(
            mock_token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        mock_get_mentor.assert_called_once_with("test_mentor")


@pytest.mark.asyncio
async def test_get_current_mentor_wrong_role(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.return_value = {
            "sub": "test_mentor",
            "role": Roles.USER,
        }  # Wrong role

        with pytest.raises(HTTPException) as exc_info:
            await get_current_mentor(mock_token)

        assert exc_info.value.status_code == 403
        assert exc_info.value.detail == "Mentors only"


@pytest.mark.asyncio
async def test_get_current_mentor_invalid_token():
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.side_effect = jwt.PyJWTError()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_mentor("invalid_token")

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_current_mentor_missing_sub(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.return_value = {"role": Roles.MENTOR}  # Missing 'sub'

        with pytest.raises(HTTPException) as exc_info:
            await get_current_mentor(mock_token)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_current_mentor_not_found(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_mentor_by_login", new_callable=AsyncMock
    ) as mock_get_mentor:
        mock_decode.return_value = {"sub": "test_mentor", "role": Roles.MENTOR}
        mock_get_mentor.return_value = None  # Mentor not found

        with pytest.raises(HTTPException) as exc_info:
            await get_current_mentor(mock_token)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_optional_current_user_valid_token(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_user_by_login", new_callable=AsyncMock
    ) as mock_get_user:
        mock_decode.return_value = {"sub": "test_user", "role": Roles.USER}

        mock_user = MagicMock()
        mock_user.is_active = True
        mock_get_user.return_value = mock_user

        result = await get_optional_current_user(mock_token)

        assert result == mock_user
        mock_decode.assert_called_once_with(
            mock_token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        mock_get_user.assert_called_once_with("test_user")


@pytest.mark.asyncio
async def test_get_optional_current_user_no_token():
    result = await get_optional_current_user(None)
    assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_user_invalid_token():
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.side_effect = jwt.PyJWTError()

        result = await get_optional_current_user("invalid_token")

        assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_user_missing_sub(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.return_value = {"role": Roles.USER}  # Missing 'sub'

        result = await get_optional_current_user(mock_token)

        assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_user_wrong_role(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.return_value = {
            "sub": "test_user",
            "role": Roles.MENTOR,
        }  # Wrong role

        result = await get_optional_current_user(mock_token)

        assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_user_not_found(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_user_by_login", new_callable=AsyncMock
    ) as mock_get_user:
        mock_decode.return_value = {"sub": "test_user", "role": Roles.USER}
        mock_get_user.return_value = None  # User not found

        result = await get_optional_current_user(mock_token)

        assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_user_inactive(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_user_by_login", new_callable=AsyncMock
    ) as mock_get_user:
        mock_decode.return_value = {"sub": "test_user", "role": Roles.USER}

        mock_user = MagicMock()
        mock_user.is_active = False  # Inactive user
        mock_get_user.return_value = mock_user

        result = await get_optional_current_user(mock_token)

        assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_mentor_valid_token(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_mentor_by_login", new_callable=AsyncMock
    ) as mock_get_mentor:
        mock_decode.return_value = {"sub": "test_mentor", "role": Roles.MENTOR}

        mock_mentor = MagicMock()
        mock_mentor.is_active = True
        mock_get_mentor.return_value = mock_mentor

        result = await get_optional_current_mentor(mock_token)

        assert result == mock_mentor
        mock_decode.assert_called_once_with(
            mock_token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        mock_get_mentor.assert_called_once_with("test_mentor")


@pytest.mark.asyncio
async def test_get_optional_current_mentor_no_token():
    result = await get_optional_current_mentor(None)
    assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_mentor_wrong_role(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.return_value = {
            "sub": "test_mentor",
            "role": Roles.USER,
        }  # Wrong role

        result = await get_optional_current_mentor(mock_token)

        assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_mentor_missing_sub(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode:
        mock_decode.return_value = {"role": Roles.MENTOR}  # Missing 'sub'

        result = await get_optional_current_mentor(mock_token)

        assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_mentor_not_found(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_mentor_by_login", new_callable=AsyncMock
    ) as mock_get_mentor:
        mock_decode.return_value = {"sub": "test_mentor", "role": Roles.MENTOR}
        mock_get_mentor.return_value = None  # Mentor not found

        result = await get_optional_current_mentor(mock_token)

        assert result is None


@pytest.mark.asyncio
async def test_get_optional_current_mentor_inactive(mock_token):
    with patch("src.security.auth.jwt.decode") as mock_decode, patch(
        "src.security.auth.get_mentor_by_login", new_callable=AsyncMock
    ) as mock_get_mentor:
        mock_decode.return_value = {"sub": "test_mentor", "role": Roles.MENTOR}

        mock_mentor = MagicMock()
        mock_mentor.is_active = False  # Inactive mentor
        mock_get_mentor.return_value = mock_mentor

        result = await get_optional_current_mentor(mock_token)

        assert result is None
