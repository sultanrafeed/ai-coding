"""LangGraph definition for multi-persona code review agent."""
from __future__ import annotations

from typing import TypedDict

# TODO: implement multi-persona review
# Personas: correctness, performance, style, security
# Each persona runs in parallel, results merged into a unified report


class CodeReviewState(TypedDict):
    code: str
    language: str
    correctness_review: str
    performance_review: str
    style_review: str
    security_review: str
    merged_report: str
