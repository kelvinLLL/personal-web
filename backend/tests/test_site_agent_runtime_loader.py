from __future__ import annotations

import importlib
from pathlib import Path
import re
from types import SimpleNamespace
import tomllib
from typing import Any
import types

import pytest


REPO_ROOT = Path(__file__).resolve().parents[2]
RUNTIME_MODULE = REPO_ROOT / "apps" / "superhaojun" / "src" / "superhaojun" / "runtime.py"
BUS_MODULE = REPO_ROOT / "apps" / "superhaojun" / "src" / "superhaojun" / "bus.py"
BACKEND_PYPROJECT = REPO_ROOT / "backend" / "pyproject.toml"
BACKEND_LOCK = REPO_ROOT / "backend" / "uv.lock"
SUPERHAOJUN_PYPROJECT = REPO_ROOT / "apps" / "superhaojun" / "pyproject.toml"
SHARED_RUNTIME_DEPENDENCIES = (
    "fastapi",
    "openai",
    "pydantic",
    "pydantic-settings",
    "pyyaml",
    "uvicorn",
)


def _dependency_map(dependencies: list[str]) -> dict[str, str]:
    dependency_map: dict[str, str] = {}
    for dependency in dependencies:
        match = re.match(r"([A-Za-z0-9_.-]+)", dependency)
        if not match:
            raise AssertionError(f"Could not parse dependency entry: {dependency}")
        dependency_map[match.group(1)] = dependency
    return dependency_map


def test_superhaojun_runtime_module_is_mounted() -> None:
    assert RUNTIME_MODULE.exists()


def test_runtime_boundary_packaging_metadata_stays_in_sync() -> None:
    backend_project = tomllib.loads(BACKEND_PYPROJECT.read_text(encoding="utf-8"))["project"]
    mounted_project = tomllib.loads(SUPERHAOJUN_PYPROJECT.read_text(encoding="utf-8"))["project"]
    lock_header = BACKEND_LOCK.read_text(encoding="utf-8").splitlines()
    backend_dependencies = _dependency_map(backend_project["dependencies"])
    mounted_dependencies = _dependency_map(mounted_project["dependencies"])

    backend_python = backend_project["requires-python"]
    mounted_python = mounted_project["requires-python"]
    lock_python = next(line for line in lock_header if line.startswith("requires-python = "))
    expected_lock_python = f'requires-python = "{backend_python}"'

    assert backend_python == ">=3.12"
    assert backend_python == mounted_python
    assert lock_python == expected_lock_python
    assert {
        dependency: backend_dependencies[dependency]
        for dependency in SHARED_RUNTIME_DEPENDENCIES
    } == {
        dependency: mounted_dependencies[dependency]
        for dependency in SHARED_RUNTIME_DEPENDENCIES
    }


def test_runtime_loader_imports_build_runtime() -> None:
    runtime_loader = importlib.import_module("services.site_agent.runtime_loader")

    build_runtime = runtime_loader.load_superhaojun_build_runtime()

    assert callable(build_runtime)
    assert build_runtime.__module__ == "superhaojun.runtime"
    assert build_runtime.__name__ == "build_runtime"


def test_runtime_loader_ignores_polluted_sys_modules_runtime_cache(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime_loader = importlib.import_module("services.site_agent.runtime_loader")
    fake_runtime = types.ModuleType("superhaojun.runtime")

    def fake_build_runtime(*args: Any, **kwargs: Any) -> str:
        return "fake-runtime"

    fake_runtime.build_runtime = fake_build_runtime
    fake_runtime.__file__ = "/tmp/fake-superhaojun-runtime.py"

    monkeypatch.setitem(runtime_loader.sys.modules, "superhaojun.runtime", fake_runtime)

    build_runtime = runtime_loader.load_superhaojun_build_runtime()

    assert build_runtime is not fake_build_runtime
    assert build_runtime.__module__ == "superhaojun.runtime"
    assert Path(build_runtime.__code__.co_filename).resolve() == RUNTIME_MODULE.resolve()


def test_runtime_loader_clears_polluted_child_modules_from_sys_modules(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime_loader = importlib.import_module("services.site_agent.runtime_loader")
    fake_bus = types.ModuleType("superhaojun.bus")
    fake_bus.MessageBus = object
    fake_bus.__file__ = "/tmp/fake-superhaojun-bus.py"

    monkeypatch.setitem(runtime_loader.sys.modules, "superhaojun.bus", fake_bus)
    runtime_loader.sys.modules.pop("superhaojun.runtime", None)

    build_runtime = runtime_loader.load_superhaojun_build_runtime()
    mounted_bus = runtime_loader.sys.modules["superhaojun.bus"]

    assert build_runtime.__module__ == "superhaojun.runtime"
    assert Path(build_runtime.__code__.co_filename).resolve() == RUNTIME_MODULE.resolve()
    assert mounted_bus is not fake_bus
    assert Path(mounted_bus.__file__).resolve() == BUS_MODULE.resolve()


def test_runtime_loader_raises_clear_error_when_submodule_path_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime_loader = importlib.import_module("services.site_agent.runtime_loader")
    missing_src = REPO_ROOT / "apps" / "missing-superhaojun" / "src"

    monkeypatch.setattr(runtime_loader, "SUPERHAOJUN_SRC_PATH", missing_src)

    with pytest.raises(RuntimeError, match="apps/superhaojun/src|missing-superhaojun"):
        runtime_loader.load_superhaojun_build_runtime()


def test_runtime_loader_prepends_superhaojun_src_only_once(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime_loader = importlib.import_module("services.site_agent.runtime_loader")
    existing_path = "/tmp/already-here"
    superhaojun_src = str(runtime_loader.SUPERHAOJUN_SRC_PATH)

    monkeypatch.setattr(
        runtime_loader.sys,
        "path",
        [existing_path],
    )
    monkeypatch.setattr(
        runtime_loader,
        "import_module",
        lambda name: SimpleNamespace(
            build_runtime=lambda **kwargs: kwargs,
            __file__=str(RUNTIME_MODULE),
        ),
    )

    runtime_loader.load_superhaojun_build_runtime()
    runtime_loader.load_superhaojun_build_runtime()

    assert runtime_loader.sys.path[0] == superhaojun_src
    assert runtime_loader.sys.path.count(superhaojun_src) == 1
    assert runtime_loader.sys.path[1] == existing_path


def test_runtime_loader_raises_clear_error_for_missing_transitive_dependency(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime_loader = importlib.import_module("services.site_agent.runtime_loader")

    def raise_missing_dependency(name: str) -> SimpleNamespace:
        error = ModuleNotFoundError("No module named 'openai'")
        error.name = "openai"
        raise error

    monkeypatch.setattr(runtime_loader, "import_module", raise_missing_dependency)

    with pytest.raises(RuntimeError, match="openai|backend environment|SuperHaojun runtime"):
        runtime_loader.load_superhaojun_build_runtime()
