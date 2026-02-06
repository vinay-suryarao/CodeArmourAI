"""Firebase Auth middleware for verifying JWT tokens"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from firebase_admin import auth as firebase_auth

from ..services.firebase_service import firebase_service

logger = logging.getLogger(__name__)

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
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception as e:
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
