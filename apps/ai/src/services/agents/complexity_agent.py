from src.models.schemas import ComplexityRequest, ComplexityResponse
from src.services.llm.client import chat
from src.services.llm.prompts import SYSTEM_COMPLEXITY, build_rag_context
from src.services.rag.retriever import Retriever


class ComplexityAgent:
    def __init__(self) -> None:
        self._retriever = Retriever()

    async def analyze(self, req: ComplexityRequest) -> ComplexityResponse:
        ctx = await self._retriever.get_problem_context(req.problem_id) if req.problem_id else None
        rag_block = (
            build_rag_context(ctx.canonical_solutions, ctx.editorial) if ctx else ""
        )

        system = SYSTEM_COMPLEXITY
        if rag_block:
            system = f"{system}\n\n{rag_block}"

        messages = [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": f"Analyze this {req.language} code:\n```\n{req.code}\n```",
            },
        ]
        # TODO: run Tree-sitter AST analysis first and append results to the user message
        response = await chat(messages, stream=False)
        raw = response.choices[0].message.content
        # TODO: parse structured time/space from raw using a second structured-output call
        return ComplexityResponse(
            time_complexity="TODO",
            space_complexity="TODO",
            explanation=raw,
            confidence=0.0,
            ast_analysis=None,
        )
