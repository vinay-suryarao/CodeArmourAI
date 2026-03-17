"""Firebase Auth middleware for verifying JWT tokens"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

try:
    from firebase_admin import auth as firebase_auth
    from ...services.firebase_service import firebase_service

    FIREBASE_AUTH_AVAILABLE = True
    FIREBASE_IMPORT_ERROR = None
except Exception as exc:
    firebase_auth = None
    firebase_service = None
    FIREBASE_AUTH_AVAILABLE = False
    FIREBASE_IMPORT_ERROR = exc
    logger.warning("Firebase auth is unavailable: %s", FIREBASE_IMPORT_ERROR)

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """
    Verify Firebase ID token and return user info.
    Returns None if no token provided (for optional auth).
    Raises HTTPException if token is invalid.
    """
    if not credentials:
        return None

    if not FIREBASE_AUTH_AVAILABLE or firebase_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        )

    token = credentials.credentials

    try:
        # Ensure Firebase is initialized
        if not firebase_service.is_connected:
            firebase_service.initialize()

        decoded_token = firebase_auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
        }
    except Exception as e:
        if isinstance(e, firebase_auth.ExpiredIdTokenError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
            )
        if isinstance(e, firebase_auth.InvalidIdTokenError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
        )


async def require_auth(
    user: Optional[dict] = Depends(get_current_user),
) -> dict:
    """Require authentication - raises 401 if not authenticated"""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user
