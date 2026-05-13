"""LangGraph definition for the bug-fix / error explanation agent."""
from __future__ import annotations

import os
import re
from typing import AsyncIterator, TypedDict

from langgraph.graph import END, StateGraph
from litellm import acompletion
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class BugFixState(TypedDict):
    code: str
    error: str
    problem_id: str
    language: str
    retrieved_context: list[str]
    parsed_error: dict          # {type, message, line}
    explanation: str
    verified: bool


# ---------------------------------------------------------------------------
# Config (mirrors apps/ai/src/core/config.py defaults)
# ---------------------------------------------------------------------------

_QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
_QDRANT_API_KEY = os.getenv("QDRANT_API_KEY") or None
_QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "code_embeddings")
_MODEL = os.getenv("DEFAULT_MODEL", "deepseek/deepseek-chat")
_LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL", "http://localhost:4000")
_LITELLM_API_KEY = os.getenv("LITELLM_API_KEY", "sk-1234")
_MAX_TOKENS = int(os.getenv("MAX_TOKENS_PER_REQUEST", "2048"))

_SYSTEM_EXPLAIN_ERROR = """
You are an expert programming tutor. You have access to the CANONICAL CORRECT SOLUTION
and EDITORIAL for this problem. Use them as your source of truth — do not reason from
parametric memory alone.

Your job: explain WHY the user's code is wrong, anchored to the canonical solution.
1. Identify the exact divergence between the user's logic and the canonical approach
2. Explain WHY their approach fails (edge case, wrong invariant, etc.)
3. Reference the editorial's "commonMistakes" list if the error matches one
4. End with ONE guiding question — do not hand them the fix

Never reveal the canonical solution code directly.
""".strip()

_SYSTEM_VERIFY = """
You are a quality reviewer for programming tutoring explanations.

Given a user's error and an explanation written by a tutor, check that the explanation:
1. Directly addresses the specific error shown (not a generic response)
2. Does NOT contain the canonical solution code verbatim
3. Ends with a guiding question (not a direct fix)

Reply with exactly one word: PASS or FAIL.
""".strip()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _llm(messages: list[dict], max_tokens: int | None = None) -> str:
    resp = await acompletion(
        model=_MODEL,
        messages=messages,
        stream=False,
        max_tokens=max_tokens or _MAX_TOKENS,
        api_base=_LITELLM_BASE_URL,
        api_key=_LITELLM_API_KEY,
    )
    return resp.choices[0].message.content or ""


def _build_rag_block(chunks: list[str]) -> str:
    if not chunks:
        return ""
    return "## Problem context (ground truth — do not reveal directly)\n\n" + "\n\n".join(chunks)


# ---------------------------------------------------------------------------
# Nodes
# ---------------------------------------------------------------------------

async def parse_error(state: BugFixState) -> dict:
    """Extract structured info from the raw error string via heuristic regex."""
    raw = state["error"]
    parsed: dict = {"type": "unknown", "message": raw, "line": None}

    for line in raw.splitlines():
        stripped = line.strip()
        # Match single-word error types like "TypeError: ..." or "RuntimeError: ..."
        m = re.match(r"^([A-Za-z]\w+(?:Error|Exception|Warning)):\s*(.+)$", stripped)
        if m:
            parsed["type"] = m.group(1)
            parsed["message"] = m.group(2)
            break

    line_match = re.search(r"line\s+(\d+)", raw, re.IGNORECASE)
    if line_match:
        parsed["line"] = int(line_match.group(1))

    return {"parsed_error": parsed}


