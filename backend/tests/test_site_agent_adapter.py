from __future__ import annotations

import json
import asyncio
from types import SimpleNamespace
from typing import Any

import pytest
from services.site_agent.adapter import SiteAgentAdapter, SiteAgentQuery
from services.site_agent.context import SiteRequestContext
from services.site_agent.context import resolve_site_request_context
from services.site_agent.tool_bridge import build_site_tool_registry
from services.site_agent.tool_bridge import capability_id_to_tool_name

from services.auth import create_token
from services.site_agent.runtime_loader import SUPERHAOJUN_SRC_PATH
import sys

superhaojun_src = str(SUPERHAOJUN_SRC_PATH)
if superhaojun_src not in sys.path:
    sys.path.insert(0, superhaojun_src)

from superhaojun.bus import MessageBus
from superhaojun.messages import AgentEnd, AgentStart, TextDelta, ToolCallEnd, ToolCallStart, TurnEnd, TurnStart


def _parse_tool_result(events: list[dict[str, Any]]) -> dict[str, Any]:
    tool_end_events = [
        event["event"]
        for event in events
        if event["type"] == "runtime_event" and event["event"]["type"] == "tool_call_end"
    ]
    assert tool_end_events, "expected at least one tool_call_end event"
    return json.loads(tool_end_events[-1]["result"])


class _FakePromptBuilder:
    def __init__(self) -> None:
        self._custom_instructions = ""
        self._tool_summaries: list[dict[str, str]] = []
        self.invalidations = 0

    def invalidate(self) -> None:
        self.invalidations += 1


class _FakePermissionChecker:
    def __init__(self) -> None:
        self.allowed_tools: list[str] = []

    def allow_always(self, tool_name: str) -> None:
        self.allowed_tools.append(tool_name)


class _FakeAgent:
    def __init__(self, bus: MessageBus, registry: Any, prompt_builder: _FakePromptBuilder) -> None:
        self.bus = bus
        self.registry = registry
        self.prompt_builder = prompt_builder
        self.permission_checker = _FakePermissionChecker()
        self.tool_orchestrator = SimpleNamespace(registry=registry)

    async def handle_user_message(self, user_input: str) -> None:
        await self.bus.emit(AgentStart())
        await self.bus.emit(TurnStart())

        if user_input.startswith("tool:"):
            payload = user_input.removeprefix("tool:")
            tool_name, _, raw_arguments = payload.partition(" ")
            arguments = json.loads(raw_arguments) if raw_arguments else {}
            tool_call_id = "call-1"
            tool = self.registry.get(tool_name)
            assert tool is not None, f"unknown tool requested in fake runtime: {tool_name}"
            await self.bus.emit(
                ToolCallStart(
                    tool_call_id=tool_call_id,
                    tool_name=tool_name,
                    arguments=arguments,
                )
            )
            result = await tool.execute(**arguments)
            await self.bus.emit(
                ToolCallEnd(
                    tool_call_id=tool_call_id,
                    tool_name=tool_name,
                    result=result,
                )
            )
        else:
            await self.bus.emit(TextDelta(text=f"echo:{user_input}"))

        await self.bus.emit(TurnEnd(finish_reason="stop"))
        await self.bus.emit(AgentEnd())

    async def close(self) -> None:
        return None


class _FakeRuntime:
    def __init__(self) -> None:
        self.bus = MessageBus()
        self.tool_registry = SimpleNamespace(
            _tools={},
            register=lambda tool: self.tool_registry._tools.__setitem__(tool.name, tool),
            get=lambda name: self.tool_registry._tools.get(name),
            to_openai_tools=lambda: [tool.to_openai_tool() for tool in self.tool_registry._tools.values()],
            __len__=lambda self_registry=None: len(self.tool_registry._tools),
        )
        self.prompt_builder = _FakePromptBuilder()
        self.agent = _FakeAgent(self.bus, self.tool_registry, self.prompt_builder)
        self.mcp_manager = SimpleNamespace(set_tool_registry=lambda registry: None)


def _build_fake_runtime(*, working_dir: str) -> _FakeRuntime:
    return _FakeRuntime()


