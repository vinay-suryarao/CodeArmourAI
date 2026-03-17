"""Feedback API Routes"""

import logging
import uuid
from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, HTTPException

from ...schemas.request import FeedbackRequest
from ...schemas.response import ErrorResponse, FeedbackResponse
from ...services.code_analyzer import code_analyzer
from ...services.feedback_learning_service import feedback_learning_service
from ...utils.config import settings

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


async def _collect_unprocessed_feedback() -> List[Dict]:
    if FIREBASE_AVAILABLE and firebase_service:
        return await firebase_service.get_unprocessed_feedback(limit=5000)

    return [item for item in _feedback_store if not item.get("processed")]


async def _mark_feedback_processed(feedback_ids: List[str]) -> int:
    if not feedback_ids:
        return 0

    if FIREBASE_AVAILABLE and firebase_service:
        return await firebase_service.mark_feedback_processed(feedback_ids)

    updated = 0
    ids = set(feedback_ids)
    for item in _feedback_store:
        if item.get("id") in ids:
            item["processed"] = True
            item["processed_at"] = datetime.utcnow().isoformat()
            updated += 1
    return updated


async def _run_feedback_retrain(force: bool = False) -> Dict:
    unprocessed_feedback = await _collect_unprocessed_feedback()
    unprocessed_count = len(unprocessed_feedback)

    if not force and not feedback_learning_service.should_retrain(unprocessed_count):
        return {
            "triggered": False,
            "reason": "threshold_not_reached",
            "unprocessed_feedback": unprocessed_count,
            "required_feedback": settings.FEEDBACK_THRESHOLD,
        }

    result = feedback_learning_service.retrain_from_feedback(unprocessed_feedback)
    if result.get("retrained"):
        feedback_ids = [item.get("id") for item in unprocessed_feedback if item.get("id")]
        marked = await _mark_feedback_processed(feedback_ids)
        result["marked_processed"] = marked

    result["triggered"] = bool(result.get("retrained"))
    result["unprocessed_feedback"] = unprocessed_count
    return result


@router.post("", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    try:
        feedback_id = f"fb_{uuid.uuid4().hex[:12]}"
        predicted_label = code_analyzer.get_predicted_label(
            request.scan_id, request.vulnerability_id
        )

        if not predicted_label and FIREBASE_AVAILABLE and firebase_service:
            try:
                predicted_label = await firebase_service.get_scan_vulnerability_label(
                    request.scan_id, request.vulnerability_id
                )
            except Exception as e:
                logger.warning(f"Could not resolve label from scan history: {e}")

        feedback_data = {
            "id": feedback_id,
            "scan_id": request.scan_id,
            "vulnerability_id": request.vulnerability_id,
            "is_false_positive": request.is_false_positive,
            "user_comment": request.user_comment,
            "correct_label": request.correct_label,
            "predicted_label": predicted_label,
            "timestamp": datetime.utcnow().isoformat(),
            "processed": False,
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
                    predicted_label=feedback_data["predicted_label"],
                )
            except Exception as e:
                logger.warning(f"Firebase storage failed: {e}")

        # Also store locally
        _feedback_store.append(feedback_data)

        retrain_result = {"triggered": False, "reason": "auto_retrain_disabled"}
        if settings.AUTO_RETRAIN:
            retrain_result = await _run_feedback_retrain(force=False)

        logger.info(f"Feedback {feedback_id} stored")
        message = "Feedback recorded successfully."
        if retrain_result.get("triggered"):
            message = (
                f"Feedback recorded. Feedback retrain complete "
                f"(policy v{retrain_result.get('policy_version')})."
            )
        return FeedbackResponse(
            success=True,
            message=message,
            feedback_id=feedback_id,
        )
    except Exception as e:
        logger.error(f"Failed to store feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to record feedback")


@router.get("/stats")
async def get_feedback_stats():
    stats = {
        "total_feedback": len(_feedback_store),
        "unprocessed_feedback": len(
            [item for item in _feedback_store if not item.get("processed")]
        ),
        "total_scans": 0,
        "storage_type": "in-memory",
        "firebase_connected": False,
        "mlops": feedback_learning_service.get_status(),
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


@router.post("/retrain")
async def retrain_from_feedback(force: bool = True):
    try:
        result = await _run_feedback_retrain(force=force)
        return result
    except Exception as e:
        logger.error(f"Feedback retrain failed: {e}")
        raise HTTPException(status_code=500, detail="Feedback retrain failed")


@router.get("/mlops-status")
async def get_feedback_mlops_status():
    unprocessed_feedback = await _collect_unprocessed_feedback()
    status = feedback_learning_service.get_status()
    status.update(
        {
            "unprocessed_feedback": len(unprocessed_feedback),
            "ready_for_retrain": feedback_learning_service.should_retrain(
                len(unprocessed_feedback)
            ),
        }
    )
    return status
