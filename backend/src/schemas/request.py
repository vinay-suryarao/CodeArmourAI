"""
Pydantic schemas for API request validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class LanguageEnum(str, Enum):
    """Supported programming languages"""
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    JAVA = "java"
    CPP = "cpp"
    C = "c"
    CSHARP = "csharp"
    PHP = "php"
    GO = "go"
    RUBY = "ruby"
    RUST = "rust"


class CodeAnalysisRequest(BaseModel):
    """Request schema for code analysis"""
    
    code: str = Field(
        ..., 
        min_length=1,
        max_length=100000,
        description="Source code to analyze"
    )
    language: LanguageEnum = Field(
        default=LanguageEnum.PYTHON,
        description="Programming language of the code"
    )
    filename: Optional[str] = Field(
        default=None,
        description="Optional filename for context"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "code": "user_input = input()\nquery = f\"SELECT * FROM users WHERE id = {user_input}\"",
                "language": "python",
                "filename": "example.py"
            }
        }


class FeedbackRequest(BaseModel):
    """Request schema for user feedback on vulnerability detection"""
    
    scan_id: str = Field(..., description="ID of the scan result")
    vulnerability_id: str = Field(..., description="ID of the specific vulnerability")
    is_false_positive: bool = Field(
        ..., 
        description="True if the detection was a false positive"
    )
    user_comment: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional user comment explaining the feedback"
    )
    correct_label: Optional[str] = Field(
        default=None,
        description="The correct vulnerability type if misclassified"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "scan_id": "scan_abc123",
                "vulnerability_id": "vuln_xyz789",
                "is_false_positive": True,
                "user_comment": "This is a parameterized query, not SQL injection",
                "correct_label": None
            }
        }


class BatchAnalysisRequest(BaseModel):
    """Request schema for analyzing multiple code snippets"""
    
    files: List[CodeAnalysisRequest] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of code files to analyze"
    )
