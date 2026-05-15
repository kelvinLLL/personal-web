from typing import Annotated, Optional

from fastapi import APIRouter, HTTPException, Query, Request, status

from models.reading_journal import (
    CommentStatus,
    CommentStatusUpdate,
    JournalComment,
    ReadingJournalEntry,
    ReadingJournalEntryCreate,
    ReadingJournalEntryUpdate,
    ShareTokenResponse,
    SharedReadingJournalEntry,
    VisitorCommentCreate,
)
from services.auth import CurrentUser

router = APIRouter(prefix="/api/reading-journal", tags=["reading-journal"])


def get_reading_journal_store(request: Request):
    return request.app.state.reading_journal_store


@router.get("/shared/{share_token}", response_model=SharedReadingJournalEntry)
async def get_shared_entry(share_token: str, request: Request):
    entry = await get_reading_journal_store(request).get_shared_entry(share_token)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared entry not found")
    return entry


@router.post(
    "/shared/{share_token}/comments",
    response_model=JournalComment,
    status_code=status.HTTP_201_CREATED,
)
async def create_shared_comment(
    share_token: str,
    body: VisitorCommentCreate,
    request: Request,
):
    comment = await get_reading_journal_store(request).add_comment_by_token(share_token, body)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared entry not found")
    return comment


@router.get("", response_model=list[ReadingJournalEntry])
async def list_entries(request: Request, _user: CurrentUser):
    return await get_reading_journal_store(request).list_entries()


@router.get("/meta")
async def get_reading_journal_meta(request: Request, _user: CurrentUser):
    return await get_reading_journal_store(request).get_meta()


@router.post("", response_model=ReadingJournalEntry, status_code=status.HTTP_201_CREATED)
async def create_entry(body: ReadingJournalEntryCreate, request: Request, _user: CurrentUser):
    return await get_reading_journal_store(request).create_entry(body)


@router.get("/{entry_id}", response_model=ReadingJournalEntry)
async def get_entry(entry_id: str, request: Request, _user: CurrentUser):
    entry = await get_reading_journal_store(request).get_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return entry


@router.put("/{entry_id}", response_model=ReadingJournalEntry)
async def update_entry(
    entry_id: str,
    body: ReadingJournalEntryUpdate,
    request: Request,
    _user: CurrentUser,
):
    entry = await get_reading_journal_store(request).update_entry(entry_id, body)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(entry_id: str, request: Request, _user: CurrentUser):
    deleted = await get_reading_journal_store(request).delete_entry(entry_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")


@router.post("/{entry_id}/share-token", response_model=ShareTokenResponse)
async def generate_share_token(entry_id: str, request: Request, _user: CurrentUser):
    share_token = await get_reading_journal_store(request).generate_share_token(entry_id)
    if not share_token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return ShareTokenResponse(share_token=share_token)


@router.get("/{entry_id}/comments", response_model=list[JournalComment])
async def list_comments(
    entry_id: str,
    request: Request,
    _user: CurrentUser,
    status_filter: Annotated[Optional[CommentStatus], Query(alias="status")] = None,
):
    comments = await get_reading_journal_store(request).list_comments(
        entry_id,
        status=status_filter,
    )
    if comments is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return comments


@router.put("/{entry_id}/comments/{comment_id}", response_model=JournalComment)
async def update_comment_status(
    entry_id: str,
    comment_id: str,
    body: CommentStatusUpdate,
    request: Request,
    _user: CurrentUser,
):
    comment = await get_reading_journal_store(request).update_comment_status(
        entry_id,
        comment_id,
        body.status,
    )
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    return comment


@router.delete("/{entry_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(entry_id: str, comment_id: str, request: Request, _user: CurrentUser):
    deleted = await get_reading_journal_store(request).delete_comment(entry_id, comment_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
