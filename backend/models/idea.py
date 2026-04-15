from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class IdeaCategory(str, Enum):
    TOY = "toy"
    TOOL = "tool"
    FEATURE = "feature"
    LEARNING = "learning"


class IdeaStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    SKIPPED = "skipped"


class EffortLevel(str, Enum):
    S = "S"
    M = "M"
    L = "L"


class Reference(BaseModel):
    title: str
    url: str
    type: str = "other"


class Scores(BaseModel):
    value: int = Field(ge=1, le=10)
    learnability: int = Field(ge=1, le=10)
    fun: int = Field(ge=1, le=10)
    feasibility: int = Field(ge=1, le=10)
    overall: int = Field(ge=1, le=10)


class IdeaDetail(BaseModel):
    why_interesting: str = ""
    why_worth_doing: str = ""
    references: list[Reference] = []
    tech_hints: list[str] = []
    effort: EffortLevel = EffortLevel.M


class IdeaMeta(BaseModel):
    discovered_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat() + "Z")
    source: str = "manual"
    workflow_run_id: Optional[str] = None


class ProjectIdea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    tagline: str
    category: IdeaCategory
    status: IdeaStatus = IdeaStatus.PENDING
    scores: Scores
    detail: IdeaDetail = IdeaDetail()
    meta: IdeaMeta = IdeaMeta()


class IdeaCreate(BaseModel):
    title: str
    tagline: str
    category: IdeaCategory
    status: IdeaStatus = IdeaStatus.PENDING
    scores: Scores
    detail: IdeaDetail = IdeaDetail()


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    category: Optional[IdeaCategory] = None
    status: Optional[IdeaStatus] = None
    scores: Optional[Scores] = None
    detail: Optional[IdeaDetail] = None
