from __future__ import annotations

import json

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.auth import OptionalCredentials, verify_token
from services.site_agent.adapter import SiteAgentAdapter, SiteAgentQuery


router = APIRouter(prefix="/api/agent", tags=["agent"])


class AgentQueryRequest(BaseModel):
    message: str
    route: str
    visible_entity_id: str | None = None
    visible_entity_slug: str | None = None


@router.post("/query")
async def query_agent(
    body: AgentQueryRequest,
    request: Request,
    credentials: OptionalCredentials,
):
    subject = verify_token(credentials.credentials) if credentials is not None else None
    adapter: SiteAgentAdapter = getattr(request.app.state, "site_agent_adapter", SiteAgentAdapter())

    async def generate():
        async for event in adapter.stream_query(
            SiteAgentQuery(
                message=body.message,
                route=body.route,
                visible_entity_id=body.visible_entity_id,
                visible_entity_slug=body.visible_entity_slug,
                bearer_token_subject=subject,
            ),
            ideas_store=request.app.state.ideas_store,
            workflow_runs_store=request.app.state.workflow_runs_store,
        ):
            yield f"data: {json.dumps(event, ensure_ascii=False, default=str)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