class _FailingAgent:
    def __init__(self, bus: MessageBus, registry: Any, prompt_builder: _FakePromptBuilder) -> None:
        self.bus = bus
        self.registry = registry
        self.prompt_builder = prompt_builder
        self.permission_checker = _FakePermissionChecker()
        self.tool_orchestrator = SimpleNamespace(registry=registry)

    async def handle_user_message(self, user_input: str) -> None:
        raise RuntimeError("agent exploded before emitting events")

    async def close(self) -> None:
        return None


class _FailingRuntime(_FakeRuntime):
    def __init__(self) -> None:
        super().__init__()
        self.agent = _FailingAgent(self.bus, self.tool_registry, self.prompt_builder)


def _build_failing_runtime(*, working_dir: str) -> _FailingRuntime:
    return _FailingRuntime()


async def _collect_events(
    adapter: SiteAgentAdapter,
    query: SiteAgentQuery,
    *,
    ideas_store: Any,
    workflow_runs_store: Any,
) -> list[dict[str, Any]]:
    return [
        event
        async for event in adapter.stream_query(
            query,
            ideas_store=ideas_store,
            workflow_runs_store=workflow_runs_store,
        )
    ]


@pytest.mark.asyncio
async def test_anonymous_request_can_use_read_only_site_intro_and_navigation_paths(
    ideas_store,
    workflow_runs_store,
) -> None:
    adapter = SiteAgentAdapter(runtime_builder=_build_fake_runtime)

    intro_events = await _collect_events(
        adapter,
        SiteAgentQuery(
            message=f"tool:{capability_id_to_tool_name('site.intro')} {{}}",
            route="/",
        ),
        ideas_store=ideas_store,
        workflow_runs_store=workflow_runs_store,
    )
    navigate_events = await _collect_events(
        adapter,
        SiteAgentQuery(
            message=(
                f"tool:{capability_id_to_tool_name('site.navigate')} "
                '{"query":"show me the ideas page"}'
            ),
            route="/",
        ),
        ideas_store=ideas_store,
        workflow_runs_store=workflow_runs_store,
    )

    intro_result = _parse_tool_result(intro_events)
    navigate_result = _parse_tool_result(navigate_events)

    assert intro_result["ok"] is True
    assert intro_result["capability_id"] == "site.intro"
    assert navigate_result["ok"] is True
    assert navigate_result["capability_id"] == "site.navigate"
    assert navigate_result["route"] == "/ideas"


def test_ideas_route_context_injects_ideas_read() -> None:
    context = resolve_site_request_context(route="/ideas")

    assert context.page_type == "ideas"
    assert "ideas-read" in context.inline_capability_groups


def test_superhaojun_route_context_exposes_the_broader_agent_surface() -> None:
    context = resolve_site_request_context(route="/superhaojun")

    assert context.page_type == "superhaojun"
    assert set(context.inline_capability_groups) == {
        "using-personal-web",
        "ideas-read",
        "ideas-workflow",
        "content-read",
    }


@pytest.mark.asyncio
async def test_content_read_capabilities_have_an_executable_path(
    ideas_store,
    workflow_runs_store,
) -> None:
    adapter = SiteAgentAdapter(runtime_builder=_build_fake_runtime)

    daily_nuance_events = await _collect_events(
        adapter,
        SiteAgentQuery(
            message=f"tool:{capability_id_to_tool_name('content.daily_nuance.latest')} {{}}",
            route="/daily-nuance",
        ),
        ideas_store=ideas_store,
        workflow_runs_store=workflow_runs_store,
    )
    skill_marketplace_events = await _collect_events(
        adapter,
        SiteAgentQuery(
            message=f"tool:{capability_id_to_tool_name('content.skill_marketplace.catalog')} {{}}",
            route="/skill-marketplace",
        ),
        ideas_store=ideas_store,
        workflow_runs_store=workflow_runs_store,
    )

    daily_nuance_result = _parse_tool_result(daily_nuance_events)
    skill_marketplace_result = _parse_tool_result(skill_marketplace_events)

    assert daily_nuance_result["ok"] is True
    assert daily_nuance_result["capability_id"] == "content.daily_nuance.latest"
    assert daily_nuance_result["snapshot_date"]
    assert skill_marketplace_result["ok"] is True
    assert skill_marketplace_result["capability_id"] == "content.skill_marketplace.catalog"
    assert skill_marketplace_result["count"] > 0


