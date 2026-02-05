"""
Sliding Window Chunking for processing long code files
Splits code into overlapping chunks for model processing
"""

from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class CodeChunk:
    """Represents a chunk of code with metadata"""

    content: str
    start_line: int
    end_line: int
    chunk_index: int
    total_chunks: int
    has_overlap: bool = False


class SlidingWindowChunker:
    """
    Splits code into overlapping windows for processing by transformer models.
    This handles the token limit of CodeBERT (512 tokens) while maintaining context.
    """

    def __init__(
        self,
        max_tokens: int = 480,  # Leave room for special tokens
        overlap_tokens: int = 64,
        lines_per_chunk: int = 50,
        overlap_lines: int = 10,
    ):
        """
        Initialize the chunker.

        Args:
            max_tokens: Maximum tokens per chunk (default 480 for CodeBERT)
            overlap_tokens: Number of overlapping tokens between chunks
            lines_per_chunk: Alternative line-based chunking
            overlap_lines: Lines to overlap between chunks
        """
        self.max_tokens = max_tokens
        self.overlap_tokens = overlap_tokens
        self.lines_per_chunk = lines_per_chunk
        self.overlap_lines = overlap_lines

    def chunk_by_lines(self, code: str) -> List[CodeChunk]:
        """
        Split code into chunks based on line count with overlap.

        Args:
            code: Source code string

        Returns:
            List of CodeChunk objects
        """
        lines = code.split("\n")
        total_lines = len(lines)

        if total_lines <= self.lines_per_chunk:
            return [
                CodeChunk(
                    content=code,
                    start_line=1,
                    end_line=total_lines,
                    chunk_index=0,
                    total_chunks=1,
                    has_overlap=False,
                )
            ]

        chunks = []
        chunk_index = 0
        start_idx = 0

        while start_idx < total_lines:
            end_idx = min(start_idx + self.lines_per_chunk, total_lines)

            chunk_lines = lines[start_idx:end_idx]
            chunk_content = "\n".join(chunk_lines)

            chunks.append(
                CodeChunk(
                    content=chunk_content,
                    start_line=start_idx + 1,  # 1-indexed
                    end_line=end_idx,
                    chunk_index=chunk_index,
                    total_chunks=0,  # Will be updated
                    has_overlap=start_idx > 0,
                )
            )

            chunk_index += 1

            # Move start with overlap
            start_idx = end_idx - self.overlap_lines

            # Prevent infinite loop
            if start_idx >= total_lines - self.overlap_lines:
                break

        # Update total_chunks
        total_chunks = len(chunks)
        for chunk in chunks:
            chunk.total_chunks = total_chunks

        return chunks

    def chunk_by_tokens(self, code: str, tokenizer) -> List[CodeChunk]:
        """
        Split code into chunks based on token count.
        Uses the actual tokenizer for accurate splitting.

        Args:
            code: Source code string
            tokenizer: HuggingFace tokenizer instance

        Returns:
            List of CodeChunk objects
        """
        lines = code.split("\n")
        total_lines = len(lines)

        # Quick check if entire code fits
        full_tokens = tokenizer.encode(code, add_special_tokens=False)
        if len(full_tokens) <= self.max_tokens:
            return [
                CodeChunk(
                    content=code,
                    start_line=1,
                    end_line=total_lines,
                    chunk_index=0,
                    total_chunks=1,
                    has_overlap=False,
                )
            ]

        chunks = []
        chunk_index = 0
        start_line_idx = 0

        while start_line_idx < total_lines:
            # Binary search for optimal end line
            current_content = ""
            end_line_idx = start_line_idx

            for i in range(start_line_idx, total_lines):
                test_content = "\n".join(lines[start_line_idx : i + 1])
                test_tokens = tokenizer.encode(test_content, add_special_tokens=False)

                if len(test_tokens) > self.max_tokens:
                    break

                current_content = test_content
                end_line_idx = i

            if not current_content:
                # Single line too long, truncate it
                current_content = lines[start_line_idx][:1000]
                end_line_idx = start_line_idx

            chunks.append(
                CodeChunk(
                    content=current_content,
                    start_line=start_line_idx + 1,  # 1-indexed
                    end_line=end_line_idx + 1,
                    chunk_index=chunk_index,
                    total_chunks=0,
                    has_overlap=start_line_idx > 0,
                )
            )

            chunk_index += 1

            # Calculate overlap in lines
            overlap_start = max(0, end_line_idx - self.overlap_lines + 1)
            start_line_idx = max(end_line_idx + 1, overlap_start)

            # Prevent infinite loop
            if end_line_idx >= total_lines - 1:
                break

        # Update total_chunks
        total_chunks = len(chunks)
        for chunk in chunks:
            chunk.total_chunks = total_chunks

        return chunks

    def merge_overlapping_results(self, results: List[Tuple[int, dict]]) -> List[dict]:
        """
        Merge vulnerability detection results from overlapping chunks.
        Removes duplicate detections in overlap regions.

        Args:
            results: List of (chunk_index, detection_result) tuples

        Returns:
            Deduplicated list of detections
        """
        if not results:
            return []

        seen_locations = set()
        merged = []

        for chunk_idx, detections in sorted(results, key=lambda x: x[0]):
            for detection in detections:
                # Create unique key based on location and type
                location_key = (
                    detection.get("start_line"),
                    detection.get("end_line"),
                    detection.get("type"),
                )

                if location_key not in seen_locations:
                    seen_locations.add(location_key)
                    merged.append(detection)

        return merged


# Singleton instance
chunker = SlidingWindowChunker()
