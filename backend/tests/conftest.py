import json
import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("ADMIN_PASSWORD", "test-password")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("OPENROUTER_API_KEY", "sk-test-key")

from main import create_app
from services.ideas_store import IdeasStore
from services.workflow_runs_store import WorkflowRunsStore


@pytest.fixture
def tmp_data_dir(tmp_path):
    ideas_file = tmp_path / "ideas.json"
    ideas_file.write_text(json.dumps({"version": "1", "updated_at": "", "ideas": []}))
    return str(tmp_path)


@pytest.fixture
def ideas_store(tmp_data_dir):
    return IdeasStore(data_dir=tmp_data_dir)


@pytest.fixture
def workflow_runs_store(tmp_path):
    return WorkflowRunsStore(runs_dir=str(tmp_path / "workflow-runs"))


@pytest.fixture
def app(ideas_store, workflow_runs_store):
    return create_app(
        ideas_store_instance=ideas_store,
        workflow_runs_store_instance=workflow_runs_store,
    )


@pytest_asyncio.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
