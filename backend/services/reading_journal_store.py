from __future__ import annotations

import asyncio
import json
import secrets
from pathlib import Path
from typing import Optional

from config import settings
from models.reading_journal import (
    CommentStatus,
    JournalComment,
    Quote,
    QuotePayload,
    ReadingJournalEntry,
    ReadingJournalEntryCreate,
    ReadingJournalEntryUpdate,
    SharedReadingJournalEntry,
    VisitorCommentCreate,
    utc_now_iso,
)


class ReadingJournalStore:
    def __init__(self, data_dir: str | None = None):
        self._dir = Path(data_dir or settings.data_dir)
        self._file = self._dir / "reading-journal.json"
        self._lock = asyncio.Lock()
        self._dir.mkdir(parents=True, exist_ok=True)
        if not self._file.exists():
            self._write_sync({"version": "1", "updated_at": "", "entries": []})

    def _write_sync(self, data: dict) -> None:
        self._file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    async def _read(self) -> dict:
        async with self._lock:
            text = self._file.read_text(encoding="utf-8")
            return json.loads(text)

    async def _write(self, data: dict) -> None:
        data["updated_at"] = utc_now_iso()
        async with self._lock:
            self._write_sync(data)

    def _entry_from_item(self, item: dict) -> ReadingJournalEntry:
        return ReadingJournalEntry(**item)

    def _quote_from_payload(self, quote: QuotePayload) -> Quote:
        data = quote.model_dump(exclude_none=True)
        return Quote(**data)

    def _to_shared_entry(self, entry: ReadingJournalEntry) -> SharedReadingJournalEntry:
        approved_comments = [
            comment for comment in entry.comments if comment.status == CommentStatus.APPROVED
        ]
        return SharedReadingJournalEntry(
            id=entry.id,
            book=entry.book,
            status=entry.status,
            rating=entry.rating,
            short_impression=entry.short_impression,
            public_impression=entry.public_impression,
            comments=approved_comments,
        )

    async def list_entries(self) -> list[ReadingJournalEntry]:
        data = await self._read()
        return [self._entry_from_item(item) for item in data.get("entries", [])]

    async def get_meta(self) -> dict:
        data = await self._read()
        return {
            "updated_at": data.get("updated_at", ""),
            "count": len(data.get("entries", [])),
        }

    async def get_entry(self, entry_id: str) -> Optional[ReadingJournalEntry]:
        data = await self._read()
        for item in data.get("entries", []):
            if item["id"] == entry_id:
                return self._entry_from_item(item)
        return None

    async def create_entry(self, payload: ReadingJournalEntryCreate) -> ReadingJournalEntry:
        data = await self._read()
        entry = ReadingJournalEntry(
            **payload.model_dump(exclude={"quotes"}),
            quotes=[self._quote_from_payload(quote) for quote in payload.quotes],
        )
        data["entries"].append(entry.model_dump())
        await self._write(data)
        return entry

    async def update_entry(
        self,
        entry_id: str,
        updates: ReadingJournalEntryUpdate,
    ) -> Optional[ReadingJournalEntry]:
        data = await self._read()
        update_data = updates.model_dump(exclude_unset=True)
        for index, item in enumerate(data["entries"]):
            if item["id"] != entry_id:
                continue

            if "quotes" in update_data:
                quote_payloads = updates.quotes or []
                item["quotes"] = [
                    self._quote_from_payload(quote).model_dump() for quote in quote_payloads
                ]
                update_data.pop("quotes")

            for key, value in update_data.items():
                item[key] = value.model_dump() if hasattr(value, "model_dump") else value

            if item.get("comments_enabled") is False:
                item["share_token"] = None

            item["updated_at"] = utc_now_iso()
            data["entries"][index] = item
            await self._write(data)
            return self._entry_from_item(item)
        return None

    async def delete_entry(self, entry_id: str) -> bool:
        data = await self._read()
        before = len(data["entries"])
        data["entries"] = [item for item in data["entries"] if item["id"] != entry_id]
        if len(data["entries"]) < before:
            await self._write(data)
            return True
        return False

    async def generate_share_token(self, entry_id: str) -> Optional[str]:
        data = await self._read()
        for index, item in enumerate(data["entries"]):
            if item["id"] != entry_id:
                continue
            token = secrets.token_urlsafe(24)
            item["comments_enabled"] = True
            item["share_token"] = token
            item["updated_at"] = utc_now_iso()
            data["entries"][index] = item
            await self._write(data)
            return token
        return None

    async def get_shared_entry(self, share_token: str) -> Optional[SharedReadingJournalEntry]:
        entry = await self._get_entry_by_share_token(share_token)
        if not entry:
            return None
        return self._to_shared_entry(entry)

    async def add_comment_by_token(
        self,
        share_token: str,
        payload: VisitorCommentCreate,
    ) -> Optional[JournalComment]:
        data = await self._read()
        for index, item in enumerate(data["entries"]):
            if not self._share_token_matches(item, share_token):
                continue
            comment = JournalComment(**payload.model_dump())
            item.setdefault("comments", []).append(comment.model_dump())
            item["updated_at"] = utc_now_iso()
            data["entries"][index] = item
            await self._write(data)
            return comment
        return None

    async def list_comments(
        self,
        entry_id: str,
        status: Optional[CommentStatus] = None,
    ) -> Optional[list[JournalComment]]:
        entry = await self.get_entry(entry_id)
        if not entry:
            return None
        comments = entry.comments
        if status:
            comments = [comment for comment in comments if comment.status == status]
        return comments

    async def update_comment_status(
        self,
        entry_id: str,
        comment_id: str,
        status: CommentStatus,
    ) -> Optional[JournalComment]:
        data = await self._read()
        for entry_index, item in enumerate(data["entries"]):
            if item["id"] != entry_id:
                continue
            for comment_index, comment_data in enumerate(item.get("comments", [])):
                if comment_data["id"] != comment_id:
                    continue
                comment_data["status"] = status
                comment_data["moderated_at"] = utc_now_iso()
                item["comments"][comment_index] = comment_data
                item["updated_at"] = utc_now_iso()
                data["entries"][entry_index] = item
                await self._write(data)
                return JournalComment(**comment_data)
        return None

    async def delete_comment(self, entry_id: str, comment_id: str) -> bool:
        data = await self._read()
        for index, item in enumerate(data["entries"]):
            if item["id"] != entry_id:
                continue
            before = len(item.get("comments", []))
            item["comments"] = [
                comment for comment in item.get("comments", []) if comment["id"] != comment_id
            ]
            if len(item["comments"]) < before:
                item["updated_at"] = utc_now_iso()
                data["entries"][index] = item
                await self._write(data)
                return True
        return False

    async def _get_entry_by_share_token(
        self,
        share_token: str,
    ) -> Optional[ReadingJournalEntry]:
        data = await self._read()
        for item in data.get("entries", []):
            if self._share_token_matches(item, share_token):
                return self._entry_from_item(item)
        return None

    def _share_token_matches(self, item: dict, share_token: str) -> bool:
        return bool(
            share_token
            and item.get("comments_enabled") is True
            and item.get("share_token") == share_token
        )


reading_journal_store = ReadingJournalStore()
