"""Feedback-driven learning service for threshold-based retraining."""

import json
import logging
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..utils.config import settings

logger = logging.getLogger(__name__)


class FeedbackLearningService:
    def __init__(self):
        self._policy: Dict[str, Any] = {
            "version": 0,
            "last_retrained_at": None,
            "total_processed_feedback": 0,
            "label_stats": {},
            "suppress_labels": [],
            "correction_map": {},
        }
        self._base_dir = Path(__file__).resolve().parent.parent.parent
        self._policy_path = self._resolve_path(settings.FEEDBACK_POLICY_PATH)
        self._events_path = self._resolve_path(settings.FEEDBACK_EVENTS_PATH)
        self._load_policy()

    def _resolve_path(self, configured_path: str) -> Path:
        path = Path(configured_path)
        if path.is_absolute():
            return path
        return self._base_dir / path

    def _normalize_label(self, label: Optional[str]) -> Optional[str]:
        if not label:
            return None
        normalized = label.strip().lower()
        normalized = normalized.replace("(", " ").replace(")", " ")
        normalized = normalized.replace("-", "_").replace("/", "_")
        normalized = "_".join(normalized.split())

        aliases = {
            "cross_site_scripting_xss": "xss",
            "cross_site_scripting": "xss",
            "sql_injection": "sql_injection",
            "command_injection": "command_injection",
            "path_traversal": "path_traversal",
            "hardcoded_credentials": "hardcoded_credentials",
            "insecure_random_number_generator": "insecure_random",
            "insecure_random": "insecure_random",
            "buffer_overflow": "buffer_overflow",
            "insecure_deserialization": "insecure_deserialization",
            "server_side_request_forgery_ssrf": "ssrf",
            "xml_external_entity_xxe": "xxe",
        }
        return aliases.get(normalized, normalized)

    def _load_policy(self) -> None:
        try:
            if self._policy_path.exists():
                with self._policy_path.open("r", encoding="utf-8") as file:
                    loaded = json.load(file)
                    if isinstance(loaded, dict):
                        self._policy.update(loaded)
                        logger.info("Feedback policy loaded from %s", self._policy_path)
        except Exception as exc:
            logger.warning("Failed to load feedback policy: %s", exc)

    def _save_policy(self) -> None:
        try:
            self._policy_path.parent.mkdir(parents=True, exist_ok=True)
            with self._policy_path.open("w", encoding="utf-8") as file:
                json.dump(self._policy, file, indent=2)
        except Exception as exc:
            logger.warning("Failed to save feedback policy: %s", exc)

    def _append_training_event(self, payload: Dict[str, Any]) -> None:
        try:
            self._events_path.parent.mkdir(parents=True, exist_ok=True)
            with self._events_path.open("a", encoding="utf-8") as file:
                file.write(json.dumps(payload) + "\n")
        except Exception as exc:
            logger.warning("Failed to append feedback training event: %s", exc)

    def should_retrain(self, unprocessed_feedback_count: int) -> bool:
        if not settings.AUTO_RETRAIN:
            return False
        if unprocessed_feedback_count < settings.FEEDBACK_THRESHOLD:
            return False
        return True

    def retrain_from_feedback(self, feedback_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not feedback_items:
            return {
                "retrained": False,
                "reason": "No feedback available",
                "processed_count": 0,
            }

        label_stats: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {
                "total": 0,
                "false_positive": 0,
                "false_positive_rate": 0.0,
                "corrections": {},
            }
        )
        correction_counts: Dict[str, Counter] = defaultdict(Counter)

        processed_count = 0

        for item in feedback_items:
            predicted_label = self._normalize_label(item.get("predicted_label"))
            if not predicted_label:
                continue

            label_stats[predicted_label]["total"] += 1
            processed_count += 1

            if item.get("is_false_positive"):
                label_stats[predicted_label]["false_positive"] += 1

            correct_label = self._normalize_label(item.get("correct_label"))
            if correct_label and correct_label != predicted_label:
                correction_counts[predicted_label][correct_label] += 1

        suppress_labels = []
        correction_map = {}

        for label, stats in label_stats.items():
            total = stats["total"]
            false_positive = stats["false_positive"]
            fp_rate = (false_positive / total) if total else 0.0
            stats["false_positive_rate"] = round(fp_rate, 4)

            corrections = dict(correction_counts[label])
            stats["corrections"] = corrections

            if (
                total >= settings.FEEDBACK_MIN_SAMPLES_PER_LABEL
                and fp_rate >= settings.FEEDBACK_FALSE_POSITIVE_SUPPRESSION_RATE
            ):
                suppress_labels.append(label)

            if corrections:
                top_label, top_count = max(corrections.items(), key=lambda x: x[1])
                correction_confidence = top_count / total
                if correction_confidence >= settings.FEEDBACK_CORRECTION_MIN_CONFIDENCE:
                    correction_map[label] = top_label

        self._policy["version"] = int(self._policy.get("version", 0)) + 1
        self._policy["last_retrained_at"] = datetime.utcnow().isoformat()
        self._policy["total_processed_feedback"] = int(
            self._policy.get("total_processed_feedback", 0)
        ) + processed_count
        self._policy["label_stats"] = dict(label_stats)
        self._policy["suppress_labels"] = sorted(set(suppress_labels))
        self._policy["correction_map"] = correction_map

        self._save_policy()

        event = {
            "timestamp": self._policy["last_retrained_at"],
            "policy_version": self._policy["version"],
            "processed_feedback": processed_count,
            "suppressed_labels": self._policy["suppress_labels"],
            "correction_map": correction_map,
        }
        self._append_training_event(event)

        logger.info(
            "Feedback retrain complete: version=%s processed=%s suppressed=%s corrected=%s",
            self._policy["version"],
            processed_count,
            len(self._policy["suppress_labels"]),
            len(correction_map),
        )

        return {
            "retrained": True,
            "processed_count": processed_count,
            "policy_version": self._policy["version"],
            "suppressed_labels": self._policy["suppress_labels"],
            "correction_map": correction_map,
        }

    def get_adjustment(self, predicted_label: str) -> Dict[str, Any]:
        normalized = self._normalize_label(predicted_label)
        if not normalized:
            return {
                "suppressed": False,
                "corrected_label": None,
                "confidence_multiplier": 1.0,
            }

        suppress_labels = set(self._policy.get("suppress_labels", []))
        correction_map = self._policy.get("correction_map", {})
        label_stats = self._policy.get("label_stats", {})

        label_info = label_stats.get(normalized, {})
        fp_rate = float(label_info.get("false_positive_rate", 0.0))
        confidence_multiplier = max(0.4, 1.0 - fp_rate)

        return {
            "suppressed": normalized in suppress_labels,
            "corrected_label": correction_map.get(normalized),
            "confidence_multiplier": round(confidence_multiplier, 4),
        }

    def get_status(self) -> Dict[str, Any]:
        return {
            "auto_retrain": settings.AUTO_RETRAIN,
            "feedback_threshold": settings.FEEDBACK_THRESHOLD,
            "policy_version": self._policy.get("version", 0),
            "last_retrained_at": self._policy.get("last_retrained_at"),
            "total_processed_feedback": self._policy.get("total_processed_feedback", 0),
            "suppressed_labels": self._policy.get("suppress_labels", []),
            "correction_map": self._policy.get("correction_map", {}),
        }


feedback_learning_service = FeedbackLearningService()
