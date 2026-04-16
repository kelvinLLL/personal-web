from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class CapabilityType(StrEnum):
    INFO = "info"
    NAVIGATION = "navigation"
    READ = "read"
    WORKFLOW = "workflow"


class CapabilityRisk(StrEnum):
    SAFE = "safe"
    PRIVILEGED = "privileged"


class CapabilityMode(StrEnum):
    INLINE = "inline"
    TRANSITION = "transition"


@dataclass(frozen=True, slots=True)
class SiteAgentCapability:
    id: str
    title: str
    description: str
    capability_type: CapabilityType
    risk: CapabilityRisk
    mode: CapabilityMode
    transition_route: str
    skill_asset: str | None = None
