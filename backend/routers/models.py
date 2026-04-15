from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import model_registry
from services.ai import get_active_model_key, set_active_model_key
from services.auth import CurrentUser

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("")
async def list_models():
    """Public: return available model profiles and current active model."""
    return {
        "models": model_registry.list_models(),
        "active": get_active_model_key(),
        "default": model_registry.default_model_key,
    }


class SwitchRequest(BaseModel):
    key: str


@router.post("/active")
async def switch_model(body: SwitchRequest, _user: CurrentUser):
    """Admin only: switch the active model at runtime."""
    try:
        set_active_model_key(body.key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"active": get_active_model_key()}


@router.post("/reload")
async def reload_models(_user: CurrentUser):
    """Admin only: reload models.yaml from disk."""
    model_registry.reload()
    return {"models": model_registry.list_models(), "active": get_active_model_key()}
