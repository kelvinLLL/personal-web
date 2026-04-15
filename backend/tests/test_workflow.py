import json
from asyncio import sleep
from pathlib import Path

import pytest

from routers import workflow as workflow_router
from models.workflow_run import WorkflowCandidateRecord
from services.auth import create_token


REAL_IDEAS_FILE = Path(__file__).resolve().parent.parent / "data" / "ideas.json"


def _auth_headers() -> dict[str, str]:
    token, _ = create_token("admin")
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_workflow_finishes_with_warnings_when_some_candidates_fail(client, monkeypatch):
    backup = REAL_IDEAS_FILE.read_text(encoding="utf-8")

    async def fake_tavily_search(query: str, max_results: int = 5):
        if "project implementation" in query:
            return []
        return [
            {
                "title": "Candidate One",
                "url": "https://example.com/one",
                "content": "A small developer tool with a focused workflow.",
            },
            {
                "title": "Candidate Two",
                "url": "https://example.com/two",
                "content": "A second project idea worth evaluating.",
            },
        ]

    analysis_calls = {"count": 0}

    async def fake_chat_completion_json(messages, model_key=None):
        analysis_calls["count"] += 1
        if analysis_calls["count"] == 1:
            return {
                "title": "Structured Candidate One",
                "tagline": "A useful developer assistant",
                "category": "tool",
                "why_interesting": "Interesting",
                "why_worth_doing": "Worth building",
                "tech_hints": ["React", "FastAPI"],
                "effort": "M",
                "scores": {
                    "value": 8,
                    "learnability": 7,
                    "fun": 6,
                    "feasibility": 8,
                },
                "references": [
                    {
                        "title": "Candidate One",
                        "url": "https://example.com/one",
                        "type": "article",
                    }
                ],
            }
        raise RuntimeError("rate limited")

    monkeypatch.setattr(workflow_router, "tavily_search", fake_tavily_search)
    monkeypatch.setattr(workflow_router, "chat_completion_json", fake_chat_completion_json)

    events: list[dict] = []
    try:
        async with client.stream(
            "POST",
            "/api/ideas/workflow",
            headers=_auth_headers(),
            json={"direction": "AI dev tools"},
        ) as response:
            assert response.status_code == 200
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                events.append(json.loads(line[6:]))
    except Exception as exc:  # noqa: PERF203 - deliberate capture for TDD
        events.append({"type": "__exception__", "message": str(exc)})
    finally:
        REAL_IDEAS_FILE.write_text(backup, encoding="utf-8")

    assert events, "expected workflow to emit events"
    assert events[-1]["type"] == "done_with_warnings"
    assert events[-1]["searched"] == 2
    assert events[-1]["analyzed"] == 1
    assert events[-1]["failed"] == 1
    assert events[-1]["persisted"] == 1


@pytest.mark.asyncio
async def test_shortlisted_analysis_runs_with_bounded_concurrency(monkeypatch):
    candidates = [
        WorkflowCandidateRecord(
            title=f"Candidate {index}",
            url=f"https://example.com/{index}",
            source_domain="example.com",
        )
        for index in range(4)
    ]

    in_flight = {"current": 0, "max": 0}

    async def fake_analyze_candidate(candidate, model_key):
        in_flight["current"] += 1
        in_flight["max"] = max(in_flight["max"], in_flight["current"])
        await sleep(0.05)
        in_flight["current"] -= 1
        return {
            "title": candidate.title,
            "tagline": "Useful tool",
            "category": "tool",
            "why_interesting": "Interesting",
            "why_worth_doing": "Worth doing",
            "tech_hints": ["FastAPI"],
            "effort": "M",
            "scores": {
                "value": 8,
                "learnability": 7,
                "fun": 6,
                "feasibility": 8,
            },
            "references": [],
        }

    monkeypatch.setattr(workflow_router, "_analyze_candidate", fake_analyze_candidate)

    results = await workflow_router._analyze_shortlisted_candidates(
        candidates,
        model_key="minimax-m2.7",
        run_id="run-1",
        concurrency=3,
        timeout_seconds=1,
    )

    assert len(results) == 4
    assert in_flight["max"] > 1
    assert in_flight["max"] <= 3
