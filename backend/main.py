from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import auth, ideas, models, proxy, workflow
from services.ideas_store import ideas_store
from services.workflow_runs_store import workflow_runs_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def create_app(*, ideas_store_instance=None, workflow_runs_store_instance=None) -> FastAPI:
    app = FastAPI(title="Personal Web API", lifespan=lifespan)

    app.state.ideas_store = ideas_store_instance or ideas_store
    app.state.workflow_runs_store = workflow_runs_store_instance or workflow_runs_store

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(models.router)
    app.include_router(proxy.router)
    app.include_router(ideas.router)
    app.include_router(workflow.router)

    @app.get("/api/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