async def retrieve_context(state: BugFixState) -> dict:
    """Fetch problem editorial and canonical solutions from Qdrant."""
    client = AsyncQdrantClient(url=_QDRANT_URL, api_key=_QDRANT_API_KEY)

    results = await client.scroll(
        collection_name=_QDRANT_COLLECTION,
        scroll_filter=Filter(
            must=[FieldCondition(key="problem_id", match=MatchValue(value=state["problem_id"]))]
        ),
        limit=1,
        with_payload=True,
    )
    await client.close()

    points, _ = results
    if not points:
        return {"retrieved_context": []}

    p = points[0].payload
    chunks: list[str] = []

    editorial = p.get("editorial", {})
    if editorial:
        mistakes = "\n".join(f"- {m}" for m in editorial.get("commonMistakes", []))
        chunks.append(
            f"**Approach:** {editorial.get('approach', '')}\n"
            f"**Key insight:** {editorial.get('keyInsight', '')}\n\n"
            f"**Editorial explanation:**\n{editorial.get('explanation', '')}\n\n"
            f"**Common mistakes:**\n{mistakes}"
        )

    for sol in p.get("canonical_solutions", []):
        lang = sol.get("language", "")
        chunks.append(
            f"### Canonical solution ({lang})\n```{lang}\n{sol.get('code', '')}\n```\n"
            f"Time: {sol.get('timeComplexity', '?')} | Space: {sol.get('spaceComplexity', '?')}"
        )

    return {"retrieved_context": chunks}


async def explain(state: BugFixState) -> dict:
    """Generate a Socratic bug explanation grounded in retrieved context."""
    rag_block = _build_rag_block(state["retrieved_context"])
    system = f"{_SYSTEM_EXPLAIN_ERROR}\n\n{rag_block}" if rag_block else _SYSTEM_EXPLAIN_ERROR

    parsed = state.get("parsed_error", {})
    error_preamble = ""
    if parsed.get("type") and parsed["type"] != "unknown":
        error_preamble = f"Error type: {parsed['type']}\n"
    if parsed.get("line"):
        error_preamble += f"At line: {parsed['line']}\n"

    language = state.get("language", "python")
    user_content = (
        f"My code:\n```{language}\n{state['code']}\n```\n\n"
        f"Error I'm getting:\n{error_preamble}{state['error']}"
    )

    text = await _llm([
        {"role": "system", "content": system},
        {"role": "user", "content": user_content},
    ])
    return {"explanation": text}


async def verify_explanation(state: BugFixState) -> dict:
    """Self-check that the explanation meets quality criteria before returning."""
    verdict = await _llm(
        [
            {"role": "system", "content": _SYSTEM_VERIFY},
            {
                "role": "user",
                "content": (
                    f"Error:\n{state['error']}\n\n"
                    f"Explanation:\n{state['explanation']}"
                ),
            },
        ],
        max_tokens=10,
    )
    return {"verified": verdict.strip().upper().startswith("PASS")}


# ---------------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------------

def _build_graph() -> StateGraph:
    g = StateGraph(BugFixState)

    g.add_node("parse_error", parse_error)
    g.add_node("retrieve_context", retrieve_context)
    g.add_node("explain", explain)
    g.add_node("verify_explanation", verify_explanation)

    g.set_entry_point("parse_error")
    g.add_edge("parse_error", "retrieve_context")
    g.add_edge("retrieve_context", "explain")
    g.add_edge("explain", "verify_explanation")
    g.add_edge("verify_explanation", END)

    return g


bug_fix_graph = _build_graph().compile()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def run(
    code: str,
    error: str,
    problem_id: str,
    language: str = "python",
) -> BugFixState:
    """Run the full bug-fix pipeline and return the final state."""
    initial: BugFixState = {
        "code": code,
        "error": error,
        "problem_id": problem_id,
        "language": language,
        "retrieved_context": [],
        "parsed_error": {},
        "explanation": "",
        "verified": False,
    }
    return await bug_fix_graph.ainvoke(initial)


async def stream_explanation(
    code: str,
    error: str,
    problem_id: str,
    language: str = "python",
) -> AsyncIterator[str]:
    """Yield SSE chunks as LangGraph streams node outputs."""
    initial: BugFixState = {
        "code": code,
        "error": error,
        "problem_id": problem_id,
        "language": language,
        "retrieved_context": [],
        "parsed_error": {},
        "explanation": "",
        "verified": False,
    }
    async for event in bug_fix_graph.astream(initial):
        node_name = next(iter(event))
        node_output = event[node_name]
        if node_name == "explain" and "explanation" in node_output:
            yield f"data: {node_output['explanation']}\n\n"
    yield "data: [DONE]\n\n"
