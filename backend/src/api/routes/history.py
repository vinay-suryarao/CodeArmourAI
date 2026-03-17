"""
User History API Routes
Endpoints for user-specific scan history
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from ..middleware.auth import require_auth

logger = logging.getLogger(__name__)

try:
    from ...services.firebase_service import firebase_service

    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    firebase_service = None

router = APIRouter(prefix="/history", tags=["History"])


@router.get("")
async def get_user_history(user: dict = Depends(require_auth)):
    """Get scan history for the authenticated user"""
    if not FIREBASE_AVAILABLE or firebase_service is None:
        raise HTTPException(status_code=503, detail="Database not available")

    if not firebase_service.is_connected:
        if not firebase_service.initialize():
            raise HTTPException(status_code=503, detail="Database not available")

    try:
        scans_ref = (
            firebase_service._db.collection("user_scans")
            .document(user["uid"])
            .collection("scans")
            .order_by("created_at", direction="DESCENDING")
            .limit(50)
        )

        scans = []
        for doc in scans_ref.stream():
            scan_data = doc.to_dict()
            scan_data["id"] = doc.id
            scans.append(scan_data)

        return {"scans": scans, "total": len(scans)}

    except Exception as e:
        logger.error(f"Failed to fetch history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch scan history")


@router.delete("")
async def clear_user_history(user: dict = Depends(require_auth)):
    """Clear all scan history for the authenticated user"""
    if not FIREBASE_AVAILABLE or firebase_service is None:
        raise HTTPException(status_code=503, detail="Database not available")

    if not firebase_service.is_connected:
        if not firebase_service.initialize():
            raise HTTPException(status_code=503, detail="Database not available")

    try:
        scans_ref = (
            firebase_service._db.collection("user_scans")
            .document(user["uid"])
            .collection("scans")
        )

        # Delete all scans
        batch = firebase_service._db.batch()
        docs = scans_ref.stream()
        count = 0
        for doc in docs:
            batch.delete(doc.reference)
            count += 1
            # Firestore batch limit is 500
            if count % 500 == 0:
                batch.commit()
                batch = firebase_service._db.batch()

        if count % 500 != 0:
            batch.commit()

        return {"success": True, "deleted": count}

    except Exception as e:
        logger.error(f"Failed to clear history: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear scan history")


@router.delete("/{scan_id}")
async def delete_scan(scan_id: str, user: dict = Depends(require_auth)):
    """Delete a specific scan from history"""
    if not FIREBASE_AVAILABLE or firebase_service is None:
        raise HTTPException(status_code=503, detail="Database not available")

    if not firebase_service.is_connected:
        if not firebase_service.initialize():
            raise HTTPException(status_code=503, detail="Database not available")

    try:
        doc_ref = (
            firebase_service._db.collection("user_scans")
            .document(user["uid"])
            .collection("scans")
            .document(scan_id)
        )

        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Scan not found")

        doc_ref.delete()
        return {"success": True, "message": "Scan deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete scan: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete scan")
