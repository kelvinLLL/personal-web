from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import model_registry
from models.idea import (
    EffortLevel,
    IdeaCategory,
    IdeaDetail,
    IdeaMeta,
    ProjectIdea,
    Reference,
    Scores,
)
from models.workflow_run import (
    WorkflowAnalysisSummary,
    WorkflowCandidateRecord,
    WorkflowCandidateStatus,
    WorkflowRun,
    WorkflowRunStatus,
)
from services.ai import chat_completion_json, get_active_model_key
from services.auth import CurrentUser
from services.tavily import tavily_search

router = APIRouter(prefix="/api/ideas", tags=["workflow"])
WORKFLOW_MODEL_KEY = "minimax-m2.7"
WORKFLOW_ANALYSIS_CONCURRENCY = 4
WORKFLOW_ANALYSIS_TIMEOUT_SECONDS = 45


class WorkflowRequest(BaseModel):
    direction: str = ""


def _sse_event(event_type: str, data: dict) -> str:
    payload = json.dumps({"type": event_type, **data}, ensure_ascii=False)
    return f"data: {payload}\n\n"


def _build_discovery_queries(direction: str) -> list[str]:
    subject = direction.strip() or "developer tools"
    return [
        f'{subject} problem worth solving small project',
        f'{subject} "built this" open source tool',
        f'{subject} site:news.ycombinator.com "Show HN"',
        f'{subject} site:github.com open source project',
        f'{subject} weekend project tool',
        f'{subject} indie hacker tool',
    ]


async def _discover_candidates(
    queries: list[str],
) -> list[WorkflowCandidateRecord]:
    """Phase 1: search for candidates."""
    candidates: list[WorkflowCandidateRecord] = []
    seen_urls: set[str] = set()

    for query in queries:
        try:
            results = await tavily_search(query, max_results=5)
        except Exception:
            continue
        for result in results[:5]:
            url = result.get("url", "")
            normalized_url = _normalize_url(url)
            if not normalized_url or normalized_url in seen_urls:
                continue
            seen_urls.add(normalized_url)
            candidates.append(
                WorkflowCandidateRecord(
                    title=result.get("title", "Untitled"),
                    url=url,
                    snippet=result.get("content", "")[:500],
                    source_query=query,
                    source_domain=urlparse(url).netloc.lower(),
                )
            )
    return candidates[:30]


def _normalize_url(url: str) -> str:
    if not url:
        return ""
    parsed = urlparse(url.strip())
    normalized_path = parsed.path.rstrip("/")
    return f"{parsed.scheme}://{parsed.netloc.lower()}{normalized_path}"


def _normalize_title(title: str) -> str:
    return "".join(ch for ch in title.lower() if ch.isalnum() or ch.isspace()).strip()


def _candidate_heuristic(candidate: WorkflowCandidateRecord) -> tuple[int, str]:
    title = candidate.title.lower()
    url = candidate.url.lower()
    snippet = candidate.snippet.lower()
    score = 0

    if "github.com" in url and "/topics/" not in url:
        score += 3
    if "show hn" in title or "built this" in title or "weekend" in title:
        score += 3
    if "tool" in title or "tool" in snippet or "developer" in snippet:
        score += 1

    if any(term in title for term in ["top ", "best ", "awesome", "trending", "list", "directory", "showcase"]):
        score -= 4
    if any(term in url for term in ["/topics/", "/collections", "reddit.com"]):
        score -= 4
    if "the heart of the internet" in title:
        score -= 5

    return score, candidate.source_domain


def _reduce_candidates(candidates: list[WorkflowCandidateRecord], limit: int = 15) -> list[WorkflowCandidateRecord]:
    scored: list[tuple[int, WorkflowCandidateRecord]] = []
    seen_titles: set[str] = set()

    for candidate in candidates:
        normalized_title = _normalize_title(candidate.title)
        if normalized_title in seen_titles:
            candidate.status = WorkflowCandidateStatus.FILTERED_OUT
            candidate.filter_reason = "duplicate_title"
            continue
        seen_titles.add(normalized_title)

        score, _domain = _candidate_heuristic(candidate)
        if score < 0:
            candidate.status = WorkflowCandidateStatus.FILTERED_OUT
            candidate.filter_reason = "low_signal_or_aggregator"
            continue
        scored.append((score, candidate))

    shortlisted: list[WorkflowCandidateRecord] = []
    domain_counts: dict[str, int] = {}
    for _score, candidate in sorted(scored, key=lambda item: item[0], reverse=True):
        current = domain_counts.get(candidate.source_domain, 0)
        if current >= 3:
            candidate.status = WorkflowCandidateStatus.FILTERED_OUT
            candidate.filter_reason = "domain_diversity_limit"
            continue
        candidate.status = WorkflowCandidateStatus.SHORTLISTED
        shortlisted.append(candidate)
        domain_counts[candidate.source_domain] = current + 1
        if len(shortlisted) >= limit:
            break
    return shortlisted


