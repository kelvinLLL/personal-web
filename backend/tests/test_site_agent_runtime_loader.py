from __future__ import annotations

import importlib
from pathlib import Path

import pytest


REPO_ROOT = Path(__file__).resolve().parents[2]
RUNTIME_MODULE = REPO_ROOT / "apps" / "superhaojun" / "src" / "superhaojun" / "runtime.py"


def test_superhaojun_runtime_module_is_mounted() -> None:
    assert RUNTIME_MODULE.exists()


def test_runtime_loader_imports_build_runtime() -> None:
    runtime_loader = importlib.import_module("services.site_agent.runtime_loader")

    build_runtime = runtime_loader.load_superhaojun_build_runtime()

    assert callable(build_runtime)
    assert build_runtime.__module__ == "superhaojun.runtime"
    assert build_runtime.__name__ == "build_runtime"


def test_runtime_loader_raises_clear_error_when_submodule_path_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime_loader = importlib.import_module("services.site_agent.runtime_loader")
    missing_src = REPO_ROOT / "apps" / "missing-superhaojun" / "src"

    monkeypatch.setattr(runtime_loader, "SUPERHAOJUN_SRC_PATH", missing_src)

    with pytest.raises(RuntimeError, match="apps/superhaojun/src|missing-superhaojun"):
        runtime_loader.load_superhaojun_build_runtime()
