from __future__ import annotations

import asyncio
import json
from pathlib import Path

from config import settings
from models.workflow_run import WorkflowRun


class WorkflowRunsStore:
    def __init__(self, runs_dir: str | None = None):
        self._dir = Path(runs_dir or settings.workflow_runs_dir)
        self._dir.mkdir(parents=True, exist_ok=True)
        self._lock = asyncio.Lock()

    def _path_for(self, run_id: str) -> Path:
        return self._dir / f"{run_id}.json"

    async def save_run(self, run: WorkflowRun) -> WorkflowRun:
        async with self._lock:
            self._path_for(run.id).write_text(
                json.dumps(run.model_dump(), indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
        return run

    async def get_run(self, run_id: str) -> WorkflowRun | None:
        async with self._lock:
            path = self._path_for(run_id)
            if not path.exists():
                return None
            return WorkflowRun(**json.loads(path.read_text(encoding="utf-8")))


workflow_runs_store = WorkflowRunsStore()
