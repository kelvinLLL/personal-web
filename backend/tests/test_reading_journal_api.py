import pytest

from services.auth import create_token


@pytest.fixture
def auth_headers():
    token, _ = create_token("admin")
    return {"Authorization": f"Bearer {token}"}


def entry_payload() -> dict:
    return {
        "book": {
            "title": "Kokoro",
            "author": "Natsume Soseki",
            "original_title": "こころ",
            "language": "ja",
            "tags": ["japanese-literature"],
        },
        "status": "reading",
        "rating": 4.5,
        "short_impression": "A quiet study of distance and guilt.",
        "public_impression": "This one lingers after the final letter.",
        "reflection": "Private notes stay owner-only.",
        "quotes": [
            {
                "text": "A sentence worth keeping.",
                "chapter": "Sensei and I",
                "note": "Private quote note.",
            }
        ],
    }


@pytest.mark.asyncio
async def test_reading_journal_owner_routes_require_auth(client):
    response = await client.get("/api/reading-journal")
    assert response.status_code in (401, 403)

    response = await client.post("/api/reading-journal", json=entry_payload())
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_owner_can_create_list_and_update_entry(client, auth_headers):
    created_response = await client.post(
        "/api/reading-journal",
        json=entry_payload(),
        headers=auth_headers,
    )
    assert created_response.status_code == 201
    created = created_response.json()
    entry_id = created["id"]
    assert created["book"]["title"] == "Kokoro"
    assert created["quotes"][0]["id"]

    list_response = await client.get("/api/reading-journal", headers=auth_headers)
    assert list_response.status_code == 200
    assert any(entry["id"] == entry_id for entry in list_response.json())

    update_response = await client.put(
        f"/api/reading-journal/{entry_id}",
        json={"status": "finished", "rating": 5},
        headers=auth_headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "finished"
    assert update_response.json()["rating"] == 5


@pytest.mark.asyncio
async def test_shared_comment_flow_hides_private_fields_until_approved(client, auth_headers):
    created_response = await client.post(
        "/api/reading-journal",
        json=entry_payload(),
        headers=auth_headers,
    )
    entry_id = created_response.json()["id"]

    token_response = await client.post(
        f"/api/reading-journal/{entry_id}/share-token",
        headers=auth_headers,
    )
    assert token_response.status_code == 200
    share_token = token_response.json()["share_token"]

    shared_response = await client.get(f"/api/reading-journal/shared/{share_token}")
    assert shared_response.status_code == 200
    shared = shared_response.json()
    assert shared["book"]["title"] == "Kokoro"
    assert shared["comments"] == []
    assert "reflection" not in shared
    assert "quotes" not in shared
    assert "share_token" not in shared

    comment_response = await client.post(
        f"/api/reading-journal/shared/{share_token}/comments",
        json={"display_name": "Mina", "body": "I felt the same after reading it."},
    )
    assert comment_response.status_code == 201
    comment = comment_response.json()
    assert comment["status"] == "pending"

    shared_pending_response = await client.get(f"/api/reading-journal/shared/{share_token}")
    assert shared_pending_response.json()["comments"] == []

    approved_response = await client.put(
        f"/api/reading-journal/{entry_id}/comments/{comment['id']}",
        json={"status": "approved"},
        headers=auth_headers,
    )
    assert approved_response.status_code == 200
    assert approved_response.json()["status"] == "approved"

    shared_approved_response = await client.get(f"/api/reading-journal/shared/{share_token}")
    assert len(shared_approved_response.json()["comments"]) == 1


@pytest.mark.asyncio
async def test_invalid_share_token_returns_not_found(client):
    shared_response = await client.get("/api/reading-journal/shared/not-real")
    assert shared_response.status_code == 404

    comment_response = await client.post(
        "/api/reading-journal/shared/not-real/comments",
        json={"display_name": "Mina", "body": "Hello"},
    )
    assert comment_response.status_code == 404
