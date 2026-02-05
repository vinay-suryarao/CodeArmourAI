"""
Code Detection API Routes
Main endpoints for vulnerability detection
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import logging

from ...schemas.request import CodeAnalysisRequest, BatchAnalysisRequest
from ...schemas.response import CodeAnalysisResponse, ErrorResponse
from ...services.code_analyzer import code_analyzer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/detect", tags=["Detection"])


@router.post(
    "",
    response_model=CodeAnalysisResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    }
)
async def analyze_code(request: CodeAnalysisRequest):
    """
    Analyze source code for security vulnerabilities.
    
    This endpoint uses a CodeBERT-based deep learning model to detect
    common vulnerabilities such as:
    - SQL Injection
    - Cross-Site Scripting (XSS)
    - Buffer Overflow
    - Command Injection
    - Path Traversal
    - And more...
    
    **Request Body:**
    - `code`: The source code to analyze (required)
    - `language`: Programming language (default: python)
    - `filename`: Optional filename for context
    
    **Returns:**
    - Scan ID for tracking
    - List of detected vulnerabilities with:
        - Type and severity
        - Confidence score
        - Location in code
        - Remediation recommendations
        - CWE and OWASP references
    """
    try:
        result = await code_analyzer.analyze(request)
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during code analysis"
        )


@router.post(
    "/batch",
    response_model=List[CodeAnalysisResponse],
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    }
)
async def analyze_batch(request: BatchAnalysisRequest):
    """
    Analyze multiple code files for vulnerabilities.
    
    Accepts up to 50 files in a single request.
    Each file is analyzed independently and results are returned
    in the same order as the input.
    
    **Request Body:**
    - `files`: List of code analysis requests
    
    **Returns:**
    - List of CodeAnalysisResponse objects
    """
    try:
        results = await code_analyzer.analyze_batch(request.files)
        return results
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
        
    except Exception as e:
        logger.error(f"Batch analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during batch analysis"
        )


@router.post("/async")
async def analyze_code_async(
    request: CodeAnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    Submit code for asynchronous analysis.
    
    Returns immediately with a scan ID that can be used
    to poll for results.
    
    **Request Body:**
    - Same as /detect endpoint
    
    **Returns:**
    - `scan_id`: ID to check status
    - `status`: "queued"
    """
    import uuid
    
    scan_id = f"scan_{uuid.uuid4().hex[:12]}"
    
    # Add to background tasks
    background_tasks.add_task(
        _process_async_scan,
        scan_id,
        request
    )
    
    return {
        "scan_id": scan_id,
        "status": "queued",
        "message": "Scan has been queued for processing"
    }


async def _process_async_scan(scan_id: str, request: CodeAnalysisRequest):
    """Background task to process async scan"""
    try:
        await code_analyzer.analyze(request, store_result=True)
        logger.info(f"Async scan {scan_id} completed")
    except Exception as e:
        logger.error(f"Async scan {scan_id} failed: {e}")


@router.get("/languages")
async def get_supported_languages():
    """
    Get list of supported programming languages.
    
    **Returns:**
    - List of supported language codes
    """
    from ...schemas.request import LanguageEnum
    
    return {
        "languages": [lang.value for lang in LanguageEnum],
        "default": "python"
    }


@router.get("/vulnerability-types")
async def get_vulnerability_types():
    """
    Get list of vulnerability types the model can detect.
    
    **Returns:**
    - List of vulnerability types with descriptions
    """
    from ...models.vulnerability_detector import VulnerabilityLabels
    from ...services.code_analyzer import CWE_MAPPING, OWASP_MAPPING, SEVERITY_MAPPING
    
    types = []
    for label in VulnerabilityLabels.LABELS:
        if label == "safe":
            continue
            
        types.append({
            "id": label,
            "name": label.replace("_", " ").title(),
            "cwe": CWE_MAPPING.get(label),
            "owasp": OWASP_MAPPING.get(label),
            "severity": SEVERITY_MAPPING.get(label, "medium").value if hasattr(SEVERITY_MAPPING.get(label, "medium"), "value") else "medium"
        })
    
    return {"vulnerability_types": types}
