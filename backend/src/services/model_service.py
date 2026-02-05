"""Model Service with Pattern-Based Vulnerability Detection"""

import re
from typing import List, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class CodeChunk:
    content: str
    start_line: int
    end_line: int


@dataclass 
class PredictionResult:
    vulnerability_type: str
    confidence: float
    is_vulnerable: bool
    chunk_start_line: int = 1
    chunk_end_line: int = 1


VULN_PATTERNS = {
    "sql_injection": [
        r"SELECT.*\+",
        r"INSERT.*\+",
        r"UPDATE.*\+",
        r"DELETE.*\+",
        r"query.*\+",
        r"execute.*\%",
        r"f.SELECT",
    ],
    "xss": [
        r"innerHTML\s*=",
        r"document\.write",
        r"res\.send.*\+",
        r"\.html.*\+",
    ],
    "command_injection": [
        r"exec\s*\(.*\+",
        r"eval\s*\(",
        r"system\s*\(",
        r"popen\s*\(",
        r"child_process",
        r"os\.system",
    ],
    "hardcoded_credentials": [
        r"password\s*=\s*[\"'][^\"']+[\"']",
        r"api_key\s*=\s*[\"'][^\"']+[\"']",
        r"secret\s*=\s*[\"'][^\"']+[\"']",
        r"API_KEY\s*=\s*[\"']",
        r"DB_PASSWORD\s*=",
        r"SECRET\s*=",
    ],
    "path_traversal": [
        r"readFile.*\+",
        r"readFileSync.*\+",
        r"open\s*\(.*\+",
        r"\.\./",
    ],
    "insecure_random": [
        r"Math\.random",
        r"random\.random",
    ],
}


class ModelService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        self._is_loaded = False
        
    @property
    def is_loaded(self) -> bool:
        return True
    
    def load_model(self) -> bool:
        self._is_loaded = True
        logger.info("Pattern-based detector loaded")
        return True
    
    def _chunk_code(self, code: str) -> List[CodeChunk]:
        lines = code.split("\n")
        return [CodeChunk(content=code, start_line=1, end_line=len(lines))]
    
    def _find_line_number(self, code: str, pattern: str) -> int:
        lines = code.split("\n")
        for i, line in enumerate(lines):
            if re.search(pattern, line, re.IGNORECASE):
                return i + 1
        return 1
    
    async def predict(self, code: str, language: str = "python", threshold: float = 0.5) -> Tuple[List[PredictionResult], List[CodeChunk]]:
        chunks = self._chunk_code(code)
        predictions = []
        found_vulns = set()
        
        for vuln_type, patterns in VULN_PATTERNS.items():
            for pattern in patterns:
                try:
                    if re.search(pattern, code, re.IGNORECASE):
                        line_num = self._find_line_number(code, pattern)
                        key = (vuln_type, line_num)
                        if key not in found_vulns:
                            found_vulns.add(key)
                            predictions.append(PredictionResult(
                                vulnerability_type=vuln_type,
                                confidence=0.85,
                                is_vulnerable=True,
                                chunk_start_line=line_num,
                                chunk_end_line=line_num + 2
                            ))
                except:
                    continue
        
        if not predictions:
            predictions.append(PredictionResult(
                vulnerability_type="safe",
                confidence=0.9,
                is_vulnerable=False,
                chunk_start_line=1,
                chunk_end_line=len(code.split("\n"))
            ))
        
        logger.info(f"Found {len([p for p in predictions if p.is_vulnerable])} vulnerabilities")
        return predictions, chunks


model_service = ModelService()