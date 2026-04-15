from __future__ import annotations

import os
import re
from pathlib import Path

import yaml
from pydantic import BaseModel
from pydantic_settings import BaseSettings


# ── Load .env into os.environ (so YAML ${VAR} resolution works) ─────────

def _load_dotenv_into_environ() -> None:
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())

_load_dotenv_into_environ()


# ── Env-only settings (secrets / infra) ──────────────────────────────────

class Settings(BaseSettings):
    admin_password: str = "changeme"
    tavily_api_key: str = ""
    jwt_secret: str = "dev-secret-change-me"
    jwt_expire_days: int = 7
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    cors_origin_regex: str = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
    data_dir: str = "data"
    workflow_runs_dir: str = "data/workflow-runs"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()  # type: ignore[call-arg]


# ── YAML model profiles ─────────────────────────────────────────────────

_ENV_VAR_RE = re.compile(r"\$\{(\w+)}")


def _resolve_env_vars(value: str) -> str:
    """Replace ${VAR} with os.environ value."""
    def replacer(m: re.Match) -> str:
        return os.environ.get(m.group(1), "")
    return _ENV_VAR_RE.sub(replacer, value)


class ProviderConfig(BaseModel):
    base_url: str
    api_key: str


class ModelProfile(BaseModel):
    name: str
    model_id: str
    provider: str


class ModelRegistry:
    """Loads models.yaml once, resolves env vars, provides lookup."""

    def __init__(self, yaml_path: Path | None = None):
        self._path = yaml_path or Path(__file__).parent / "models.yaml"
        self._raw: dict = {}
        self._providers: dict[str, ProviderConfig] = {}
        self._models: dict[str, ModelProfile] = {}
        self._default: str = ""
        self.reload()

    def reload(self) -> None:
        if not self._path.exists():
            return
        with open(self._path, encoding="utf-8") as f:
            self._raw = yaml.safe_load(f) or {}

        self._default = self._raw.get("default", "")

        self._providers = {}
        for key, val in self._raw.get("providers", {}).items():
            self._providers[key] = ProviderConfig(
                base_url=val["base_url"],
                api_key=_resolve_env_vars(val.get("api_key", "")),
            )

        self._models = {}
        for key, val in self._raw.get("models", {}).items():
            self._models[key] = ModelProfile(
                name=val.get("name", key),
                model_id=val["model_id"],
                provider=val["provider"],
            )

    @property
    def default_model_key(self) -> str:
        return self._default

    def list_models(self) -> list[dict]:
        """Return serializable model list for the API."""
        return [
            {"key": k, "name": m.name, "model_id": m.model_id, "provider": m.provider}
            for k, m in self._models.items()
        ]

    def resolve(self, model_key: str | None = None) -> tuple[str, str, str]:
        """Return (base_url, api_key, model_id) for a given model key."""
        key = model_key or self._default
        profile = self._models.get(key)
        if not profile:
            raise ValueError(f"Unknown model key: {key}")
        provider = self._providers.get(profile.provider)
        if not provider:
            raise ValueError(f"Unknown provider: {profile.provider}")
        return provider.base_url, provider.api_key, profile.model_id


model_registry = ModelRegistry()
