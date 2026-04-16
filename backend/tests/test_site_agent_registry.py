from pathlib import Path

from services.site_agent.models import CapabilityMode, CapabilityRisk, CapabilityType
from services.site_agent.registry import get_capability, list_capabilities


EXPECTED_CAPABILITIES = [
    {
        "id": "site.intro",
        "title": "Introduce the site agent",
        "description": "Explain what the website agent can help with across the current public site.",
        "capability_type": CapabilityType.INFO,
        "risk": CapabilityRisk.SAFE,
        "mode": CapabilityMode.INLINE,
        "transition_route": "/",
        "skill_asset": "using-personal-web.md",
    },
    {
        "id": "site.navigate",
        "title": "Navigate to a site surface",
        "description": "Guide the user to the best current page when work should move out of the floating shell.",
        "capability_type": CapabilityType.NAVIGATION,
        "risk": CapabilityRisk.SAFE,
        "mode": CapabilityMode.TRANSITION,
        "transition_route": "/",
        "skill_asset": "using-personal-web.md",
    },
    {
        "id": "ideas.list",
        "title": "List ideas",
        "description": "Browse the current ideas collection.",
        "capability_type": CapabilityType.READ,
        "risk": CapabilityRisk.SAFE,
        "mode": CapabilityMode.INLINE,
        "transition_route": "/ideas",
        "skill_asset": "ideas-read.md",
    },
    {
        "id": "ideas.get",
        "title": "Get one idea",
        "description": "Read the details for a specific idea.",
        "capability_type": CapabilityType.READ,
        "risk": CapabilityRisk.SAFE,
        "mode": CapabilityMode.INLINE,
        "transition_route": "/ideas",
        "skill_asset": "ideas-read.md",
    },
    {
        "id": "ideas.meta",
        "title": "Get idea metadata",
        "description": "Check idea counts and metadata for the current collection.",
        "capability_type": CapabilityType.READ,
        "risk": CapabilityRisk.SAFE,
        "mode": CapabilityMode.INLINE,
        "transition_route": "/ideas",
        "skill_asset": "ideas-read.md",
    },
    {
        "id": "ideas.workflow.start",
        "title": "Start the ideas workflow",
        "description": "Start an ideas workflow run for the current direction.",
        "capability_type": CapabilityType.WORKFLOW,
        "risk": CapabilityRisk.PRIVILEGED,
        "mode": CapabilityMode.TRANSITION,
        "transition_route": "/ideas",
        "skill_asset": "ideas-workflow.md",
    },
    {
        "id": "ideas.workflow.get_run",
        "title": "Get an ideas workflow run",
        "description": "Check the structured status of an existing ideas workflow run.",
        "capability_type": CapabilityType.WORKFLOW,
        "risk": CapabilityRisk.PRIVILEGED,
        "mode": CapabilityMode.INLINE,
        "transition_route": "/ideas",
        "skill_asset": "ideas-workflow.md",
    },
    {
        "id": "content.daily_nuance.latest",
        "title": "Read latest Daily Nuance",
        "description": "Read the latest Daily Nuance snapshot.",
        "capability_type": CapabilityType.READ,
        "risk": CapabilityRisk.SAFE,
        "mode": CapabilityMode.INLINE,
        "transition_route": "/daily-nuance",
        "skill_asset": "content-read.md",
    },
    {
        "id": "content.skill_marketplace.catalog",
        "title": "Read the skill marketplace catalog",
        "description": "Browse the current skill marketplace catalog.",
        "capability_type": CapabilityType.READ,
        "risk": CapabilityRisk.SAFE,
        "mode": CapabilityMode.TRANSITION,
        "transition_route": "/skill-marketplace",
        "skill_asset": "content-read.md",
    },
]


def test_first_registry_slice_exposes_only_the_approved_capability_ids() -> None:
    capabilities = list_capabilities()

    assert [capability.id for capability in capabilities] == [
        expected_capability["id"] for expected_capability in EXPECTED_CAPABILITIES
    ]


def test_first_registry_slice_carries_stable_metadata_for_adapter_work() -> None:
    for expected_capability in EXPECTED_CAPABILITIES:
        capability = get_capability(expected_capability["id"])

        assert capability is not None
        assert capability.id == expected_capability["id"]
        assert capability.title == expected_capability["title"]
        assert capability.description == expected_capability["description"]
        assert capability.capability_type is expected_capability["capability_type"]
        assert capability.risk is expected_capability["risk"]
        assert capability.mode is expected_capability["mode"]
        assert capability.transition_route == expected_capability["transition_route"]
        assert capability.skill_asset == expected_capability["skill_asset"]


def test_first_registry_slice_skill_assets_exist_for_each_registered_reference() -> None:
    skill_root = Path(__file__).resolve().parents[1] / "services" / "site_agent" / "skills"

    missing_assets = [
        capability.skill_asset
        for capability in list_capabilities()
        if capability.skill_asset is not None and not (skill_root / capability.skill_asset).exists()
    ]

    assert missing_assets == []
