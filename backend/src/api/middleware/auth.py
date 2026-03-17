"""Firebase Auth middleware for verifying JWT tokens"""

import base64
import json
import logging
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ...utils.config import settings

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


def _decode_unverified_payload(token: str) -> Optional[dict]:
    """Decode JWT payload without signature verification (development fallback)."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        payload = parts[1]
        payload += "=" * (-len(payload) % 4)
        decoded_bytes = base64.urlsafe_b64decode(payload)
        payload_dict = json.loads(decoded_bytes.decode("utf-8"))

        uid = payload_dict.get("user_id") or payload_dict.get("uid") or payload_dict.get("sub")
        if not uid:
            return None

        return {
            "uid": uid,
            "email": payload_dict.get("email"),
            "name": payload_dict.get("name"),
        }
    except Exception:
        return None


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

    if not FIREBASE_AUTH_AVAILABLE or firebase_service is None:
        if settings.DEBUG:
            fallback_user = _decode_unverified_payload(token)
            if fallback_user:
                logger.warning(
                    "Auth service unavailable, using development token payload fallback"
                )
                return fallback_user

        # Optional-auth endpoints should keep working even if auth backend is down.
        logger.warning("Auth service unavailable, continuing as anonymous user")
        return None

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
        if settings.DEBUG:
            fallback_user = _decode_unverified_payload(token)
            if fallback_user:
                logger.warning(
                    "Token verification failed, using development token payload fallback: %s",
                    e,
                )
                return fallback_user

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
