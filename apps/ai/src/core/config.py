from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    litellm_base_url: str = "http://localhost:4000"
    litellm_api_key: str = ""

    voyage_api_key: str = ""
    embedding_model: str = "voyage-code-3"

    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection: str = "code_embeddings"

    redis_url: str = "redis://localhost:6379"

    api_url: str = "http://localhost:3001"

    default_model: str = "openrouter/deepseek/deepseek-chat"
    max_tokens_per_request: int = 4096
    token_budget_per_user_day: int = 50_000


settings = Settings()
