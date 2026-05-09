from qdrant_client import AsyncQdrantClient
from qdrant_client.models import ScoredPoint

from src.core.config import settings
from src.services.rag.embedder import Embedder


class Retriever:
    def __init__(self) -> None:
        self._client = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
        self._embedder = Embedder()

    async def search(self, query: str, top_k: int = 5, user_id: str | None = None) -> list[ScoredPoint]:
        vector = await self._embedder.embed_query(query)
        # TODO: add user_id filter for per-user namespace isolation
        return await self._client.search(
            collection_name=settings.qdrant_collection,
            query_vector=vector,
            limit=top_k,
        )