async def _analyze_candidate(candidate: WorkflowCandidateRecord, model_key: str) -> dict | None:
    """Phase 2: AI analysis of a single candidate."""
    extra_results = []
    try:
        extra_results = await tavily_search(f"{candidate.title} project implementation", max_results=3)
    except Exception:
        pass

    extra_context = "\n".join(
        f"- {r.get('title', '')}: {r.get('content', '')[:200]}" for r in extra_results
    )

    prompt = f"""You are a project evaluator. Analyze this project idea and output ONLY valid JSON.

Project: {candidate.title}
URL: {candidate.url}
Description: {candidate.snippet}

Additional context:
{extra_context}

Output this exact JSON structure:
{{
  "title": "short project name",
  "tagline": "one-line description",
  "category": "toy|tool|feature|learning",
  "target_user": "who this helps",
  "why_now": "why this is timely",
  "why_interesting": "2-3 sentences",
  "why_worth_doing": "2-3 sentences",
  "tech_hints": ["tech1", "tech2"],
  "effort": "S|M|L",
  "scores": {{
    "value": 1-10,
    "learnability": 1-10,
    "fun": 1-10,
    "feasibility": 1-10
  }},
  "quality_score": 1-10,
  "novelty_score": 1-10,
  "buildability_score": 1-10,
  "risk_flags": ["risk1", "risk2"],
  "references": [
    {{"title": "...", "url": "...", "type": "repo|article|hn|other"}}
  ]
}}"""

    try:
        result = await chat_completion_json(
            [{"role": "user", "content": prompt}],
            model_key=model_key,
        )
        return result
    except Exception:
        return None


async def _analyze_shortlisted_candidates(
    candidates: list[WorkflowCandidateRecord],
    *,
    model_key: str,
    run_id: str,
    concurrency: int = WORKFLOW_ANALYSIS_CONCURRENCY,
    timeout_seconds: int = WORKFLOW_ANALYSIS_TIMEOUT_SECONDS,
) -> list[WorkflowCandidateRecord]:
    semaphore = asyncio.Semaphore(max(1, concurrency))

    async def worker(candidate: WorkflowCandidateRecord) -> WorkflowCandidateRecord:
        async with semaphore:
            try:
                analysis = await asyncio.wait_for(
                    _analyze_candidate(candidate, model_key),
                    timeout=timeout_seconds,
                )
            except asyncio.TimeoutError:
                candidate.status = WorkflowCandidateStatus.ANALYSIS_FAILED
                candidate.analysis_error = "analysis_timeout"
                return candidate
            except Exception as exc:  # noqa: PERF203 - candidate-scoped isolation
                candidate.status = WorkflowCandidateStatus.ANALYSIS_FAILED
                candidate.analysis_error = str(exc)
                return candidate

            if not analysis:
                candidate.status = WorkflowCandidateStatus.ANALYSIS_FAILED
                candidate.analysis_error = "analysis_failed"
                return candidate

            try:
                idea, analysis_summary, final_score = _build_idea_from_analysis(analysis, run_id)
            except Exception as exc:  # noqa: PERF203 - candidate-scoped isolation
                candidate.status = WorkflowCandidateStatus.ANALYSIS_FAILED
                candidate.analysis_error = str(exc)
                return candidate

            candidate.status = WorkflowCandidateStatus.ANALYZED
            candidate.analysis = analysis_summary
            candidate.idea = idea
            candidate.final_score = final_score
            return candidate

    if not candidates:
        return []

    return await asyncio.gather(*(worker(candidate) for candidate in candidates))


