from typing import AsyncIterator

from src.models.schemas import ExplainErrorRequest
from src.services.llm.client import chat
from src.services.llm.prompts import SYSTEM_EXPLAIN_ERROR


class BugFixAgent:
    async def stream_explain(self, req: ExplainErrorRequest) -> AsyncIterator[str]:
        messages = [
            {"role": "system", "content": SYSTEM_EXPLAIN_ERROR},
            {
                "role": "user",
                "content": (
                    f"Code:\n```{req.language}\n{req.code}\n```\n\n"
                    f"Error:\n{req.error}"
                ),
            },
        ]
        response = await chat(messages, stream=True)
        async for chunk in response:
            delta = chunk.choices[0].delta.content
            if delta:
                yield f"data: {delta}\n\n"
        yield "data: [DONE]\n\n"
