from __future__ import annotations

import json
from importlib import import_module
from typing import Any

from services.site_agent.capability_handlers import SiteCapabilityHandler, get_capability_handler
from services.site_agent.context import SiteRequestContext
from services.site_agent.runtime_loader import load_superhaojun_build_runtime


def capability_id_to_tool_name(capability_id: str) -> str:
    return capability_id.replace(".", "__")


def tool_name_to_capability_id(tool_name: str) -> str:
    return tool_name.replace("__", ".")


def build_site_tool_registry(
    *,
    capability_ids: list[str],
    context: SiteRequestContext,
    ideas_store: Any,
    workflow_runs_store: Any,
):
    load_superhaojun_build_runtime()
    tool_base = import_module("superhaojun.tools.base").Tool
    tool_registry_cls = import_module("superhaojun.tools.registry").ToolRegistry

    class SiteCapabilityTool(tool_base):
        def __init__(
            self,
            *,
            handler: SiteCapabilityHandler,
            site_context: SiteRequestContext,
            ideas_store: Any,
            workflow_runs_store: Any,
        ) -> None:
            self._handler = handler
            self._site_context = site_context
            self._ideas_store = ideas_store
            self._workflow_runs_store = workflow_runs_store

        @property
        def name(self) -> str:
            return capability_id_to_tool_name(self._handler.capability_id)

        @property
        def description(self) -> str:
            return self._handler.description

        @property
        def parameters(self) -> dict[str, Any]:
            return self._handler.parameters

        @property
        def risk_level(self) -> str:
            return self._handler.risk_level

        async def execute(self, **kwargs: Any) -> str:
            result = await self._handler.execute(
                context=self._site_context,
                ideas_store=self._ideas_store,
                workflow_runs_store=self._workflow_runs_store,
                **kwargs,
            )
            return json.dumps(result, ensure_ascii=False, default=str)

    registry = tool_registry_cls()
    for capability_id in capability_ids:
        registry.register(
            SiteCapabilityTool(
                handler=get_capability_handler(capability_id),
                site_context=context,
                ideas_store=ideas_store,
                workflow_runs_store=workflow_runs_store,
            )
        )
    return registry
