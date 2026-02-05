"""
Pydantic schemas for API responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class SeverityEnum(str, Enum):
    """Vulnerability severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class VulnerabilityType(str, Enum):
    """Types of vulnerabilities detected"""
    SQL_INJECTION = "SQL Injection"
    XSS = "Cross-Site Scripting (XSS)"
    BUFFER_OVERFLOW = "Buffer Overflow"
    COMMAND_INJECTION = "Command Injection"
    PATH_TRAVERSAL = "Path Traversal"
    INSECURE_DESERIALIZATION = "Insecure Deserialization"
    HARDCODED_CREDENTIALS = "Hardcoded Credentials"
    INSECURE_RANDOM = "Insecure Random Number Generator"
    XXE = "XML External Entity (XXE)"
    SSRF = "Server-Side Request Forgery (SSRF)"
    LDAP_INJECTION = "LDAP Injection"
    XPATH_INJECTION = "XPath Injection"
    OTHER = "Other"


class VulnerabilityLocation(BaseModel):
    """Location of vulnerability in code"""
    
    start_line: int = Field(..., description="Starting line number (1-indexed)")
    end_line: int = Field(..., description="Ending line number (1-indexed)")
    start_column: Optional[int] = Field(default=None, description="Starting column")
    end_column: Optional[int] = Field(default=None, description="Ending column")
    snippet: str = Field(..., description="Code snippet containing the vulnerability")


class VulnerabilityDetail(BaseModel):
    """Details of a detected vulnerability"""
    
    id: str = Field(..., description="Unique identifier for this vulnerability")
    type: VulnerabilityType = Field(..., description="Type of vulnerability")
    severity: SeverityEnum = Field(..., description="Severity level")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1)")
    location: VulnerabilityLocation = Field(..., description="Location in code")
    description: str = Field(..., description="Human-readable description")
    recommendation: str = Field(..., description="How to fix this vulnerability")
    cwe_id: Optional[str] = Field(default=None, description="CWE ID if applicable")
    owasp_category: Optional[str] = Field(default=None, description="OWASP category")


class ScanSummary(BaseModel):
    """Summary statistics of a scan"""
    
    total_vulnerabilities: int = Field(default=0)
    critical_count: int = Field(default=0)
    high_count: int = Field(default=0)
    medium_count: int = Field(default=0)
    low_count: int = Field(default=0)
    info_count: int = Field(default=0)
    lines_scanned: int = Field(default=0)
    scan_duration_ms: float = Field(default=0.0)


class CodeAnalysisResponse(BaseModel):
    """Response schema for code analysis"""
    
    scan_id: str = Field(..., description="Unique identifier for this scan")
    status: str = Field(default="completed", description="Scan status")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    language: str = Field(..., description="Detected/specified language")
    filename: Optional[str] = Field(default=None)
    summary: ScanSummary = Field(..., description="Scan summary statistics")
    vulnerabilities: List[VulnerabilityDetail] = Field(
        default_factory=list,
        description="List of detected vulnerabilities"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "scan_id": "scan_abc123",
                "status": "completed",
                "timestamp": "2024-01-15T10:30:00Z",
                "language": "python",
                "filename": "example.py",
                "summary": {
                    "total_vulnerabilities": 1,
                    "critical_count": 0,
                    "high_count": 1,
                    "medium_count": 0,
                    "low_count": 0,
                    "info_count": 0,
                    "lines_scanned": 5,
                    "scan_duration_ms": 150.5
                },
                "vulnerabilities": [
                    {
                        "id": "vuln_xyz789",
                        "type": "SQL Injection",
                        "severity": "high",
                        "confidence": 0.95,
                        "location": {
                            "start_line": 2,
                            "end_line": 2,
                            "snippet": "query = f\"SELECT * FROM users WHERE id = {user_input}\""
                        },
                        "description": "Potential SQL injection vulnerability detected",
                        "recommendation": "Use parameterized queries instead of string formatting",
                        "cwe_id": "CWE-89",
                        "owasp_category": "A03:2021-Injection"
                    }
                ]
            }
        }


class FeedbackResponse(BaseModel):
    """Response schema for feedback submission"""
    
    success: bool = Field(..., description="Whether feedback was recorded")
    message: str = Field(..., description="Status message")
    feedback_id: str = Field(..., description="ID of the recorded feedback")


class HealthResponse(BaseModel):
    """Response schema for health check"""
    
    status: str = Field(default="healthy")
    version: str = Field(...)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    services: Dict[str, str] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Response schema for errors"""
    
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
