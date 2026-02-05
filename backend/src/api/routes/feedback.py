"""Feedback API Routes"""

import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException

from ...schemas.request import FeedbackRequest
from ...schemas.response import ErrorResponse, FeedbackResponse

logger = logging.getLogger(__name__)

# Try to import firebase
try:
    from ...services.firebase_service import firebase_service

    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    firebase_service = None

router = APIRouter(prefix="/feedback", tags=["Feedback"])

_feedback_store = []


@router.post("", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    try:
        feedback_id = f"fb_{uuid.uuid4().hex[:12]}"

        feedback_data = {
            "id": feedback_id,
            "scan_id": request.scan_id,
            "vulnerability_id": request.vulnerability_id,
            "is_false_positive": request.is_false_positive,
            "user_comment": request.user_comment,
            "correct_label": request.correct_label,
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Store in Firebase if available
        if FIREBASE_AVAILABLE and firebase_service:
            try:
                await firebase_service.store_feedback(
                    feedback_id=feedback_id,
                    scan_id=request.scan_id,
                    vulnerability_id=request.vulnerability_id,
                    is_false_positive=request.is_false_positive,
                    user_comment=request.user_comment,
                    correct_label=request.correct_label,
                )
            except Exception as e:
                logger.warning(f"Firebase storage failed: {e}")

        # Also store locally
        _feedback_store.append(feedback_data)

        logger.info(f"Feedback {feedback_id} stored")
        return FeedbackResponse(
            success=True,
            message="Feedback recorded successfully.",
            feedback_id=feedback_id,
        )
    except Exception as e:
        logger.error(f"Failed to store feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to record feedback")


@router.get("/stats")
async def get_feedback_stats():
    stats = {
        "total_feedback": len(_feedback_store),
        "unprocessed_feedback": len(_feedback_store),
        "total_scans": 0,
        "storage_type": "in-memory",
        "firebase_connected": False,
    }

    if FIREBASE_AVAILABLE and firebase_service:
        try:
            fb_stats = await firebase_service.get_statistics()
            stats.update(fb_stats)
        except Exception as e:
            logger.warning(f"Failed to get Firebase stats: {e}")

    return stats


@router.get("/recent")
async def get_recent_feedback(limit: int = 10):
    return {
        "feedback": _feedback_store[-limit:],
        "count": min(limit, len(_feedback_store)),
    }
