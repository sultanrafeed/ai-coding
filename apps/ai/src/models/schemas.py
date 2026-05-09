from typing import Literal

from pydantic import BaseModel


class ExplainErrorRequest(BaseModel):
    code: str
    error: str
    problem_id: str
    language: str = "python"


class HintRequest(BaseModel):
    code: str
    problem_id: str
    depth: Literal["socratic", "conceptual", "near-solution"] = "socratic"
    language: str = "python"


class ComplexityRequest(BaseModel):
    code: str
    language: str = "python"


class ComplexityResponse(BaseModel):
    time_complexity: str
    space_complexity: str
    explanation: str
    confidence: float
    ast_analysis: dict | None = None


class EmbedRequest(BaseModel):
    text: str
    model: str = "voyage-code-3"


class EmbedResponse(BaseModel):
    vector: list[float]
