from litellm import acompletion

from src.core.config import settings


async def chat(
    messages: list[dict],
    model: str | None = None,
    stream: bool = False,
    max_tokens: int | None = None,
) -> object:
    return await acompletion(
        model=model or settings.default_model,
        messages=messages,
        stream=stream,
        max_tokens=max_tokens or settings.max_tokens_per_request,
        api_base=settings.litellm_base_url,
        api_key=settings.litellm_api_key,
    )
