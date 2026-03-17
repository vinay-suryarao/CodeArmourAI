"""Code Analyzer Service - Main service for vulnerability detection"""

import logging
import time
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..models.vulnerability_detector import (PredictionResult,
                                             VulnerabilityLabels)
from ..schemas.request import CodeAnalysisRequest, LanguageEnum
from ..schemas.response import (CodeAnalysisResponse, ScanSummary,
                                SeverityEnum, VulnerabilityDetail,
                                VulnerabilityLocation, VulnerabilityType)
from .model_service import model_service
from .feedback_learning_service import feedback_learning_service

logger = logging.getLogger(__name__)

# Try to import firebase (optional)
try:
    from .firebase_service import firebase_service

    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    firebase_service = None


LABEL_TO_VULN_TYPE = {
    "sql_injection": VulnerabilityType.SQL_INJECTION,
    "xss": VulnerabilityType.XSS,
    "buffer_overflow": VulnerabilityType.BUFFER_OVERFLOW,
    "command_injection": VulnerabilityType.COMMAND_INJECTION,
    "path_traversal": VulnerabilityType.PATH_TRAVERSAL,
    "insecure_deserialization": VulnerabilityType.INSECURE_DESERIALIZATION,
    "hardcoded_credentials": VulnerabilityType.HARDCODED_CREDENTIALS,
    "insecure_random": VulnerabilityType.INSECURE_RANDOM,
    "xxe": VulnerabilityType.XXE,
    "ssrf": VulnerabilityType.SSRF,
}

VULN_TYPE_TO_LABEL = {value: key for key, value in LABEL_TO_VULN_TYPE.items()}

CWE_MAPPING = {
    "sql_injection": "CWE-89",
    "xss": "CWE-79",
    "buffer_overflow": "CWE-120",
    "command_injection": "CWE-78",
    "path_traversal": "CWE-22",
    "insecure_deserialization": "CWE-502",
    "hardcoded_credentials": "CWE-798",
    "insecure_random": "CWE-330",
    "xxe": "CWE-611",
    "ssrf": "CWE-918",
}

OWASP_MAPPING = {
    "sql_injection": "A03:2021-Injection",
    "xss": "A03:2021-Injection",
    "buffer_overflow": "A03:2021-Injection",
    "command_injection": "A03:2021-Injection",
    "path_traversal": "A01:2021-Broken Access Control",
    "insecure_deserialization": "A08:2021-Software and Data Integrity Failures",
    "hardcoded_credentials": "A07:2021-Identification and Authentication Failures",
    "insecure_random": "A02:2021-Cryptographic Failures",
    "xxe": "A05:2021-Security Misconfiguration",
    "ssrf": "A10:2021-Server-Side Request Forgery",
}

SEVERITY_MAPPING = {
    "sql_injection": SeverityEnum.HIGH,
    "xss": SeverityEnum.MEDIUM,
    "buffer_overflow": SeverityEnum.CRITICAL,
    "command_injection": SeverityEnum.CRITICAL,
    "path_traversal": SeverityEnum.HIGH,
    "insecure_deserialization": SeverityEnum.HIGH,
    "hardcoded_credentials": SeverityEnum.MEDIUM,
    "insecure_random": SeverityEnum.LOW,
    "xxe": SeverityEnum.HIGH,
    "ssrf": SeverityEnum.HIGH,
}

RECOMMENDATIONS = {
    "sql_injection": "Use parameterized queries or prepared statements.",
    "xss": "Sanitize and escape all user input before rendering.",
    "buffer_overflow": "Use bounds-checking functions and safe string handling.",
    "command_injection": "Avoid executing shell commands with user input.",
    "path_traversal": "Validate and sanitize file paths.",
    "insecure_deserialization": "Avoid deserializing untrusted data.",
    "hardcoded_credentials": "Store credentials in environment variables.",
    "insecure_random": "Use cryptographically secure random generators.",
    "xxe": "Disable external entity processing in XML parsers.",
    "ssrf": "Validate and whitelist allowed URLs.",
}


