from __future__ import annotations

import httpx

from config import settings


async def tavily_search(query: str, max_results: int = 5) -> list[dict]:
    """Search using Tavily API. Returns list of {title, url, content}."""
    if not settings.tavily_api_key:
        return []

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": settings.tavily_api_key,
                "query": query,
                "max_results": max_results,
                "search_depth": "basic",
            },
        )
        response.raise_for_status()
        data = response.json()
        return data.get("results", [])
