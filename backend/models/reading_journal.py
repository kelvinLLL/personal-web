from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ReadingStatus(str, Enum):
    PLANNED = "planned"
    READING = "reading"
    FINISHED = "finished"
    PAUSED = "paused"
    ABANDONED = "abandoned"


class CommentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class BookNote(BaseModel):
    title: str = Field(min_length=1)
    author: str = ""
    original_title: str = ""
    translator: str = ""
    publisher: str = ""
    language: str = "ja"
    tags: list[str] = Field(default_factory=list)


class QuotePayload(BaseModel):
    id: Optional[str] = None
    text: str = Field(min_length=1)
    chapter: str = ""
    page: str = ""
    location: str = ""
    note: str = ""
    tags: list[str] = Field(default_factory=list)
    is_spoiler: bool = False
    created_at: Optional[str] = None


class Quote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str = Field(min_length=1)
    chapter: str = ""
    page: str = ""
    location: str = ""
    note: str = ""
    tags: list[str] = Field(default_factory=list)
    is_spoiler: bool = False
    created_at: str = Field(default_factory=utc_now_iso)


class JournalComment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    display_name: str = Field(min_length=1, max_length=80)
    body: str = Field(min_length=1, max_length=2000)
    status: CommentStatus = CommentStatus.PENDING
    created_at: str = Field(default_factory=utc_now_iso)
    moderated_at: Optional[str] = None


class VisitorCommentCreate(BaseModel):
    display_name: str = Field(min_length=1, max_length=80)
    body: str = Field(min_length=1, max_length=2000)


class ReadingJournalEntryBase(BaseModel):
    book: BookNote
    status: ReadingStatus = ReadingStatus.PLANNED
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    started_on: str = ""
    finished_on: str = ""
    short_impression: str = ""
    public_impression: str = ""
    reflection: str = ""


class ReadingJournalEntryCreate(ReadingJournalEntryBase):
    quotes: list[QuotePayload] = Field(default_factory=list)


class ReadingJournalEntryUpdate(BaseModel):
    book: Optional[BookNote] = None
    status: Optional[ReadingStatus] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    started_on: Optional[str] = None
    finished_on: Optional[str] = None
    short_impression: Optional[str] = None
    public_impression: Optional[str] = None
    reflection: Optional[str] = None
    quotes: Optional[list[QuotePayload]] = None
    comments_enabled: Optional[bool] = None


class ReadingJournalEntry(ReadingJournalEntryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quotes: list[Quote] = Field(default_factory=list)
    comments_enabled: bool = False
    share_token: Optional[str] = None
    comments: list[JournalComment] = Field(default_factory=list)
    created_at: str = Field(default_factory=utc_now_iso)
    updated_at: str = Field(default_factory=utc_now_iso)


class SharedReadingJournalEntry(BaseModel):
    id: str
    book: BookNote
    status: ReadingStatus
    rating: Optional[float] = None
    short_impression: str = ""
    public_impression: str = ""
    comments: list[JournalComment] = Field(default_factory=list)


class ShareTokenResponse(BaseModel):
    share_token: str


class CommentStatusUpdate(BaseModel):
    status: CommentStatus
