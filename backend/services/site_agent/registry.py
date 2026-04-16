from __future__ import annotations

from services.site_agent.models import (
    CapabilityMode,
    CapabilityRisk,
    CapabilityType,
    SiteAgentCapability,
)


_CAPABILITIES: tuple[SiteAgentCapability, ...] = (
    SiteAgentCapability(
        id="site.intro",
        title="Introduce the site agent",
        description="Explain what the website agent can help with across the current public site.",
        capability_type=CapabilityType.INFO,
        risk=CapabilityRisk.SAFE,
        mode=CapabilityMode.INLINE,
        transition_route="/",
        skill_asset="using-personal-web.md",
    ),
    SiteAgentCapability(
        id="site.navigate",
        title="Navigate to a site surface",
        description="Guide the user to the best current page when work should move out of the floating shell.",
        capability_type=CapabilityType.NAVIGATION,
        risk=CapabilityRisk.SAFE,
        mode=CapabilityMode.TRANSITION,
        transition_route="/",
        skill_asset="using-personal-web.md",
    ),
    SiteAgentCapability(
        id="ideas.list",
        title="List ideas",
        description="Read the current ideas collection from the backend ideas surface.",
        capability_type=CapabilityType.READ,
        risk=CapabilityRisk.SAFE,
        mode=CapabilityMode.INLINE,
        transition_route="/ideas",
        skill_asset="ideas-read.md",
    ),
    SiteAgentCapability(
        id="ideas.get",
        title="Get one idea",
        description="Read one idea by id from the existing ideas backend route.",
        capability_type=CapabilityType.READ,
        risk=CapabilityRisk.SAFE,
        mode=CapabilityMode.INLINE,
        transition_route="/ideas",
        skill_asset="ideas-read.md",
    ),
    SiteAgentCapability(
        id="ideas.meta",
        title="Get idea metadata",
        description="Read idea counts and metadata from the existing ideas meta surface.",
        capability_type=CapabilityType.READ,
        risk=CapabilityRisk.SAFE,
        mode=CapabilityMode.INLINE,
        transition_route="/ideas",
        skill_asset="ideas-read.md",
    ),
    SiteAgentCapability(
        id="ideas.workflow.start",
        title="Start the ideas workflow",
        description="Register the workflow-start action as a privileged, transition-first capability.",
        capability_type=CapabilityType.WORKFLOW,
        risk=CapabilityRisk.PRIVILEGED,
        mode=CapabilityMode.TRANSITION,
        transition_route="/ideas",
        skill_asset="ideas-workflow.md",
    ),
    SiteAgentCapability(
        id="ideas.workflow.get_run",
        title="Get an ideas workflow run",
        description="Look up the status of a workflow run once the user is already operating in the ideas flow.",
        capability_type=CapabilityType.WORKFLOW,
        risk=CapabilityRisk.PRIVILEGED,
        mode=CapabilityMode.TRANSITION,
        transition_route="/ideas",
        skill_asset="ideas-workflow.md",
    ),
    SiteAgentCapability(
        id="content.daily_nuance.latest",
        title="Read latest Daily Nuance",
        description="Read the latest Daily Nuance snapshot that is mirrored into site assets.",
        capability_type=CapabilityType.READ,
        risk=CapabilityRisk.SAFE,
        mode=CapabilityMode.INLINE,
        transition_route="/daily-nuance",
        skill_asset="content-read.md",
    ),
    SiteAgentCapability(
        id="content.skill_marketplace.catalog",
        title="Read the skill marketplace catalog",
        description="Declare the first skill marketplace catalog surface for later handler wiring.",
        capability_type=CapabilityType.READ,
        risk=CapabilityRisk.SAFE,
        mode=CapabilityMode.TRANSITION,
        transition_route="/skill-marketplace",
        skill_asset="content-read.md",
    ),
)

_CAPABILITIES_BY_ID = {capability.id: capability for capability in _CAPABILITIES}


def list_capabilities() -> tuple[SiteAgentCapability, ...]:
    return _CAPABILITIES


def get_capability(capability_id: str) -> SiteAgentCapability | None:
    return _CAPABILITIES_BY_ID.get(capability_id)
