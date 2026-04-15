from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.ai import proxy_chat
from services.auth import CurrentUser

router = APIRouter(prefix="/api/proxy", tags=["proxy"])


class ChatRequest(BaseModel):
    messages: list[dict]
    model_key: str | None = None
    stream: bool = False
    temperature: float | None = None
    max_tokens: int | None = None


@router.post("/chat")
async def proxy_chat_endpoint(body: ChatRequest, _user: CurrentUser):
    kwargs = {}
    if body.temperature is not None:
        kwargs["temperature"] = body.temperature
    if body.max_tokens is not None:
        kwargs["max_tokens"] = body.max_tokens

    try:
        response = await proxy_chat(
            messages=body.messages,
            model_key=body.model_key,
            stream=body.stream,
            **kwargs,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI provider error: {e}")

    if body.stream:

        async def stream_body():
            async for chunk in response.aiter_bytes():
                yield chunk
            await response.aclose()

        return StreamingResponse(
            stream_body(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache"},
        )

    data = response.json()
    await response.aclose()
    return data
