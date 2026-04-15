from __future__ import annotations

import hmac
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from config import settings

_security = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"


def create_token(subject: str = "admin") -> tuple[str, int]:
    """Return (token, expires_at_unix_timestamp)."""
    expires = datetime.now(timezone.utc) + timedelta(days=settings.jwt_expire_days)
    payload = {"sub": subject, "exp": expires}
    token = jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)
    return token, int(expires.timestamp())


def verify_token(token: str) -> str:
    """Return subject or raise."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        sub: str | None = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return sub
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def verify_password(plain: str) -> bool:
    return hmac.compare_digest(plain, settings.admin_password)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_security),
) -> str:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return verify_token(credentials.credentials)


CurrentUser = Annotated[str, Depends(get_current_user)]
OptionalCredentials = Annotated[
    HTTPAuthorizationCredentials | None,
    Depends(_security),
]
