import pytest
from httpx import ASGITransport, AsyncClient
from pathlib import Path

from main import app
from services.auth import create_token


REAL_IDEAS_FILE = Path(__file__).resolve().parent.parent / "data" / "ideas.json"


@pytest.fixture
def auth_headers():
    token, _ = create_token("admin")
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_login_success(client):
    r = await client.post("/api/auth/login", json={"password": "test-password"})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data
    assert "expires_at" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    r = await client.post("/api/auth/login", json={"password": "wrong"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_ideas_crud(client, auth_headers):
    # Create
    r = await client.post(
        "/api/ideas",
        json={
            "title": "API Test Idea",
            "tagline": "Testing via API",
            "category": "tool",
            "scores": {"value": 7, "learnability": 6, "fun": 8, "feasibility": 9, "overall": 8},
        },
    )
    assert r.status_code == 201
    idea = r.json()
    idea_id = idea["id"]
    assert idea["title"] == "API Test Idea"

    # List
    r = await client.get("/api/ideas")
    assert r.status_code == 200
    ideas = r.json()
    assert any(i["id"] == idea_id for i in ideas)

    # Get by ID
    r = await client.get(f"/api/ideas/{idea_id}")
    assert r.status_code == 200
    assert r.json()["title"] == "API Test Idea"

    # Update
    r = await client.put(
        f"/api/ideas/{idea_id}",
        json={"title": "Updated Idea"},
    )
    assert r.status_code == 200
    assert r.json()["title"] == "Updated Idea"

    # Delete
    r = await client.delete(f"/api/ideas/{idea_id}")
    assert r.status_code == 204

    # Verify deleted
    r = await client.get(f"/api/ideas/{idea_id}")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_ideas_filter(client):
    await client.post(
        "/api/ideas",
        json={"title": "Tool X", "tagline": "x", "category": "tool", "scores": {"value": 5, "learnability": 5, "fun": 5, "feasibility": 5, "overall": 5}},
    )
    await client.post(
        "/api/ideas",
        json={"title": "Toy Y", "tagline": "y", "category": "toy", "scores": {"value": 5, "learnability": 5, "fun": 5, "feasibility": 5, "overall": 5}},
    )

    r = await client.get("/api/ideas?category=tool")
    data = r.json()
    assert all(i["category"] == "tool" for i in data)


@pytest.mark.asyncio
async def test_ideas_filter_by_status_param(client):
    await client.post(
        "/api/ideas",
        json={"title": "Done Idea", "tagline": "done", "category": "tool", "status": "done", "scores": {"value": 5, "learnability": 5, "fun": 5, "feasibility": 5, "overall": 5}},
    )
    await client.post(
        "/api/ideas",
        json={"title": "Pending Idea", "tagline": "pending", "category": "tool", "status": "pending", "scores": {"value": 5, "learnability": 5, "fun": 5, "feasibility": 5, "overall": 5}},
    )

    r = await client.get("/api/ideas?status=done")
    assert r.status_code == 200
    data = r.json()
    assert any(item["title"] == "Done Idea" for item in data)
    assert all(item["status"] == "done" for item in data)
    assert all(item["title"] != "Pending Idea" for item in data)


@pytest.mark.asyncio
async def test_ideas_meta_returns_freshness(client):
    await client.post(
        "/api/ideas",
        json={"title": "Meta Idea", "tagline": "meta", "category": "tool", "scores": {"value": 5, "learnability": 5, "fun": 5, "feasibility": 5, "overall": 5}},
    )

    r = await client.get("/api/ideas/meta")
    assert r.status_code == 200
    data = r.json()
    assert "updated_at" in data
    assert "count" in data
    assert data["count"] >= 1
    assert data["updated_at"]


@pytest.mark.asyncio
async def test_cors_allows_localhost_ports(client):
    r = await client.options(
        "/api/ideas",
        headers={
            "Origin": "http://127.0.0.1:3001",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == "http://127.0.0.1:3001"


@pytest.mark.asyncio
async def test_proxy_requires_auth(client):
    r = await client.post("/api/proxy/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_workflow_requires_auth(client):
    r = await client.post("/api/ideas/workflow", json={"direction": ""})
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_api_tests_do_not_mutate_real_ideas_file(client):
    before = REAL_IDEAS_FILE.read_text(encoding="utf-8")
    try:
        r = await client.post(
            "/api/ideas",
            json={
                "title": "Isolation Check Idea",
                "tagline": "should not leak into real data",
                "category": "tool",
                "scores": {"value": 6, "learnability": 6, "fun": 6, "feasibility": 6, "overall": 6},
            },
        )
        assert r.status_code == 201
        after = REAL_IDEAS_FILE.read_text(encoding="utf-8")
    finally:
        REAL_IDEAS_FILE.write_text(before, encoding="utf-8")

    assert after == before