class CodeAnalyzerService:
    def __init__(self):
        self._scan_cache: Dict[str, Dict[str, Any]] = {}
        self._ensure_model_loaded()

    def _ensure_model_loaded(self):
        if not model_service.is_loaded:
            model_service.load_model()

    async def analyze(
        self, request: CodeAnalysisRequest, store_result: bool = True, user_uid: str = None
    ) -> CodeAnalysisResponse:
        start_time = time.time()
        scan_id = f"scan_{uuid.uuid4().hex[:12]}"
        logger.info(f"Starting scan {scan_id} for {request.language} code")

        try:
            predictions, chunks = await model_service.predict(
                code=request.code, language=request.language.value
            )

            vulnerabilities = self._build_vulnerabilities(
                predictions, chunks, request.code
            )
            summary = self._build_summary(
                vulnerabilities, request.code, (time.time() - start_time) * 1000
            )

            response = CodeAnalysisResponse(
                scan_id=scan_id,
                status="completed",
                timestamp=datetime.utcnow(),
                language=request.language.value,
                filename=request.filename,
                summary=summary,
                vulnerabilities=vulnerabilities,
            )

            # Keep a lightweight local cache so feedback can resolve predicted labels.
            self._scan_cache[scan_id] = response.model_dump()

            # Store in Firebase if available
            if store_result and FIREBASE_AVAILABLE and firebase_service:
                try:
                    await firebase_service.store_scan_result(
                        scan_id, response.model_dump(), user_uid=user_uid
                    )
                except Exception as e:
                    logger.warning(f"Failed to store in Firebase: {e}")

            logger.info(
                f"Scan {scan_id} completed: {summary.total_vulnerabilities} vulnerabilities found"
            )
            return response

        except Exception as e:
            logger.error(f"Scan {scan_id} failed: {e}")
            raise

    def _build_vulnerabilities(
        self, predictions: List[PredictionResult], chunks: List, code: str
    ) -> List[VulnerabilityDetail]:
        vulnerabilities = []
        lines = code.split("\n")

        for i, pred in enumerate(predictions):
            if not pred.is_vulnerable:
                continue

            vuln_type = pred.vulnerability_type
            adjustment = feedback_learning_service.get_adjustment(vuln_type)

            if adjustment.get("suppressed"):
                continue

            corrected_label = adjustment.get("corrected_label")
            if corrected_label:
                vuln_type = corrected_label

            adjusted_confidence = min(
                1.0,
                max(0.0, pred.confidence * float(adjustment.get("confidence_multiplier", 1.0))),
            )

            # Use exact line number from prediction, not from chunk
            start_line = pred.chunk_start_line
            end_line = pred.chunk_end_line

            # Ensure valid line range
            start_line = max(1, min(start_line, len(lines)))
            end_line = max(start_line, min(end_line, len(lines)))

            # Get the snippet - just the vulnerable line(s)
            snippet = "\n".join(lines[start_line - 1 : end_line])

            location = VulnerabilityLocation(
                start_line=start_line,
                end_line=start_line,  # Show only the exact line where vulnerability is
                snippet=snippet[:500],
            )

            vuln_type_enum = LABEL_TO_VULN_TYPE.get(vuln_type, VulnerabilityType.OTHER)
            severity = SEVERITY_MAPPING.get(vuln_type, SeverityEnum.MEDIUM)

            if adjusted_confidence < 0.7:
                severity_order = [
                    SeverityEnum.INFO,
                    SeverityEnum.LOW,
                    SeverityEnum.MEDIUM,
                    SeverityEnum.HIGH,
                    SeverityEnum.CRITICAL,
                ]
                current_idx = severity_order.index(severity)
                if current_idx > 0:
                    severity = severity_order[current_idx - 1]

            vulnerabilities.append(
                VulnerabilityDetail(
                    id=f"vuln_{uuid.uuid4().hex[:8]}",
                    type=vuln_type_enum,
                    severity=severity,
                    confidence=adjusted_confidence,
                    location=location,
                    description=f"Potential {vuln_type_enum.value} vulnerability detected with {adjusted_confidence:.1%} confidence.",
                    recommendation=RECOMMENDATIONS.get(
                        vuln_type, "Review and fix the identified security issue."
                    ),
                    cwe_id=CWE_MAPPING.get(vuln_type),
                    owasp_category=OWASP_MAPPING.get(vuln_type),
                )
            )

        return vulnerabilities

    def get_predicted_label(self, scan_id: str, vulnerability_id: str) -> Optional[str]:
        scan = self._scan_cache.get(scan_id)
        if not scan:
            return None

        vulnerabilities = scan.get("vulnerabilities", [])
        for vulnerability in vulnerabilities:
            if vulnerability.get("id") == vulnerability_id:
                vuln_type_name = vulnerability.get("type")
                try:
                    vuln_type_enum = VulnerabilityType(vuln_type_name)
                    return VULN_TYPE_TO_LABEL.get(vuln_type_enum)
                except Exception:
                    return None

        return None

    def _build_summary(
        self, vulnerabilities: List[VulnerabilityDetail], code: str, duration_ms: float
    ) -> ScanSummary:
        severity_counts = {s: 0 for s in SeverityEnum}
        for vuln in vulnerabilities:
            severity_counts[vuln.severity] += 1

        return ScanSummary(
            total_vulnerabilities=len(vulnerabilities),
            critical_count=severity_counts[SeverityEnum.CRITICAL],
            high_count=severity_counts[SeverityEnum.HIGH],
            medium_count=severity_counts[SeverityEnum.MEDIUM],
            low_count=severity_counts[SeverityEnum.LOW],
            info_count=severity_counts[SeverityEnum.INFO],
            lines_scanned=len(code.split("\n")),
            scan_duration_ms=duration_ms,
        )

    async def analyze_batch(
        self, requests: List[CodeAnalysisRequest]
    ) -> List[CodeAnalysisResponse]:
        results = []
        for req in requests:
            result = await self.analyze(req)
            results.append(result)
        return results


code_analyzer = CodeAnalyzerService()