@pytest.mark.asyncio
async def test_workflow_start_without_auth_is_rejected_clearly(
    ideas_store,
    workflow_runs_store,
) -> None:
    adapter = SiteAgentAdapter(runtime_builder=_build_fake_runtime)

    events = await _collect_events(
        adapter,
        SiteAgentQuery(
            message=(
                f"tool:{capability_id_to_tool_name('ideas.workflow.start')} "
                '{"direction":"developer tools"}'
            ),
            route="/ideas",
        ),
        ideas_store=ideas_store,
        workflow_runs_store=workflow_runs_store,
    )

    result = _parse_tool_result(events)

    assert result["ok"] is False
    assert result["capability_id"] == "ideas.workflow.start"
    assert result["error_code"] == "auth_required"


@pytest.mark.asyncio
async def test_agent_failure_before_bus_events_returns_structured_error_and_terminates(
    ideas_store,
    workflow_runs_store,
) -> None:
    adapter = SiteAgentAdapter(runtime_builder=_build_failing_runtime)

    events = await asyncio.wait_for(
        _collect_events(
            adapter,
            SiteAgentQuery(message="hello", route="/"),
            ideas_store=ideas_store,
            workflow_runs_store=workflow_runs_store,
        ),
        timeout=1,
    )

    assert events == [
        {
            "type": "runtime_error",
            "error_type": "RuntimeError",
            "message": "agent exploded before emitting events",
        }
    ]


def test_adapter_only_auto_allows_read_tools(
    ideas_store,
    workflow_runs_store,
) -> None:
    adapter = SiteAgentAdapter(runtime_builder=_build_fake_runtime)
    runtime = _build_fake_runtime(working_dir=adapter.working_dir)
    context = SiteRequestContext(
        route="/ideas",
        page_type="ideas",
        visible_entity_id=None,
        visible_entity_slug=None,
        is_authenticated=False,
        is_admin=False,
        inline_capability_groups=("using-personal-web", "ideas-read", "ideas-workflow"),
        bearer_token_subject=None,
    )

    runtime.tool_registry = build_site_tool_registry(
        capability_ids=adapter._select_capability_ids(context),
        context=context,
        ideas_store=ideas_store,
        workflow_runs_store=workflow_runs_store,
    )

    adapter._attach_runtime_registry(runtime)

    assert capability_id_to_tool_name("site.intro") in runtime.agent.permission_checker.allowed_tools
    assert capability_id_to_tool_name("ideas.list") in runtime.agent.permission_checker.allowed_tools
    assert capability_id_to_tool_name("ideas.workflow.start") not in runtime.agent.permission_checker.allowed_tools
    assert capability_id_to_tool_name("ideas.workflow.get_run") not in runtime.agent.permission_checker.allowed_tools


@pytest.mark.asyncio
async def test_agent_event_stream_includes_structured_runtime_events_and_capability_results(
    app,
    ideas_store,
    workflow_runs_store,
) -> None:
    app.state.site_agent_adapter = SiteAgentAdapter(runtime_builder=_build_fake_runtime)
    token, _ = create_token("admin")

    from httpx import ASGITransport, AsyncClient

    events: list[dict[str, Any]] = []
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        async with client.stream(
            "POST",
            "/api/agent/query",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "message": f"tool:{capability_id_to_tool_name('site.intro')} {{}}",
                "route": "/ideas",
            },
        ) as response:
            assert response.status_code == 200
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                events.append(json.loads(line[6:]))

    runtime_event_types = [
        event["event"]["type"]
        for event in events
        if event["type"] == "runtime_event"
    ]
    result = _parse_tool_result(events)

    assert "agent_start" in runtime_event_types
    assert "turn_start" in runtime_event_types
    assert "tool_call_start" in runtime_event_types
    assert "tool_call_end" in runtime_event_types
    assert "agent_end" in runtime_event_types
    assert result["ok"] is True
    assert result["capability_id"] == "site.intro"
