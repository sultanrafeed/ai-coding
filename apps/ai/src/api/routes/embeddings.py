import httpx
from fastapi import APIRouter, HTTPException
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import PointStruct

from src.core.config import settings
from src.models.schemas import EmbedRequest, EmbedResponse, IndexProblemRequest
from src.services.rag.embedder import Embedder

router = APIRouter()

_embedder = Embedder()


@router.post("", response_model=EmbedResponse)
async def embed(req: EmbedRequest) -> EmbedResponse:
    vector = await _embedder.embed(req.text)
    return EmbedResponse(vector=vector)


@router.post("/index-problem")
async def index_problem(req: IndexProblemRequest) -> dict[str, str]:
    """Fetch a problem from the NestJS API, embed its statement, and upsert into Qdrant."""
    async with httpx.AsyncClient() as http:
        resp = await http.get(f"{settings.api_url}/api/problems/{req.problem_slug}")
    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail=f"Problem '{req.problem_slug}' not found in API")

    problem = resp.json()
    slug: str = problem["slug"]

    # Build the text to embed: title + description (strip HTML tags roughly)
    import re
    plain_desc = re.sub(r"<[^>]+>", " ", problem.get("descriptionHtml", ""))
    embed_text = f"{problem['title']}\n\n{plain_desc}"

    vector = await _embedder.embed(embed_text)

    payload = {
        "problem_id": slug,
        "problem_statement": plain_desc.strip(),
        "patterns": problem.get("patterns", []),
        "canonical_solutions": problem.get("canonicalSolutions", []),
        "editorial": problem.get("editorial", {}),
    }

    client = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key or None)
    try:
        await client.upsert(
            collection_name=settings.qdrant_collection,
            points=[PointStruct(id=abs(hash(slug)) % (2**63), vector=vector, payload=payload)],
        )
    finally:
        await client.close()

    return {"status": "indexed", "problem_slug": slug}
