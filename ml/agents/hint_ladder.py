"""LangGraph definition for the stateful hint ladder agent."""
from __future__ import annotations

from typing import TypedDict

# TODO: implement LangGraph state machine
# States: assess_code → generate_socratic → maybe_upgrade → generate_conceptual → ...


class HintState(TypedDict):
    code: str
    problem_id: str
    depth: str
    history: list[str]
    current_hint: str
