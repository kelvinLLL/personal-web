from __future__ import annotations

from services.site_agent.context import SiteRequestContext


SITE_ROUTES: tuple[dict[str, str], ...] = (
    {"id": "home", "title": "Home", "route": "/"},
    {"id": "ideas", "title": "Ideas", "route": "/ideas"},
    {"id": "daily-nuance", "title": "Daily Nuance", "route": "/daily-nuance"},
    {"id": "skill-marketplace", "title": "Skill Marketplace", "route": "/skill-marketplace"},
    {"id": "book-reader", "title": "Book Reader", "route": "/book-reader"},
    {"id": "settings", "title": "Settings", "route": "/settings"},
)


async def get_site_intro(context: SiteRequestContext) -> dict:
    return {
        "ok": True,
        "capability_id": "site.intro",
        "route": context.route,
        "page_type": context.page_type,
        "is_authenticated": context.is_authenticated,
        "is_admin": context.is_admin,
        "message": (
            "The website agent can introduce the site, recommend navigation, read ideas data, "
            "and read shipped content snapshots. Workflow actions stay auth-gated."
        ),
        "available_routes": list(SITE_ROUTES),
        "inline_capability_groups": list(context.inline_capability_groups),
    }


async def recommend_navigation(
    context: SiteRequestContext,
    *,
    query: str = "",
) -> dict:
    lowered = query.lower()
    recommendation = _recommend_route(lowered)
    return {
        "ok": True,
        "capability_id": "site.navigate",
        "route": recommendation["route"],
        "title": recommendation["title"],
        "reason": recommendation["reason"],
        "from_route": context.route,
        "query": query,
    }


def _recommend_route(query: str) -> dict[str, str]:
    if any(term in query for term in ("idea", "ideas", "project")):
        return {
            "route": "/ideas",
            "title": "Ideas",
            "reason": "The Ideas page is the best fit for browsing project ideas and workflow entrypoints.",
        }
    if any(term in query for term in ("nuance", "trend", "daily")):
        return {
            "route": "/daily-nuance",
            "title": "Daily Nuance",
            "reason": "Daily Nuance is the shipped snapshot for current curated signal reading.",
        }
    if any(term in query for term in ("skill", "marketplace", "plugin")):
        return {
            "route": "/skill-marketplace",
            "title": "Skill Marketplace",
            "reason": "Skill Marketplace is the best route for browsing curated skills and plugins.",
        }
    if any(term in query for term in ("book", "reader")):
        return {
            "route": "/book-reader",
            "title": "Book Reader",
            "reason": "Book Reader is the best route for deeper reading flows.",
        }
    return {
        "route": "/",
        "title": "Home",
        "reason": "Home is the safest landing point when the request does not point to a more specific surface.",
    }
