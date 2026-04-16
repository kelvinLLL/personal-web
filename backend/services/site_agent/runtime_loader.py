from __future__ import annotations

from importlib import import_module
from pathlib import Path
from typing import Any, Callable
import sys


REPO_ROOT = Path(__file__).resolve().parents[3]
SUPERHAOJUN_SRC_PATH = REPO_ROOT / "apps" / "superhaojun" / "src"


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

    try:
        runtime_module = import_module("superhaojun.runtime")
    except ModuleNotFoundError as exc:
        if exc.name == "superhaojun":
            raise RuntimeError(
                "Mounted SuperHaojun runtime could not be imported from "
                f"{SUPERHAOJUN_SRC_PATH}."
            ) from exc
        raise

    build_runtime = getattr(runtime_module, "build_runtime", None)
    if not callable(build_runtime):
        raise RuntimeError("Mounted SuperHaojun runtime does not export a callable build_runtime.")

    return build_runtime