def _clamp_score(value: int | float | None, default: int = 5) -> int:
    raw = default if value is None else int(value)
    return max(1, min(10, raw))


def _build_idea_from_analysis(analysis: dict, run_id: str) -> tuple[ProjectIdea, WorkflowAnalysisSummary, float]:
    """Convert AI analysis JSON into a ProjectIdea."""
    scores_raw = analysis.get("scores", {})
    overall = round(
        (
            _clamp_score(scores_raw.get("value"))
            + _clamp_score(scores_raw.get("learnability"))
            + _clamp_score(scores_raw.get("fun"))
            + _clamp_score(scores_raw.get("feasibility"))
        ) / 4
    )
    scores = Scores(
        value=_clamp_score(scores_raw.get("value")),
        learnability=_clamp_score(scores_raw.get("learnability")),
        fun=_clamp_score(scores_raw.get("fun")),
        feasibility=_clamp_score(scores_raw.get("feasibility")),
        overall=overall,
    )

    refs = [
        Reference(title=r.get("title", ""), url=r.get("url", ""), type=r.get("type", "other"))
        for r in analysis.get("references", [])
        if r.get("url")
    ]

    effort_raw = analysis.get("effort", "M")
    try:
        effort = EffortLevel(effort_raw)
    except ValueError:
        effort = EffortLevel.M

    cat_raw = analysis.get("category", "tool")
    try:
        category = IdeaCategory(cat_raw)
    except ValueError:
        category = IdeaCategory.TOOL

    idea = ProjectIdea(
        id=str(uuid.uuid4()),
        title=analysis.get("title", "Untitled"),
        tagline=analysis.get("tagline", ""),
        category=category,
        scores=scores,
        detail=IdeaDetail(
            why_interesting=analysis.get("why_interesting", ""),
            why_worth_doing=analysis.get("why_worth_doing", ""),
            references=refs,
            tech_hints=analysis.get("tech_hints", []),
            effort=effort,
        ),
        meta=IdeaMeta(
            discovered_at=datetime.now(timezone.utc).isoformat() + "Z",
            source="workflow_selected",
            workflow_run_id=run_id,
        ),
    )
    analysis_summary = WorkflowAnalysisSummary(
        title=idea.title,
        tagline=idea.tagline,
        category=idea.category,
        target_user=analysis.get("target_user", ""),
        why_now=analysis.get("why_now", ""),
        why_interesting=idea.detail.why_interesting,
        why_worth_doing=idea.detail.why_worth_doing,
        tech_hints=idea.detail.tech_hints,
        effort=idea.detail.effort,
        quality_score=_clamp_score(analysis.get("quality_score")),
        novelty_score=_clamp_score(analysis.get("novelty_score")),
        buildability_score=_clamp_score(analysis.get("buildability_score")),
        value=idea.scores.value,
        learnability=idea.scores.learnability,
        fun=idea.scores.fun,
        feasibility=idea.scores.feasibility,
        risk_flags=[flag for flag in analysis.get("risk_flags", []) if isinstance(flag, str)],
        references=refs,
    )
    final_score = round(
        (
            idea.scores.overall
            + analysis_summary.quality_score
            + analysis_summary.buildability_score
            + analysis_summary.novelty_score
        ) / 4,
        2,
    )
    return idea, analysis_summary, final_score


def _select_persist_count(analyzed_count: int) -> int:
    if analyzed_count <= 0:
        return 0
    return min(analyzed_count, min(10, max(5, round(analyzed_count * 0.5))))


def _resolve_workflow_model_key() -> str:
    try:
        model_registry.resolve(WORKFLOW_MODEL_KEY)
        return WORKFLOW_MODEL_KEY
    except ValueError:
        return get_active_model_key()


def get_ideas_store(request: Request):
    return request.app.state.ideas_store


def get_workflow_runs_store(request: Request):
    return request.app.state.workflow_runs_store


