import asyncio
import re

import httpx
from celery import Celery
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from src.core.config import settings
from src.services.rag.embedder import Embedder

celery_app = Celery("ai-service", broker=settings.redis_url, backend=settings.redis_url)

EMBEDDING_DIM = 1024


def _run(coro):  # type: ignore[no-untyped-def]
    return asyncio.get_event_loop().run_until_complete(coro)


def _ensure_collection(client: QdrantClient, name: str) -> None:
    existing = {c.name for c in client.get_collections().collections}
    if name not in existing:
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
        )


@celery_app.task(name="embed_problem")
def embed_problem(problem_slug: str) -> None:
    """Fetch problem from NestJS API, embed its statement, and upsert into Qdrant."""
    resp = httpx.get(f"{settings.api_url}/api/problems/{problem_slug}", timeout=10)
    if resp.status_code != 200:
        raise ValueError(f"Problem '{problem_slug}' not found (HTTP {resp.status_code})")

    problem = resp.json()
    slug: str = problem["slug"]
    plain_desc = re.sub(r"<[^>]+>", " ", problem.get("descriptionHtml", ""))
    vector = _run(Embedder().embed(f"{problem['title']}\n\n{plain_desc}"))

    payload = {
        "problem_id": slug,
        "problem_statement": plain_desc.strip(),
        "patterns": problem.get("patterns", []),
        "canonical_solutions": problem.get("canonicalSolutions", []),
        "editorial": problem.get("editorial", {}),
    }

    client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key or None)
    _ensure_collection(client, settings.qdrant_collection)
    client.upsert(
        collection_name=settings.qdrant_collection,
        points=[PointStruct(id=abs(hash(slug)) % (2**63), vector=vector, payload=payload)],
    )
    client.close()


@celery_app.task(name="embed_submission")
def embed_submission(submission_id: str, user_id: str) -> None:
    """Embed a user's submission and store it in their per-user Qdrant namespace."""
    resp = httpx.get(f"{settings.api_url}/api/submissions/{submission_id}", timeout=10)
    if resp.status_code != 200:
        return

    submission = resp.json()
    code: str = submission.get("code", "")
    language: str = submission.get("language", "python")
    vector = _run(Embedder().embed(f"```{language}\n{code}\n```"))

    collection = f"user_{user_id}"
    client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key or None)
    _ensure_collection(client, collection)
    client.upsert(
        collection_name=collection,
        points=[PointStruct(
            id=abs(hash(submission_id)) % (2**63),
            vector=vector,
            payload={"submission_id": submission_id, "code": code, "language": language},
        )],
    )
    client.close()


@celery_app.task(name="update_skill_graph")
def update_skill_graph(user_id: str, problem_slug: str, solved: bool) -> None:
    """Record a problem attempt via the NestJS skill-graph endpoint."""
    httpx.post(
        f"{settings.api_url}/api/users/{user_id}/skill-graph",
        json={"problemSlug": problem_slug, "solved": solved},
        timeout=5,
    )
