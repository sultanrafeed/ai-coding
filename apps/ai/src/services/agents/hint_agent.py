from typing import AsyncIterator

from src.models.schemas import HintRequest
from src.services.llm.client import chat
from src.services.llm.prompts import (
    SYSTEM_HINT_CONCEPTUAL,
    SYSTEM_HINT_NEAR_SOLUTION,
    SYSTEM_HINT_SOCRATIC,
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
        # TODO: retrieve relevant context from Qdrant
        system = _SYSTEM_MAP[req.depth]
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": f"Code:\n```{req.language}\n{req.code}\n```"},
        ]
        response = await chat(messages, stream=True)
        async for chunk in response:
            delta = chunk.choices[0].delta.content
            if delta:
                yield f"data: {delta}\n\n"
        yield "data: [DONE]\n\n"