@router.post("/workflow")
async def run_workflow(body: WorkflowRequest, request: Request, _user: CurrentUser):
    run_id = str(uuid.uuid4())
    ideas_store = get_ideas_store(request)
    workflow_runs_store = get_workflow_runs_store(request)
    model_key = _resolve_workflow_model_key()

    async def generate():
        run = WorkflowRun(id=run_id, direction=body.direction, model_key=model_key)
        try:
            yield _sse_event("phase:1", {"message": "Starting discovery search..."})

            candidates = await _discover_candidates(_build_discovery_queries(body.direction))
            run.candidates = candidates
            run.searched = len(candidates)
            yield _sse_event("phase:1:progress", {"message": f"Found {run.searched} candidates"})

            shortlisted = _reduce_candidates(run.candidates, limit=15)
            run.shortlisted = len(shortlisted)
            yield _sse_event("phase:2", {"message": "Starting deep analysis..."})
            yield _sse_event(
                "phase:2:progress",
                {
                    "message": (
                        f"Analyzing {run.shortlisted} shortlisted candidates "
                        f"with concurrency {WORKFLOW_ANALYSIS_CONCURRENCY}..."
                    )
                },
            )

            for offset in range(0, len(shortlisted), WORKFLOW_ANALYSIS_CONCURRENCY):
                batch = shortlisted[offset: offset + WORKFLOW_ANALYSIS_CONCURRENCY]
                for candidate in batch:
                    yield _sse_event("phase:2:progress", {"message": f"Analyzing: {candidate.title}"})

                analyzed_batch = await _analyze_shortlisted_candidates(
                    batch,
                    model_key=model_key,
                    run_id=run_id,
                    concurrency=min(WORKFLOW_ANALYSIS_CONCURRENCY, len(batch)),
                    timeout_seconds=WORKFLOW_ANALYSIS_TIMEOUT_SECONDS,
                )

                batch_successes = 0
                batch_failures = 0
                for candidate in analyzed_batch:
                    if candidate.status == WorkflowCandidateStatus.ANALYZED:
                        run.analyzed += 1
                        batch_successes += 1
                    elif candidate.status == WorkflowCandidateStatus.ANALYSIS_FAILED:
                        run.failed += 1
                        batch_failures += 1

                yield _sse_event(
                    "phase:2:progress",
                    {
                        "message": (
                            f"Batch complete: {batch_successes} analyzed, "
                            f"{batch_failures} failed."
                        )
                    },
                )

            yield _sse_event("phase:3", {"message": "Ranking and selecting ideas..."})

            analyzed_candidates = [
                candidate
                for candidate in shortlisted
                if candidate.status == WorkflowCandidateStatus.ANALYZED and candidate.idea is not None
            ]
            analyzed_candidates.sort(key=lambda candidate: candidate.final_score or 0, reverse=True)

            persist_count = _select_persist_count(len(analyzed_candidates))
            selected_candidates = analyzed_candidates[:persist_count]
            for candidate in selected_candidates:
                candidate.status = WorkflowCandidateStatus.SELECTED

            persisted = await ideas_store.add_ideas([candidate.idea for candidate in selected_candidates if candidate.idea])
            run.persisted = len(persisted)
            run.completed_at = datetime.now(timezone.utc).isoformat()
            run.status = (
                WorkflowRunStatus.DONE_WITH_WARNINGS
                if run.failed > 0
                else WorkflowRunStatus.DONE
            )
            await workflow_runs_store.save_run(run)

            event_type = "done_with_warnings" if run.failed > 0 else "done"
            yield _sse_event(
                event_type,
                {
                    "message": f"Completed! Selected {run.persisted} ideas from {run.analyzed} analyses.",
                    "ideas": [idea.model_dump() for idea in persisted],
                    "run_id": run.id,
                    "model_key": model_key,
                    "searched": run.searched,
                    "shortlisted": run.shortlisted,
                    "analyzed": run.analyzed,
                    "persisted": run.persisted,
                    "failed": run.failed,
                },
            )
        except Exception as exc:  # noqa: PERF203 - explicit terminal event for SSE
            run.completed_at = datetime.now(timezone.utc).isoformat()
            run.status = WorkflowRunStatus.FAILED
            await workflow_runs_store.save_run(run)
            yield _sse_event(
                "failed",
                {
                    "message": str(exc),
                    "run_id": run.id,
                    "model_key": model_key,
                    "searched": run.searched,
                    "shortlisted": run.shortlisted,
                    "analyzed": run.analyzed,
                    "persisted": run.persisted,
                    "failed": run.failed,
                },
            )

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
