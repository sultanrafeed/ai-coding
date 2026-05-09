from typing import AsyncIterator

from src.models.schemas import ExplainErrorRequest
from src.services.llm.client import chat
from src.services.llm.prompts import SYSTEM_EXPLAIN_ERROR, build_rag_context
from src.services.rag.retriever import Retriever


class BugFixAgent:
    def __init__(self) -> None:
        self._retriever = Retriever()

    async def stream_explain(self, req: ExplainErrorRequest) -> AsyncIterator[str]:
        ctx = await self._retriever.get_problem_context(req.problem_id)
        rag_block = (
            build_rag_context(ctx.canonical_solutions, ctx.editorial) if ctx else ""
        )

        system = SYSTEM_EXPLAIN_ERROR
        if rag_block:
            system = f"{system}\n\n{rag_block}"

        messages = [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": (
                    f"My code:\n```{req.language}\n{req.code}\n```\n\n"
                    f"Error I'm getting:\n{req.error}"
                ),
            },
        ]
        response = await chat(messages, stream=True)
        async for chunk in response:
            delta = chunk.choices[0].delta.content
            if delta:
                yield f"data: {delta}\n\n"
        yield "data: [DONE]\n\n"
