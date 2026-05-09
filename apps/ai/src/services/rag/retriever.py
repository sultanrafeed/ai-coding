from dataclasses import dataclass

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from src.core.config import settings
from src.services.rag.embedder import Embedder


@dataclass
class ProblemContext:
    problem_id: str
    problem_statement: str
    patterns: list[str]
    canonical_solutions: list[dict]   # [{language, code, timeComplexity, spaceComplexity}]
    editorial: dict                   # {approach, explanation, keyInsight, commonMistakes}
    similar_solutions: list[str]      # canonical code from similar problems, for broader context


class Retriever:
    def __init__(self) -> None:
        self._client = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
        self._embedder = Embedder()

    async def get_problem_context(self, problem_id: str) -> ProblemContext | None:
        """Fetch the stored problem+solution+editorial payload directly by ID."""
        results = await self._client.scroll(
            collection_name=settings.qdrant_collection,
            scroll_filter=Filter(
                must=[FieldCondition(key="problem_id", match=MatchValue(value=problem_id))]
            ),
            limit=1,
            with_payload=True,
        )
        points, _ = results
        if not points:
            return None
        p = points[0].payload
        return ProblemContext(
            problem_id=problem_id,
            problem_statement=p["problem_statement"],
            patterns=p["patterns"],
            canonical_solutions=p["canonical_solutions"],
            editorial=p["editorial"],
            similar_solutions=[],
        )

    async def get_similar_problems(
        self, query_code: str, problem_id: str, top_k: int = 3
    ) -> list[dict]:
        """Retrieve canonical solutions from structurally similar problems."""
        vector = await self._embedder.embed_query(query_code)
        results = await self._client.search(
            collection_name=settings.qdrant_collection,
            query_vector=vector,
            query_filter=Filter(
                must_not=[FieldCondition(key="problem_id", match=MatchValue(value=problem_id))]
            ),
            limit=top_k,
            with_payload=True,
        )
        return [r.payload for r in results]

    async def get_user_history(self, user_id: str, top_k: int = 5) -> list[dict]:
        """Retrieve the user's own past submissions for personalised context."""
        collection = f"user_{user_id}"
        # TODO: check collection exists before querying
        results = await self._client.scroll(
            collection_name=collection,
            limit=top_k,
            with_payload=True,
        )
        points, _ = results
        return [p.payload for p in points]
