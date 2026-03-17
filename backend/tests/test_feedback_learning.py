import json

from src.services.feedback_learning_service import FeedbackLearningService
from src.utils.config import settings


def test_feedback_learning_retrain_builds_policy(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "FEEDBACK_POLICY_PATH", str(tmp_path / "policy.json"))
    monkeypatch.setattr(settings, "FEEDBACK_EVENTS_PATH", str(tmp_path / "events.jsonl"))
    monkeypatch.setattr(settings, "FEEDBACK_MIN_SAMPLES_PER_LABEL", 2)
    monkeypatch.setattr(settings, "FEEDBACK_FALSE_POSITIVE_SUPPRESSION_RATE", 0.7)
    monkeypatch.setattr(settings, "FEEDBACK_CORRECTION_MIN_CONFIDENCE", 0.6)

    service = FeedbackLearningService()

    feedback = [
        {"predicted_label": "SQL Injection", "is_false_positive": True},
        {"predicted_label": "sql_injection", "is_false_positive": True},
        {"predicted_label": "sql_injection", "is_false_positive": True},
        {
            "predicted_label": "xss",
            "is_false_positive": False,
            "correct_label": "sql_injection",
        },
        {
            "predicted_label": "xss",
            "is_false_positive": False,
            "correct_label": "sql_injection",
        },
    ]

    result = service.retrain_from_feedback(feedback)

    assert result["retrained"] is True
    assert "sql_injection" in result["suppressed_labels"]
    assert result["correction_map"]["xss"] == "sql_injection"

    adjustment = service.get_adjustment("xss")
    assert adjustment["corrected_label"] == "sql_injection"

    with open(tmp_path / "policy.json", "r", encoding="utf-8") as file:
        policy = json.load(file)
    assert policy["version"] >= 1


def test_should_retrain_uses_threshold(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "FEEDBACK_POLICY_PATH", str(tmp_path / "policy.json"))
    monkeypatch.setattr(settings, "FEEDBACK_EVENTS_PATH", str(tmp_path / "events.jsonl"))
    monkeypatch.setattr(settings, "AUTO_RETRAIN", True)
    monkeypatch.setattr(settings, "FEEDBACK_THRESHOLD", 3)

    service = FeedbackLearningService()

    assert service.should_retrain(2) is False
    assert service.should_retrain(3) is True
