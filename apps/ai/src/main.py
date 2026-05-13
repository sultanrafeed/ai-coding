from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams

from src.api.routes import ai, embeddings, health
from src.core.config import settings
from src.core.logging import configure_logging

EMBEDDING_DIM = 1024  # voyage-code-3 output dimension


async def _ensure_qdrant_collection() -> None:
    client = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key or None)
    try:
        existing = {c.name for c in (await client.get_collections()).collections}
        if settings.qdrant_collection not in existing:
            await client.create_collection(
                collection_name=settings.qdrant_collection,
                vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
            )
    finally:
        await client.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    await _ensure_qdrant_collection()
    yield


app = FastAPI(
    title="AI Coding Platform — AI Service",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.api_url],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(embeddings.router, prefix="/embeddings", tags=["embeddings"])
