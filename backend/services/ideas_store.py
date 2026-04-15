from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import Optional

from models.idea import IdeaCategory, IdeaStatus, ProjectIdea

from config import settings


class IdeasStore:
    def __init__(self, data_dir: str | None = None):
        self._dir = Path(data_dir or settings.data_dir)
        self._file = self._dir / "ideas.json"
        self._lock = asyncio.Lock()
        self._dir.mkdir(parents=True, exist_ok=True)
        if not self._file.exists():
            self._write_sync({"version": "1", "updated_at": "", "ideas": []})

    def _write_sync(self, data: dict) -> None:
        self._file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    async def _read(self) -> dict:
        async with self._lock:
            text = self._file.read_text(encoding="utf-8")
            return json.loads(text)

    async def _write(self, data: dict) -> None:
        from datetime import datetime, timezone

        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        async with self._lock:
            self._write_sync(data)

    async def list_ideas(
        self,
        status: Optional[IdeaStatus] = None,
        category: Optional[IdeaCategory] = None,
    ) -> list[ProjectIdea]:
        data = await self._read()
        ideas = [ProjectIdea(**item) for item in data.get("ideas", [])]
        if status:
            ideas = [i for i in ideas if i.status == status]
        if category:
            ideas = [i for i in ideas if i.category == category]
        return ideas

    async def get_meta(self) -> dict:
        data = await self._read()
        return {
            "updated_at": data.get("updated_at", ""),
            "count": len(data.get("ideas", [])),
        }

    async def get_idea(self, idea_id: str) -> Optional[ProjectIdea]:
        data = await self._read()
        for item in data.get("ideas", []):
            if item["id"] == idea_id:
                return ProjectIdea(**item)
        return None

    async def create_idea(self, idea: ProjectIdea) -> ProjectIdea:
        data = await self._read()
        data["ideas"].append(idea.model_dump())
        await self._write(data)
        return idea

    async def update_idea(self, idea_id: str, updates: dict) -> Optional[ProjectIdea]:
        data = await self._read()
        for i, item in enumerate(data["ideas"]):
            if item["id"] == idea_id:
                for key, value in updates.items():
                    if value is not None:
                        if hasattr(value, "model_dump"):
                            item[key] = value.model_dump()
                        else:
                            item[key] = value
                data["ideas"][i] = item
                await self._write(data)
                return ProjectIdea(**item)
        return None

    async def delete_idea(self, idea_id: str) -> bool:
        data = await self._read()
        before = len(data["ideas"])
        data["ideas"] = [item for item in data["ideas"] if item["id"] != idea_id]
        if len(data["ideas"]) < before:
            await self._write(data)
            return True
        return False

    async def add_ideas(self, ideas: list[ProjectIdea]) -> list[ProjectIdea]:
        data = await self._read()
        existing_titles = {item["title"].lower() for item in data["ideas"]}
        added: list[ProjectIdea] = []
        for idea in ideas:
            if idea.title.lower() not in existing_titles:
                data["ideas"].append(idea.model_dump())
                existing_titles.add(idea.title.lower())
                added.append(idea)
        await self._write(data)
        return added


ideas_store = IdeasStore()
