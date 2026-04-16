from __future__ import annotations

from models.idea import IdeaCategory, IdeaStatus
from services.site_agent.context import SiteRequestContext


async def list_ideas(
    context: SiteRequestContext,
    ideas_store,
    *,
    status: str | None = None,
    category: str | None = None,
) -> dict:
    status_filter = IdeaStatus(status) if status else None
    category_filter = IdeaCategory(category) if category else None
    ideas = await ideas_store.list_ideas(status=status_filter, category=category_filter)
    return {
        "ok": True,
        "capability_id": "ideas.list",
        "route": context.route,
        "count": len(ideas),
        "ideas": [idea.model_dump(mode="json") for idea in ideas],
    }


async def get_idea(
    context: SiteRequestContext,
    ideas_store,
    *,
    idea_id: str | None = None,
    slug: str | None = None,
) -> dict:
    target_id = idea_id or context.visible_entity_id
    if target_id:
        idea = await ideas_store.get_idea(target_id)
    else:
        idea = await _get_idea_by_slug(ideas_store, slug or context.visible_entity_slug)

    if idea is None:
        return {
            "ok": False,
            "capability_id": "ideas.get",
            "error_code": "not_found",
            "message": "Idea not found.",
            "idea_id": target_id,
            "slug": slug or context.visible_entity_slug,
        }

    return {
        "ok": True,
        "capability_id": "ideas.get",
        "idea": idea.model_dump(mode="json"),
    }


async def get_ideas_meta(context: SiteRequestContext, ideas_store) -> dict:
    meta = await ideas_store.get_meta()
    return {
        "ok": True,
        "capability_id": "ideas.meta",
        "route": context.route,
        **meta,
    }


async def start_workflow_transition(
    context: SiteRequestContext,
    *,
    direction: str = "",
) -> dict:
    if not context.is_admin:
        return {
            "ok": False,
            "capability_id": "ideas.workflow.start",
            "error_code": "auth_required",
            "message": "Starting the ideas workflow requires an authenticated admin session.",
            "route": "/ideas",
        }

    return {
        "ok": True,
        "capability_id": "ideas.workflow.start",
        "status": "transition_required",
        "route": "/ideas",
        "direction": direction,
        "message": (
            "Workflow start is authorized for this session, but this Task 3 slice keeps execution "
            "on the Ideas page rather than launching a background run from /api/agent/query."
        ),
        "next_action": {
            "type": "open_ideas_workflow",
            "route": "/ideas",
            "direction": direction,
        },
    }


async def get_workflow_run(
    context: SiteRequestContext,
    workflow_runs_store,
    *,
    run_id: str,
) -> dict:
    if not context.is_admin:
        return {
            "ok": False,
            "capability_id": "ideas.workflow.get_run",
            "error_code": "auth_required",
            "message": "Workflow run lookup requires an authenticated admin session.",
            "run_id": run_id,
        }

    run = await workflow_runs_store.get_run(run_id)
    if run is None:
        return {
            "ok": False,
            "capability_id": "ideas.workflow.get_run",
            "error_code": "not_found",
            "message": "Workflow run not found.",
            "run_id": run_id,
        }

    return {
        "ok": True,
        "capability_id": "ideas.workflow.get_run",
        "run": run.model_dump(mode="json"),
    }


async def _get_idea_by_slug(ideas_store, slug: str | None):
    if not slug:
        return None
    for idea in await ideas_store.list_ideas():
        idea_slug = idea.title.lower().replace(" ", "-")
        if idea_slug == slug:
            return idea
    return None
