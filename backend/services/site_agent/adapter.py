from __future__ import annotations

import asyncio
from dataclasses import dataclass
from importlib import import_module
from pathlib import Path
from typing import Any, AsyncGenerator, Callable

from pydantic import BaseModel

from services.site_agent.context import SiteRequestContext, resolve_site_request_context
from services.site_agent.runtime_loader import REPO_ROOT, load_superhaojun_build_runtime
from services.site_agent.tool_bridge import build_site_tool_registry


SKILL_FILES = {
    "using-personal-web": "using-personal-web.md",
    "ideas-read": "ideas-read.md",
    "ideas-workflow": "ideas-workflow.md",
    "content-read": "content-read.md",
}
SKILL_ROOT = Path(__file__).resolve().parent / "skills"


class SiteAgentQuery(BaseModel):
    message: str
    route: str
    visible_entity_id: str | None = None
    visible_entity_slug: str | None = None
    bearer_token_subject: str | None = None


@dataclass(slots=True)
class SiteAgentAdapter:
    runtime_builder: Callable[..., Any] | None = None
    working_dir: str = str(REPO_ROOT)

    async def stream_query(
        self,
        query: SiteAgentQuery,
        *,
        ideas_store: Any,
        workflow_runs_store: Any,
    ) -> AsyncGenerator[dict[str, Any], None]:
        context = resolve_site_request_context(
            route=query.route,
            visible_entity_id=query.visible_entity_id,
            visible_entity_slug=query.visible_entity_slug,
            bearer_token_subject=query.bearer_token_subject,
        )
        runtime = self._build_runtime()
        runtime.tool_registry = build_site_tool_registry(
            capability_ids=self._select_capability_ids(context),
            context=context,
            ideas_store=ideas_store,
            workflow_runs_store=workflow_runs_store,
        )
        self._attach_runtime_registry(runtime)
        self._inject_runtime_instructions(runtime, context)

        queue: asyncio.Queue[dict[str, Any] | None] = asyncio.Queue()
        handlers = self._attach_bus_forwarders(runtime, queue)

        agent_task = asyncio.create_task(runtime.agent.handle_user_message(query.message))
        try:
            while True:
                if agent_task.done() and queue.empty():
                    break
                item = await queue.get()
                if item is None:
                    break
                yield item
        finally:
            if not agent_task.done():
                await agent_task
            self._detach_bus_forwarders(runtime, handlers)
            await self._close_runtime(runtime)

    def _build_runtime(self):
        runtime_builder = self.runtime_builder or load_superhaojun_build_runtime()
        return runtime_builder(working_dir=self.working_dir)

    def _select_capability_ids(self, context: SiteRequestContext) -> list[str]:
        capability_ids = ["site.intro", "site.navigate"]
        if context.page_type == "ideas":
            capability_ids.extend(
                [
                    "ideas.list",
                    "ideas.get",
                    "ideas.meta",
                    "ideas.workflow.start",
                    "ideas.workflow.get_run",
                ]
            )
        elif context.page_type == "daily-nuance":
            capability_ids.append("content.daily_nuance.latest")
        elif context.page_type == "skill-marketplace":
            capability_ids.append("content.skill_marketplace.catalog")
        return capability_ids

    def _attach_runtime_registry(self, runtime: Any) -> None:
        runtime.agent.registry = runtime.tool_registry
        if hasattr(runtime.agent, "tool_orchestrator"):
            runtime.agent.tool_orchestrator.registry = runtime.tool_registry
        permission_checker = getattr(runtime.agent, "permission_checker", None)
        if permission_checker is not None:
            for tool_def in runtime.tool_registry.to_openai_tools():
                permission_checker.allow_always(tool_def["function"]["name"])
        mcp_manager = getattr(runtime, "mcp_manager", None)
        if mcp_manager is not None and hasattr(mcp_manager, "set_tool_registry"):
            mcp_manager.set_tool_registry(runtime.tool_registry)

    def _inject_runtime_instructions(self, runtime: Any, context: SiteRequestContext) -> None:
        prompt_builder = getattr(runtime, "prompt_builder", None)
        if prompt_builder is None:
            return

        skill_groups = list(dict.fromkeys(context.inline_capability_groups))
        skill_text = "\n\n".join(self._read_skill_text(group) for group in skill_groups if group in SKILL_FILES)
        instructions = (
            "Website adapter context:\n"
            f"- Route: {context.route}\n"
            f"- Page type: {context.page_type}\n"
            f"- Visible entity id: {context.visible_entity_id or 'none'}\n"
            f"- Visible entity slug: {context.visible_entity_slug or 'none'}\n"
            f"- Authenticated: {context.is_authenticated}\n"
            f"- Admin: {context.is_admin}\n"
            f"- Inline capability groups: {', '.join(context.inline_capability_groups) or 'none'}\n\n"
            "Loaded website skills:\n"
            f"{skill_text}"
        )
        if hasattr(prompt_builder, "_custom_instructions"):
            prompt_builder._custom_instructions = instructions
        if hasattr(prompt_builder, "_tool_summaries"):
            prompt_builder._tool_summaries = [
                {
                    "name": tool_def["function"]["name"],
                    "description": tool_def["function"].get("description", ""),
                }
                for tool_def in runtime.tool_registry.to_openai_tools()
            ]
        if hasattr(prompt_builder, "invalidate"):
            prompt_builder.invalidate()

    def _attach_bus_forwarders(self, runtime: Any, queue: asyncio.Queue[dict[str, Any] | None]):
        load_superhaojun_build_runtime()
        message_to_dict = import_module("superhaojun.messages").message_to_dict
        handlers: list[tuple[str, Callable[..., Any]]] = []
        bus = runtime.bus

        for event_type in (
            "text_delta",
            "tool_call_start",
            "tool_call_end",
            "permission_request",
            "turn_start",
            "turn_end",
            "agent_start",
            "agent_end",
            "error",
        ):
            def _handler(message: Any, *, _message_to_dict=message_to_dict):
                payload = {"type": "runtime_event", "event": _message_to_dict(message)}
                queue.put_nowait(payload)
                if getattr(message, "TYPE", "") == "agent_end":
                    queue.put_nowait(None)

            bus.on(event_type, _handler)
            handlers.append((event_type, _handler))

        return handlers

    def _detach_bus_forwarders(self, runtime: Any, handlers: list[tuple[str, Callable[..., Any]]]) -> None:
        bus = runtime.bus
        for event_type, handler in handlers:
            bus.off(event_type, handler)

    async def _close_runtime(self, runtime: Any) -> None:
        if hasattr(runtime, "shutdown"):
            await runtime.shutdown()
            return
        agent = getattr(runtime, "agent", None)
        if agent is not None and hasattr(agent, "close"):
            await agent.close()

    def _read_skill_text(self, skill_group: str) -> str:
        file_name = SKILL_FILES[skill_group]
        return (SKILL_ROOT / file_name).read_text(encoding="utf-8").strip()
