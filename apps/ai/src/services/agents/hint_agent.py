from typing import AsyncIterator

from src.models.schemas import HintRequest
from src.services.llm.client import chat
from src.services.llm.prompts import (
    SYSTEM_HINT_CONCEPTUAL,
    SYSTEM_HINT_NEAR_SOLUTION,
    SYSTEM_HINT_SOCRATIC,
    build_rag_context,
)
from src.services.rag.retriever import Retriever

_SYSTEM_MAP = {
    "socratic": SYSTEM_HINT_SOCRATIC,
    "conceptual": SYSTEM_HINT_CONCEPTUAL,
    "near-solution": SYSTEM_HINT_NEAR_SOLUTION,
}


class HintAgent:
    def __init__(self) -> None:
        self._retriever = Retriever()

    async def stream_hint(self, req: HintRequest) -> AsyncIterator[str]:
        ctx = await self._retriever.get_problem_context(req.problem_id)
        rag_block = (
            build_rag_context(ctx.canonical_solutions, ctx.editorial) if ctx else ""
        )

        system = _SYSTEM_MAP[req.depth]
        if rag_block:
            system = f"{system}\n\n{rag_block}"

        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": f"My current code:\n```{req.language}\n{req.code}\n```"},
        ]
        response = await chat(messages, stream=True)
        async for chunk in response:
            delta = chunk.choices[0].delta.content
            if delta:
                yield f"data: {delta}\n\n"
        yield "data: [DONE]\n\n"
