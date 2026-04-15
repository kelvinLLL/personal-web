import pytest
from services.auth import create_token


@pytest.fixture
def auth_headers():
    token, _ = create_token("admin")
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_list_models(client):
    r = await client.get("/api/models")
    assert r.status_code == 200
    data = r.json()
    assert "models" in data
    assert "active" in data
    assert "default" in data
    assert isinstance(data["models"], list)
    assert len(data["models"]) > 0


@pytest.mark.asyncio
async def test_switch_model_requires_auth(client):
    r = await client.post("/api/models/active", json={"key": "nonexistent"})
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_switch_model_success(client, auth_headers):
    # Get a valid model key first
    listing = await client.get("/api/models")
    valid_key = listing.json()["models"][0]["key"]

    r = await client.post(
        "/api/models/active",
        json={"key": valid_key},
        headers=auth_headers,
    )
    assert r.status_code == 200
    assert r.json()["active"] == valid_key


@pytest.mark.asyncio
async def test_switch_model_invalid_key(client, auth_headers):
    r = await client.post(
        "/api/models/active",
        json={"key": "nonexistent-model"},
        headers=auth_headers,
    )
    assert r.status_code == 400
