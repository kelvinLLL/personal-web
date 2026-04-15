from __future__ import annotations

import json

import httpx

from config import model_registry

# ── Runtime model override (switchable from WebUI / API) ────────────────

_active_model_key: str | None = None


def get_active_model_key() -> str:
    return _active_model_key or model_registry.default_model_key


def set_active_model_key(key: str) -> None:
    global _active_model_key
    # Validate
    model_registry.resolve(key)
    _active_model_key = key


def _resolve(model_key: str | None = None) -> tuple[str, str, str]:
    """Resolve (base_url, api_key, model_id) using active or explicit key."""
    return model_registry.resolve(model_key or get_active_model_key())


async def chat_completion(
    messages: list[dict],
    model_key: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    response_format: dict | None = None,
) -> str:
    """Call OpenAI-compatible chat endpoint. Returns assistant message content."""
    base_url, api_key, model_id = _resolve(model_key)

    payload: dict = {
        "model": model_id,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        payload["response_format"] = response_format

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{base_url}/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {api_key}"},
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def chat_completion_json(
    messages: list[dict],
    model_key: str | None = None,
) -> dict:
    """Chat completion that returns parsed JSON."""
    content = await chat_completion(
        messages,
        model_key=model_key,
        response_format={"type": "json_object"},
    )
    return json.loads(content)


async def proxy_chat(
    messages: list[dict],
    model_key: str | None = None,
    stream: bool = False,
    **kwargs,
) -> httpx.Response:
    """Proxy a chat request to the configured AI provider."""
    base_url, api_key, model_id = _resolve(model_key)

    payload = {
        "model": model_id,
        "messages": messages,
        "stream": stream,
        **kwargs,
    }

    client = httpx.AsyncClient(timeout=120)
    response = await client.send(
        client.build_request(
            "POST",
            f"{base_url}/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {api_key}"},
        ),
        stream=stream,
    )
    return response
