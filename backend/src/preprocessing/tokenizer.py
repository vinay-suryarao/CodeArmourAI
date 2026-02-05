"""
Code Tokenization utilities for preparing code for model inference
"""

import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass


@dataclass
class TokenizedCode:
    """Container for tokenized code data"""
    tokens: List[int]
    attention_mask: List[int]
    original_code: str
    normalized_code: str
    line_mapping: Dict[int, int]  # token_idx -> line_number


class CodeTokenizer:
    """
    Handles code preprocessing and tokenization for vulnerability detection.
    Wraps HuggingFace tokenizer with code-specific preprocessing.
    """
    
    def __init__(self, tokenizer=None, max_length: int = 512):
        """
        Initialize the code tokenizer.
        
        Args:
            tokenizer: HuggingFace tokenizer (loaded lazily if None)
            max_length: Maximum sequence length
        """
        self._tokenizer = tokenizer
        self.max_length = max_length
        
        # Patterns for code normalization
        self.string_pattern = re.compile(r'(["\'])(?:(?!\1|\\).|\\.)*\1')
        self.comment_patterns = {
            'python': re.compile(r'#.*$|\'\'\'[\s\S]*?\'\'\'|"""[\s\S]*?"""', re.MULTILINE),
            'javascript': re.compile(r'//.*$|/\*[\s\S]*?\*/', re.MULTILINE),
            'java': re.compile(r'//.*$|/\*[\s\S]*?\*/', re.MULTILINE),
            'cpp': re.compile(r'//.*$|/\*[\s\S]*?\*/', re.MULTILINE),
            'c': re.compile(r'//.*$|/\*[\s\S]*?\*/', re.MULTILINE),
        }
        self.whitespace_pattern = re.compile(r'\s+')
    
    @property
    def tokenizer(self):
        """Lazy load tokenizer"""
        if self._tokenizer is None:
            from transformers import AutoTokenizer
            self._tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
        return self._tokenizer
    
    def normalize_code(
        self, 
        code: str, 
        language: str = "python",
        remove_comments: bool = False,
        normalize_strings: bool = False
    ) -> Tuple[str, Dict[int, int]]:
        """
        Normalize code for consistent processing.
        
        Args:
            code: Raw source code
            language: Programming language
            remove_comments: Whether to remove comments
            normalize_strings: Whether to replace string literals with placeholders
            
        Returns:
            Tuple of (normalized_code, line_mapping)
        """
        normalized = code
        
        # Remove comments if requested
        if remove_comments:
            pattern = self.comment_patterns.get(language.lower())
            if pattern:
                normalized = pattern.sub('', normalized)
        
        # Normalize string literals
        if normalize_strings:
            normalized = self.string_pattern.sub('"STRING"', normalized)
        
        # Create line mapping (original line -> normalized line)
        line_mapping = {}
        original_lines = code.split('\n')
        normalized_lines = normalized.split('\n')
        
        orig_idx = 0
        for norm_idx, norm_line in enumerate(normalized_lines):
            while orig_idx < len(original_lines):
                if norm_line.strip() in original_lines[orig_idx]:
                    line_mapping[norm_idx + 1] = orig_idx + 1
                    orig_idx += 1
                    break
                orig_idx += 1
            else:
                line_mapping[norm_idx + 1] = norm_idx + 1
        
        return normalized, line_mapping
    
    def tokenize(
        self, 
        code: str,
        language: str = "python",
        add_special_tokens: bool = True,
        return_tensors: Optional[str] = None
    ) -> TokenizedCode:
        """
        Tokenize code for model input.
        
        Args:
            code: Source code to tokenize
            language: Programming language
            add_special_tokens: Add [CLS] and [SEP] tokens
            return_tensors: Return type ('pt' for PyTorch, 'np' for numpy)
            
        Returns:
            TokenizedCode object
        """
        # Normalize first
        normalized, line_mapping = self.normalize_code(code, language)
        
        # Tokenize
        encoded = self.tokenizer(
            normalized,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            add_special_tokens=add_special_tokens,
            return_tensors=return_tensors
        )
        
        # Extract tokens and mask
        if return_tensors:
            tokens = encoded['input_ids']
            attention_mask = encoded['attention_mask']
        else:
            tokens = encoded['input_ids']
            attention_mask = encoded['attention_mask']
        
        # Build token to line mapping
        token_line_mapping = self._build_token_line_mapping(normalized, tokens)
        
        return TokenizedCode(
            tokens=tokens,
            attention_mask=attention_mask,
            original_code=code,
            normalized_code=normalized,
            line_mapping=token_line_mapping
        )
    
    def _build_token_line_mapping(
        self, 
        code: str, 
        tokens: List[int]
    ) -> Dict[int, int]:
        """
        Map token indices to source code line numbers.
        
        Args:
            code: Source code
            tokens: Token IDs
            
        Returns:
            Mapping from token index to line number
        """
        mapping = {}
        
        # Decode tokens back to get offsets
        try:
            decoded = self.tokenizer.decode(tokens, skip_special_tokens=True)
            lines = code.split('\n')
            
            char_idx = 0
            current_line = 1
            
            for token_idx, token_id in enumerate(tokens):
                token_str = self.tokenizer.decode([token_id], skip_special_tokens=True)
                
                if token_str:
                    # Find which line this character is on
                    while current_line <= len(lines):
                        line_end = len('\n'.join(lines[:current_line]))
                        if char_idx <= line_end:
                            mapping[token_idx] = current_line
                            break
                        current_line += 1
                    
                    char_idx += len(token_str)
        except Exception:
            # Fallback: simple sequential mapping
            pass
        
        return mapping
    
    def batch_tokenize(
        self, 
        codes: List[str],
        languages: Optional[List[str]] = None,
        return_tensors: str = "pt"
    ) -> Dict:
        """
        Tokenize multiple code snippets.
        
        Args:
            codes: List of source code strings
            languages: List of programming languages
            return_tensors: Return type
            
        Returns:
            Batch encoded dictionary
        """
        if languages is None:
            languages = ["python"] * len(codes)
        
        # Normalize all codes
        normalized_codes = []
        for code, lang in zip(codes, languages):
            norm, _ = self.normalize_code(code, lang)
            normalized_codes.append(norm)
        
        # Batch tokenize
        return self.tokenizer(
            normalized_codes,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors=return_tensors
        )
    
    def get_vocab_size(self) -> int:
        """Get vocabulary size"""
        return len(self.tokenizer)
    
    def decode(self, tokens: List[int], skip_special: bool = True) -> str:
        """Decode tokens back to text"""
        return self.tokenizer.decode(tokens, skip_special_tokens=skip_special)


# Singleton instance (tokenizer loaded lazily)
code_tokenizer = CodeTokenizer()
