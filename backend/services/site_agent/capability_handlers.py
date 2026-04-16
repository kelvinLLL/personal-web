from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from services.site_agent.capabilities.content import (
    get_daily_nuance_latest,
    get_skill_marketplace_catalog,
)
from services.site_agent.capabilities.ideas import (
    get_idea,
    get_ideas_meta,
    get_workflow_run,
    list_ideas,
    start_workflow_transition,
)
from services.site_agent.capabilities.site import get_site_intro, recommend_navigation
from services.site_agent.context import SiteRequestContext
from services.site_agent.registry import get_capability


CapabilityExecutor = Callable[..., Awaitable[dict[str, Any]]]


@dataclass(frozen=True, slots=True)
class SiteCapabilityHandler:
    capability_id: str
    description: str
    parameters: dict[str, Any]
    capability_groups: tuple[str, ...]
    risk_level: str
    executor: CapabilityExecutor

    async def execute(
        self,
        *,
        context: SiteRequestContext,
        ideas_store: Any,
        workflow_runs_store: Any,
        **kwargs: Any,
    ) -> dict[str, Any]:
        return await self.executor(
            context=context,
            ideas_store=ideas_store,
            workflow_runs_store=workflow_runs_store,
            **kwargs,
        )


async def _site_intro_executor(*, context: SiteRequestContext, **_: Any) -> dict[str, Any]:
    return await get_site_intro(context)


async def _site_navigation_executor(*, context: SiteRequestContext, query: str = "", **_: Any) -> dict[str, Any]:
    return await recommend_navigation(context, query=query)


async def _ideas_list_executor(
    *,
    context: SiteRequestContext,
    ideas_store: Any,
    status: str | None = None,
    category: str | None = None,
    **_: Any,
) -> dict[str, Any]:
    return await list_ideas(context, ideas_store, status=status, category=category)


async def _ideas_get_executor(
    *,
    context: SiteRequestContext,
    ideas_store: Any,
    idea_id: str | None = None,
    slug: str | None = None,
    **_: Any,
) -> dict[str, Any]:
    return await get_idea(context, ideas_store, idea_id=idea_id, slug=slug)


async def _ideas_meta_executor(*, context: SiteRequestContext, ideas_store: Any, **_: Any) -> dict[str, Any]:
    return await get_ideas_meta(context, ideas_store)


async def _workflow_start_executor(
    *,
    context: SiteRequestContext,
    direction: str = "",
    **_: Any,
) -> dict[str, Any]:
    return await start_workflow_transition(context, direction=direction)


async def _workflow_get_run_executor(
    *,
    context: SiteRequestContext,
    workflow_runs_store: Any,
    run_id: str,
    **_: Any,
) -> dict[str, Any]:
    return await get_workflow_run(context, workflow_runs_store, run_id=run_id)


async def _daily_nuance_executor(*, context: SiteRequestContext, **_: Any) -> dict[str, Any]:
    return await get_daily_nuance_latest(context)


async def _skill_marketplace_executor(*, context: SiteRequestContext, **_: Any) -> dict[str, Any]:
    return await get_skill_marketplace_catalog(context)


_HANDLERS: tuple[SiteCapabilityHandler, ...] = (
    SiteCapabilityHandler(
        capability_id="site.intro",
        description=get_capability("site.intro").description if get_capability("site.intro") else "Site intro",
        parameters={"type": "object", "properties": {}, "additionalProperties": False},
        capability_groups=("using-personal-web",),
        risk_level="read",
        executor=_site_intro_executor,
    ),
    SiteCapabilityHandler(
        capability_id="site.navigate",
        description=get_capability("site.navigate").description if get_capability("site.navigate") else "Site navigation",
        parameters={
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": [],
            "additionalProperties": False,
        },
        capability_groups=("using-personal-web",),
        risk_level="read",
        executor=_site_navigation_executor,
    ),
    SiteCapabilityHandler(
        capability_id="ideas.list",
        description=get_capability("ideas.list").description if get_capability("ideas.list") else "List ideas",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "category": {"type": "string"},
            },
            "required": [],
            "additionalProperties": False,
        },
        capability_groups=("ideas-read",),
        risk_level="read",
        executor=_ideas_list_executor,
    ),
    SiteCapabilityHandler(
        capability_id="ideas.get",
        description=get_capability("ideas.get").description if get_capability("ideas.get") else "Get one idea",
        parameters={
            "type": "object",
            "properties": {
                "idea_id": {"type": "string"},
                "slug": {"type": "string"},
            },
            "required": [],
            "additionalProperties": False,
        },
        capability_groups=("ideas-read",),
        risk_level="read",
        executor=_ideas_get_executor,
    ),
    SiteCapabilityHandler(
        capability_id="ideas.meta",
        description=get_capability("ideas.meta").description if get_capability("ideas.meta") else "Ideas meta",
        parameters={"type": "object", "properties": {}, "additionalProperties": False},
        capability_groups=("ideas-read",),
        risk_level="read",
        executor=_ideas_meta_executor,
    ),
    SiteCapabilityHandler(
        capability_id="ideas.workflow.start",
        description=(
            get_capability("ideas.workflow.start").description
            if get_capability("ideas.workflow.start")
            else "Start ideas workflow"
        ),
        parameters={
            "type": "object",
            "properties": {"direction": {"type": "string"}},
            "required": [],
            "additionalProperties": False,
        },
        capability_groups=("ideas-workflow",),
        risk_level="write",
        executor=_workflow_start_executor,
    ),
    SiteCapabilityHandler(
        capability_id="ideas.workflow.get_run",
        description=(
            get_capability("ideas.workflow.get_run").description
            if get_capability("ideas.workflow.get_run")
            else "Get workflow run"
        ),
        parameters={
            "type": "object",
            "properties": {"run_id": {"type": "string"}},
            "required": ["run_id"],
            "additionalProperties": False,
        },
        capability_groups=("ideas-workflow",),
        risk_level="write",
        executor=_workflow_get_run_executor,
    ),
    SiteCapabilityHandler(
        capability_id="content.daily_nuance.latest",
        description=(
            get_capability("content.daily_nuance.latest").description
            if get_capability("content.daily_nuance.latest")
            else "Read daily nuance"
        ),
        parameters={"type": "object", "properties": {}, "additionalProperties": False},
        capability_groups=("content-read",),
        risk_level="read",
        executor=_daily_nuance_executor,
    ),
    SiteCapabilityHandler(
        capability_id="content.skill_marketplace.catalog",
        description=(
            get_capability("content.skill_marketplace.catalog").description
            if get_capability("content.skill_marketplace.catalog")
            else "Read skill marketplace catalog"
        ),
        parameters={"type": "object", "properties": {}, "additionalProperties": False},
        capability_groups=("content-read",),
        risk_level="read",
        executor=_skill_marketplace_executor,
    ),
)

_HANDLERS_BY_ID = {handler.capability_id: handler for handler in _HANDLERS}


def get_capability_handler(capability_id: str) -> SiteCapabilityHandler:
    return _HANDLERS_BY_ID[capability_id]


def list_capability_handlers() -> tuple[SiteCapabilityHandler, ...]:
    return _HANDLERS
