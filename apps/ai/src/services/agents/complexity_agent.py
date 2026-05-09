from src.models.schemas import ComplexityRequest, ComplexityResponse
from src.services.llm.client import chat
from src.services.llm.prompts import SYSTEM_COMPLEXITY


class ComplexityAgent:
    async def analyze(self, req: ComplexityRequest) -> ComplexityResponse:
        messages = [
            {"role": "system", "content": SYSTEM_COMPLEXITY},
            {
                "role": "user",
                "content": f"Analyze this {req.language} code:\n```\n{req.code}\n```",
            },
        ]
        # TODO: also run Tree-sitter AST analysis and cross-check
        response = await chat(messages, stream=False)
        raw = response.choices[0].message.content
        # TODO: parse structured output from raw
        return ComplexityResponse(
            time_complexity="TODO",
            space_complexity="TODO",
            explanation=raw,
            confidence=0.0,
        )
