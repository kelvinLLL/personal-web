from __future__ import annotations

from importlib import import_module, invalidate_caches
from pathlib import Path
from typing import Any, Callable
import sys


REPO_ROOT = Path(__file__).resolve().parents[3]
SUPERHAOJUN_SRC_PATH = REPO_ROOT / "apps" / "superhaojun" / "src"
SUPERHAOJUN_PACKAGE_PATH = SUPERHAOJUN_SRC_PATH / "superhaojun"


def _is_mounted_runtime_module(module: Any, runtime_path: Path) -> bool:
    module_file = getattr(module, "__file__", None)
    return module_file is not None and Path(module_file).resolve() == runtime_path.resolve()


def _is_mounted_package_module(module: Any) -> bool:
    package_paths = getattr(module, "__path__", None)
    if not package_paths:
        return False
    mounted_package_path = SUPERHAOJUN_PACKAGE_PATH.resolve()
    return any(Path(package_path).resolve() == mounted_package_path for package_path in package_paths)


def _clear_polluted_superhaojun_modules(runtime_path: Path) -> None:
    runtime_module = sys.modules.get("superhaojun.runtime")
    package_module = sys.modules.get("superhaojun")

    runtime_is_mounted = runtime_module is None or _is_mounted_runtime_module(runtime_module, runtime_path)
    package_is_mounted = package_module is None or _is_mounted_package_module(package_module)
    if runtime_is_mounted and package_is_mounted:
        return

    for module_name in list(sys.modules):
        if module_name == "superhaojun" or module_name.startswith("superhaojun."):
            sys.modules.pop(module_name, None)

    invalidate_caches()


def load_superhaojun_build_runtime() -> Callable[..., Any]:
    """Load the mounted SuperHaojun build_runtime entrypoint."""
    runtime_path = SUPERHAOJUN_SRC_PATH / "superhaojun" / "runtime.py"
    if not runtime_path.exists():
        raise RuntimeError(
            "Mounted SuperHaojun runtime not found at "
            f"{runtime_path}. Initialize the apps/superhaojun submodule first."
        )

    superhaojun_src = str(SUPERHAOJUN_SRC_PATH)
    if superhaojun_src not in sys.path:
        sys.path.insert(0, superhaojun_src)

    _clear_polluted_superhaojun_modules(runtime_path)

    try:
        runtime_module = import_module("superhaojun.runtime")
    except ModuleNotFoundError as exc:
        if exc.name == "superhaojun":
            raise RuntimeError(
                "Mounted SuperHaojun runtime could not be imported from "
                f"{SUPERHAOJUN_SRC_PATH}."
            ) from exc
        raise RuntimeError(
            "Mounted SuperHaojun runtime could not be imported because the backend "
            f"environment is missing dependency '{exc.name or 'unknown'}'."
        ) from exc

    if not _is_mounted_runtime_module(runtime_module, runtime_path):
        raise RuntimeError(
            "Mounted SuperHaojun runtime resolved to an unexpected module at "
            f"{getattr(runtime_module, '__file__', 'unknown')} instead of {runtime_path}."
        )

    build_runtime = getattr(runtime_module, "build_runtime", None)
    if not callable(build_runtime):
        raise RuntimeError("Mounted SuperHaojun runtime does not export a callable build_runtime.")

    return build_runtime
