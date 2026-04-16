from pathlib import Path

from services.site_agent.models import CapabilityMode, CapabilityRisk, CapabilityType
from services.site_agent.registry import get_capability, list_capabilities


EXPECTED_CAPABILITY_IDS = [
    "site.intro",
    "site.navigate",
    "ideas.list",
    "ideas.get",
    "ideas.meta",
    "ideas.workflow.start",
    "ideas.workflow.get_run",
    "content.daily_nuance.latest",
    "content.skill_marketplace.catalog",
]


def test_first_registry_slice_exposes_only_the_approved_capability_ids() -> None:
    capabilities = list_capabilities()

    assert [capability.id for capability in capabilities] == EXPECTED_CAPABILITY_IDS


def test_first_registry_slice_carries_stable_metadata_for_adapter_work() -> None:
    intro = get_capability("site.intro")
    navigate = get_capability("site.navigate")
    workflow_start = get_capability("ideas.workflow.start")
    daily_nuance = get_capability("content.daily_nuance.latest")

    assert intro is not None
    assert intro.capability_type is CapabilityType.INFO
    assert intro.risk is CapabilityRisk.SAFE
    assert intro.mode is CapabilityMode.INLINE
    assert intro.transition_route == "/"

    assert navigate is not None
    assert navigate.capability_type is CapabilityType.NAVIGATION
    assert navigate.risk is CapabilityRisk.SAFE
    assert navigate.mode is CapabilityMode.TRANSITION
    assert navigate.transition_route == "/"

    assert workflow_start is not None
    assert workflow_start.capability_type is CapabilityType.WORKFLOW
    assert workflow_start.risk is CapabilityRisk.PRIVILEGED
    assert workflow_start.mode is CapabilityMode.TRANSITION
    assert workflow_start.transition_route == "/ideas"

    assert daily_nuance is not None
    assert daily_nuance.capability_type is CapabilityType.READ
    assert daily_nuance.risk is CapabilityRisk.SAFE
    assert daily_nuance.mode is CapabilityMode.INLINE
    assert daily_nuance.transition_route == "/daily-nuance"


def test_first_registry_slice_skill_assets_exist_for_each_registered_reference() -> None:
    skill_root = Path(__file__).resolve().parents[1] / "services" / "site_agent" / "skills"

    missing_assets = [
        capability.skill_asset
        for capability in list_capabilities()
        if capability.skill_asset is not None and not (skill_root / capability.skill_asset).exists()
    ]

    assert missing_assets == []
