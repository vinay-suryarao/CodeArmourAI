"""Firebase Service for storing scan results and feedback"""

import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, List, Optional
from datetime import datetime
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

# Path to service account JSON file
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
CREDENTIALS_FILE = BACKEND_DIR / "serviceAccountKey.json"


class FirebaseService:
    def __init__(self):
        self._db = None
        self._initialized = False

    def initialize(self):
        if self._initialized:
            return True

        try:
            if CREDENTIALS_FILE.exists():
                logger.info(f"Loading Firebase credentials from: {CREDENTIALS_FILE}")
                cred = credentials.Certificate(str(CREDENTIALS_FILE))
                firebase_admin.initialize_app(cred)
                self._db = firestore.client()
                self._initialized = True
                logger.info("Firebase initialized successfully!")
                return True
            else:
                logger.warning(f"Firebase credentials file not found: {CREDENTIALS_FILE}")
                return False

        except Exception as e:
            logger.error(f"Firebase initialization failed: {e}")
            return False

    @property
    def is_connected(self) -> bool:
        return self._initialized and self._db is not None

    async def store_scan_result(self, scan_id: str, result: Dict) -> bool:
        if not self.is_connected:
            if not self.initialize():
                return False

        try:
            doc_ref = self._db.collection("scans").document(scan_id)
            result["created_at"] = datetime.utcnow().isoformat()
            doc_ref.set(result)
            logger.info(f"Stored scan in Firebase: {scan_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to store scan: {e}")
            return False

    async def store_feedback(self, feedback_id: str, scan_id: str, vulnerability_id: str,
                            is_false_positive: bool, user_comment: Optional[str] = None,
                            correct_label: Optional[str] = None) -> bool:
        if not self.is_connected:
            if not self.initialize():
                return False

        try:
            doc_ref = self._db.collection("feedback").document(feedback_id)
            doc_ref.set({
                "scan_id": scan_id,
                "vulnerability_id": vulnerability_id,
                "is_false_positive": is_false_positive,
                "user_comment": user_comment,
                "correct_label": correct_label,
                "created_at": datetime.utcnow().isoformat(),
                "processed": False
            })
            logger.info(f"Stored feedback in Firebase: {feedback_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to store feedback: {e}")
            return False

    async def get_statistics(self) -> Dict:
        if not self.is_connected:
            return {"connected": False}

        try:
            scans = len(list(self._db.collection("scans").limit(1000).stream()))
            feedback = len(list(self._db.collection("feedback").limit(1000).stream()))
            return {"connected": True, "total_scans": scans, "total_feedback": feedback}
        except Exception as e:
            return {"connected": False, "error": str(e)}


firebase_service = FirebaseService()