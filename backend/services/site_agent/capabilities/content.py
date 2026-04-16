from __future__ import annotations

import json
from pathlib import Path

from services.site_agent.context import SiteRequestContext


REPO_ROOT = Path(__file__).resolve().parents[4]
DAILY_NUANCE_LATEST_PATH = REPO_ROOT / "frontend" / "public" / "data" / "daily-nuance" / "latest.json"

SKILL_MARKETPLACE_CATALOG = {
    "snapshot_date": "2026-04-15",
    "entries": [
        {
            "id": "personal-sdd-feature-development",
            "slug": "sdd-feature-development",
            "name": "SDD Feature Development",
            "artifact_type": "skill",
            "owner_type": "personal",
            "summary": "A docs-first repo skill that keeps feature work anchored in living docs.",
            "categories": ["workflow", "documentation"],
            "compatibility": ["claude-code", "codex"],
            "featured": True,
        },
        {
            "id": "personal-curating-interesting-trends",
            "slug": "curating-interesting-trends",
            "name": "Curating Interesting Trends",
            "artifact_type": "skill",
            "owner_type": "personal",
            "summary": "A research curation workflow for turning scattered signals into ranked editorial output.",
            "categories": ["research", "documentation"],
            "compatibility": ["codex", "cross-compatible"],
            "featured": True,
        },
        {
            "id": "personal-test-driven-development",
            "slug": "test-driven-development",
            "name": "Test-Driven Development",
            "artifact_type": "skill",
            "owner_type": "personal",
            "summary": "A strict red-green-refactor loop that keeps feature work honest.",
            "categories": ["testing", "workflow"],
            "compatibility": ["claude-code", "codex", "cross-compatible"],
            "featured": False,
        },
        {
            "id": "community-vercel-platform-toolkit",
            "slug": "vercel-platform-toolkit",
            "name": "Vercel Platform Toolkit",
            "artifact_type": "plugin",
            "owner_type": "community",
            "summary": "A plugin-backed bundle for deployments, docs, and browser verification inside one workflow.",
            "categories": ["automation", "frontend"],
            "compatibility": ["codex"],
            "featured": True,
        },
        {
            "id": "community-openai-docs-skill",
            "slug": "openai-docs-skill",
            "name": "OpenAI Docs Skill",
            "artifact_type": "skill",
            "owner_type": "community",
            "summary": "A documentation-focused skill that biases toward official, current OpenAI sources.",
            "categories": ["documentation", "research"],
            "compatibility": ["codex", "cross-compatible"],
            "featured": True,
        },
        {
            "id": "community-playwright-mcp-toolkit",
            "slug": "playwright-mcp-toolkit",
            "name": "Playwright MCP Toolkit",
            "artifact_type": "plugin",
            "owner_type": "community",
            "summary": "A browser-automation pick for verifying end-to-end UI behavior instead of guessing from code alone.",
            "categories": ["testing", "automation", "frontend"],
            "compatibility": ["codex", "cross-compatible"],
            "featured": False,
        },
    ],
}


async def get_daily_nuance_latest(context: SiteRequestContext) -> dict:
    snapshot = json.loads(DAILY_NUANCE_LATEST_PATH.read_text(encoding="utf-8"))
    return {
        "ok": True,
        "capability_id": "content.daily_nuance.latest",
        "route": context.route,
        "snapshot_date": snapshot.get("snapshot_date"),
        "domains": snapshot.get("domains", {}),
    }


async def get_skill_marketplace_catalog(context: SiteRequestContext) -> dict:
    return {
        "ok": True,
        "capability_id": "content.skill_marketplace.catalog",
        "route": context.route,
        "snapshot_date": SKILL_MARKETPLACE_CATALOG["snapshot_date"],
        "count": len(SKILL_MARKETPLACE_CATALOG["entries"]),
        "entries": SKILL_MARKETPLACE_CATALOG["entries"],
    }
