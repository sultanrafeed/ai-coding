"""
Index all problems into Qdrant.

Each Qdrant point stores:
  - vector: embedding of (problem_statement + patterns + editorial explanation)
  - payload: full problem context — canonical_solutions, editorial, patterns, problem_id

This means at RAG time we never need a second DB round-trip: one vector search returns
everything the agents need to build grounded, hallucination-free responses.
"""
from __future__ import annotations

import asyncio
import json
import uuid
from pathlib import Path

import voyageai
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

PROBLEMS_DIR = Path(__file__).parent.parent.parent / "data" / "problems"
QDRANT_URL = "http://localhost:6333"
COLLECTION = "code_embeddings"
EMBEDDING_MODEL = "voyage-code-3"
VECTOR_DIM = 1024  # voyage-code-3 output dimension


def load_problems() -> list[dict]:
    return [
        json.loads(p.read_text())
        for p in PROBLEMS_DIR.glob("*.json")
        if p.name != "schema.json"
    ]


def build_embed_text(problem: dict) -> str:
    """Concatenate the fields that matter most for semantic retrieval."""
    patterns = ", ".join(problem.get("patterns", []))
    editorial = problem.get("editorial", {})
    return "\n\n".join([
        f"Title: {problem['title']} ({problem['difficulty']})",
        f"Patterns: {patterns}",
        problem.get("descriptionHtml", ""),
        f"Approach: {editorial.get('approach', '')}",
        editorial.get("explanation", ""),
        editorial.get("keyInsight", ""),
    ])


async def main() -> None:
    voyage = voyageai.AsyncClient()
    qdrant = AsyncQdrantClient(url=QDRANT_URL)

    # Ensure collection exists
    collections = await qdrant.get_collections()
    names = [c.name for c in collections.collections]
    if COLLECTION not in names:
        await qdrant.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
        )
        print(f"Created collection '{COLLECTION}'")

    problems = load_problems()
    print(f"Indexing {len(problems)} problems...")

    texts = [build_embed_text(p) for p in problems]
    result = await voyage.embed(texts=texts, model=EMBEDDING_MODEL, input_type="document")

    points = [
        PointStruct(
            id=str(uuid.UUID(p["id"])),
            vector=vector,
            payload={
                "problem_id": p["id"],
                "slug": p["slug"],
                "title": p["title"],
                "difficulty": p["difficulty"],
                "patterns": p.get("patterns", []),
                "problem_statement": p.get("descriptionHtml", ""),
                "canonical_solutions": p.get("canonicalSolutions", []),
                "editorial": p.get("editorial", {}),
            },
        )
        for p, vector in zip(problems, result.embeddings, strict=True)
    ]

    await qdrant.upsert(collection_name=COLLECTION, points=points)
    print(f"Indexed {len(points)} problems into Qdrant.")


if __name__ == "__main__":
    asyncio.run(main())
