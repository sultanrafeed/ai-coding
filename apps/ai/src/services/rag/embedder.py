import voyageai

from src.core.config import settings


class Embedder:
    def __init__(self) -> None:
        self._client = voyageai.AsyncClient(api_key=settings.voyage_api_key)

    async def embed(self, text: str) -> list[float]:
        result = await self._client.embed(
            texts=[text],
            model=settings.embedding_model,
            input_type="document",
        )
        return result.embeddings[0]

    async def embed_query(self, text: str) -> list[float]:
        result = await self._client.embed(
            texts=[text],
            model=settings.embedding_model,
            input_type="query",
        )
        return result.embeddings[0]
