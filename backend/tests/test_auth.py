import pytest

from services.auth import create_token, verify_token, verify_password


def test_create_token_returns_token_and_timestamp():
    token, expires_at = create_token("admin")
    assert isinstance(token, str)
    assert len(token) > 0
    assert isinstance(expires_at, int)
    assert expires_at > 0


def test_verify_token_roundtrip():
    token, _ = create_token("admin")
    subject = verify_token(token)
    assert subject == "admin"


def test_verify_token_invalid():
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc_info:
        verify_token("invalid-token")
    assert exc_info.value.status_code == 401


def test_verify_password_correct():
    assert verify_password("test-password") is True


def test_verify_password_incorrect():
    assert verify_password("wrong-password") is False
