from functools import lru_cache

from src.services.rag.embedder import Embedder
from src.services.rag.retriever import Retriever


@lru_cache
def get_embedder() -> Embedder:
    return Embedder()


@lru_cache
def get_retriever() -> Retriever:
    return Retriever()
