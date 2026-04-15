from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from models.idea import EffortLevel, IdeaCategory, ProjectIdea, Reference


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class WorkflowRunStatus(str, Enum):
    RUNNING = "running"
    DONE = "done"
    DONE_WITH_WARNINGS = "done_with_warnings"
    FAILED = "failed"


class WorkflowCandidateStatus(str, Enum):
    RAW = "raw"
    FILTERED_OUT = "filtered_out"
    SHORTLISTED = "shortlisted"
    ANALYZED = "analyzed"
    ANALYSIS_FAILED = "analysis_failed"
    SELECTED = "selected"


class WorkflowAnalysisSummary(BaseModel):
    title: str
    tagline: str
    category: IdeaCategory
    target_user: str = ""
    why_now: str = ""
    why_interesting: str = ""
    why_worth_doing: str = ""
    tech_hints: list[str] = []
    effort: EffortLevel = EffortLevel.M
    quality_score: int = Field(ge=1, le=10)
    novelty_score: int = Field(ge=1, le=10)
    buildability_score: int = Field(ge=1, le=10)
    value: int = Field(ge=1, le=10)
    learnability: int = Field(ge=1, le=10)
    fun: int = Field(ge=1, le=10)
    feasibility: int = Field(ge=1, le=10)
    risk_flags: list[str] = []
    references: list[Reference] = []


class WorkflowCandidateRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    url: str
    snippet: str = ""
    source_query: str = ""
    source_domain: str = ""
    status: WorkflowCandidateStatus = WorkflowCandidateStatus.RAW
    filter_reason: Optional[str] = None
    analysis_error: Optional[str] = None
    analysis: Optional[WorkflowAnalysisSummary] = None
    idea: Optional[ProjectIdea] = None
    final_score: Optional[float] = None


class WorkflowRun(BaseModel):
    id: str
    direction: str = ""
    model_key: str
    status: WorkflowRunStatus = WorkflowRunStatus.RUNNING
    started_at: str = Field(default_factory=_utc_now)
    completed_at: Optional[str] = None
    searched: int = 0
    shortlisted: int = 0
    analyzed: int = 0
    persisted: int = 0
    failed: int = 0
    candidates: list[WorkflowCandidateRecord] = []
