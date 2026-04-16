from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class SiteRequestContext:
    route: str
    page_type: str
    visible_entity_id: str | None
    visible_entity_slug: str | None
    is_authenticated: bool
    is_admin: bool
    inline_capability_groups: tuple[str, ...]
    bearer_token_subject: str | None


def resolve_site_request_context(
    *,
    route: str,
    visible_entity_id: str | None = None,
    visible_entity_slug: str | None = None,
    bearer_token_subject: str | None = None,
) -> SiteRequestContext:
    normalized_route = _normalize_route(route)
    page_type = _resolve_page_type(normalized_route)
    inline_capability_groups = _resolve_inline_groups(page_type)
    is_authenticated = bearer_token_subject is not None
    is_admin = bearer_token_subject == "admin"

    route_entity_id, route_entity_slug = _extract_visible_entity(normalized_route)

    return SiteRequestContext(
        route=normalized_route,
        page_type=page_type,
        visible_entity_id=visible_entity_id or route_entity_id,
        visible_entity_slug=visible_entity_slug or route_entity_slug,
        is_authenticated=is_authenticated,
        is_admin=is_admin,
        inline_capability_groups=inline_capability_groups,
        bearer_token_subject=bearer_token_subject,
    )


def _normalize_route(route: str) -> str:
    trimmed = (route or "/").strip()
    if not trimmed:
        return "/"
    if not trimmed.startswith("/"):
        trimmed = f"/{trimmed}"
    if len(trimmed) > 1:
        trimmed = trimmed.rstrip("/")
    return trimmed or "/"


def _resolve_page_type(route: str) -> str:
    if route == "/":
        return "home"
    if route.startswith("/ideas"):
        return "ideas"
    if route.startswith("/daily-nuance"):
        return "daily-nuance"
    if route.startswith("/skill-marketplace"):
        return "skill-marketplace"
    if route.startswith("/book-reader"):
        return "book-reader"
    if route.startswith("/settings"):
        return "settings"
    return "generic"


def _resolve_inline_groups(page_type: str) -> tuple[str, ...]:
    groups = ["using-personal-web"]
    if page_type == "ideas":
        groups.extend(["ideas-read", "ideas-workflow"])
    elif page_type in {"daily-nuance", "skill-marketplace"}:
        groups.append("content-read")
    return tuple(groups)


def _extract_visible_entity(route: str) -> tuple[str | None, str | None]:
    if not route.startswith("/ideas/"):
        return None, None

    entity_hint = route.removeprefix("/ideas/").strip("/")
    if not entity_hint:
        return None, None

    if all(ch.isdigit() or ch == "-" for ch in entity_hint):
        return entity_hint, None
    return None, entity_hint
