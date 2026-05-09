"""LangGraph definition for the bug-fix / error explanation agent."""
from __future__ import annotations

from typing import TypedDict

# TODO: implement LangGraph state machine
# States: parse_error → retrieve_context → explain → verify_explanation


class BugFixState(TypedDict):
    code: str
    error: str
    problem_id: str
    retrieved_context: list[str]
    explanation: str
