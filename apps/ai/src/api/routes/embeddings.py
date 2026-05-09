from fastapi import APIRouter

from src.models.schemas import EmbedRequest, EmbedResponse
from src.services.rag.embedder import Embedder

router = APIRouter()

_embedder = Embedder()


@router.post("", response_model=EmbedResponse)
async def embed(req: EmbedRequest) -> EmbedResponse:
    vector = await _embedder.embed(req.text)
    return EmbedResponse(vector=vector)


@router.post("/index-problem")
async def index_problem(problem_id: str) -> dict[str, str]:
    # TODO: fetch problem from API, embed, store in Qdrant
    return {"status": "queued", "problem_id": problem_id}
