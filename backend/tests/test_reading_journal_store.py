import pytest

from models.reading_journal import (
    BookNote,
    CommentStatus,
    ReadingJournalEntryCreate,
    ReadingStatus,
    VisitorCommentCreate,
)
from services.reading_journal_store import ReadingJournalStore


@pytest.fixture
def reading_journal_store(tmp_path):
    return ReadingJournalStore(data_dir=str(tmp_path))


def make_entry_payload() -> ReadingJournalEntryCreate:
    return ReadingJournalEntryCreate(
        book=BookNote(
            title="Kokoro",
            author="Natsume Soseki",
            original_title="こころ",
            language="ja",
            tags=["japanese-literature", "modern"],
        ),
        status=ReadingStatus.READING,
        rating=4.5,
        short_impression="A quiet study of distance and guilt.",
        public_impression="This one lingers after the final letter.",
        reflection="Private reading notes stay here.",
        quotes=[
            {
                "text": "A sentence worth keeping.",
                "chapter": "Sensei and I",
                "page": "42",
                "note": "This belongs in the notebook.",
                "tags": ["loneliness"],
            }
        ],
    )


@pytest.mark.asyncio
async def test_create_and_get_reading_journal_entry(reading_journal_store):
    created = await reading_journal_store.create_entry(make_entry_payload())

    assert created.id
    assert created.book.title == "Kokoro"
    assert created.status == ReadingStatus.READING
    assert created.rating == 4.5
    assert created.quotes[0].id
    assert created.comments == []

    fetched = await reading_journal_store.get_entry(created.id)
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.reflection == "Private reading notes stay here."


@pytest.mark.asyncio
async def test_share_token_allows_pending_visitor_comment(reading_journal_store):
    created = await reading_journal_store.create_entry(make_entry_payload())
    share_token = await reading_journal_store.generate_share_token(created.id)

    shared_before = await reading_journal_store.get_shared_entry(share_token)
    assert shared_before is not None
    assert shared_before.book.title == "Kokoro"
    assert shared_before.comments == []

    comment = await reading_journal_store.add_comment_by_token(
        share_token,
        VisitorCommentCreate(display_name="Mina", body="I felt the same after reading it."),
    )
    assert comment.status == CommentStatus.PENDING

    shared_after_pending = await reading_journal_store.get_shared_entry(share_token)
    assert shared_after_pending is not None
    assert shared_after_pending.comments == []

    approved = await reading_journal_store.update_comment_status(
        created.id,
        comment.id,
        CommentStatus.APPROVED,
    )
    assert approved is not None
    assert approved.status == CommentStatus.APPROVED

    shared_after_approval = await reading_journal_store.get_shared_entry(share_token)
    assert shared_after_approval is not None
    assert len(shared_after_approval.comments) == 1
    assert shared_after_approval.comments[0].body == "I felt the same after reading it."


@pytest.mark.asyncio
async def test_shared_entry_hides_private_reflection_and_quotes(reading_journal_store):
    created = await reading_journal_store.create_entry(make_entry_payload())
    share_token = await reading_journal_store.generate_share_token(created.id)

    shared = await reading_journal_store.get_shared_entry(share_token)

    assert shared is not None
    payload = shared.model_dump()
    assert payload["public_impression"] == "This one lingers after the final letter."
    assert "reflection" not in payload
    assert "quotes" not in payload
    assert "share_token" not in payload


@pytest.mark.asyncio
async def test_invalid_share_token_cannot_create_comment(reading_journal_store):
    comment = await reading_journal_store.add_comment_by_token(
        "not-a-real-token",
        VisitorCommentCreate(display_name="Mina", body="Hello"),
    )

    assert comment is None
