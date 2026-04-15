from typing import Optional

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request, status

from models.idea import (
    IdeaCategory,
    IdeaCreate,
    IdeaStatus,
    IdeaUpdate,
    ProjectIdea,
)

router = APIRouter(prefix="/api/ideas", tags=["ideas"])


def get_ideas_store(request: Request):
    return request.app.state.ideas_store


@router.get("", response_model=list[ProjectIdea])
async def list_ideas(
    request: Request,
    status_param: Annotated[Optional[IdeaStatus], Query(alias="status")] = None,
    status_filter: Optional[IdeaStatus] = None,
    category: Optional[IdeaCategory] = None,
):
    effective_status = status_param if status_param is not None else status_filter
    return await get_ideas_store(request).list_ideas(status=effective_status, category=category)


@router.get("/meta")
async def get_ideas_meta(request: Request):
    return await get_ideas_store(request).get_meta()


@router.get("/{idea_id}", response_model=ProjectIdea)
async def get_idea(idea_id: str, request: Request):
    idea = await get_ideas_store(request).get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
    return idea


@router.post("", response_model=ProjectIdea, status_code=status.HTTP_201_CREATED)
async def create_idea(body: IdeaCreate, request: Request):
    idea = ProjectIdea(**body.model_dump())
    return await get_ideas_store(request).create_idea(idea)


@router.put("/{idea_id}", response_model=ProjectIdea)
async def update_idea(idea_id: str, body: IdeaUpdate, request: Request):
    updates = body.model_dump(exclude_unset=True)
    idea = await get_ideas_store(request).update_idea(idea_id, updates)
    if not idea:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
    return idea


@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_idea(idea_id: str, request: Request):
    deleted = await get_ideas_store(request).delete_idea(idea_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
