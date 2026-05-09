from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.models.schemas import (
    ComplexityRequest,
    ComplexityResponse,
    ExplainErrorRequest,
    HintRequest,
)
from src.services.agents.bug_fix_agent import BugFixAgent
from src.services.agents.complexity_agent import ComplexityAgent
from src.services.agents.hint_agent import HintAgent

router = APIRouter()

_hint_agent = HintAgent()
_complexity_agent = ComplexityAgent()
_bug_fix_agent = BugFixAgent()


@router.post("/explain-error")
async def explain_error(req: ExplainErrorRequest) -> StreamingResponse:
    return StreamingResponse(
        _bug_fix_agent.stream_explain(req),
        media_type="text/event-stream",
    )


@router.post("/hint")
async def get_hint(req: HintRequest) -> StreamingResponse:
    return StreamingResponse(
        _hint_agent.stream_hint(req),
        media_type="text/event-stream",
    )


@router.post("/complexity", response_model=ComplexityResponse)
async def analyze_complexity(req: ComplexityRequest) -> ComplexityResponse:
    return await _complexity_agent.analyze(req)
