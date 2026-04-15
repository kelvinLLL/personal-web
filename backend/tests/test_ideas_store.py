import pytest

from models.idea import ProjectIdea, Scores, IdeaDetail, IdeaMeta


@pytest.mark.asyncio
async def test_list_ideas_empty(ideas_store):
    ideas = await ideas_store.list_ideas()
    assert ideas == []


@pytest.mark.asyncio
async def test_create_and_get_idea(ideas_store):
    idea = ProjectIdea(
        title="Test Idea",
        tagline="A test",
        category="tool",
        scores=Scores(value=7, learnability=6, fun=8, feasibility=9, overall=8),
    )
    created = await ideas_store.create_idea(idea)
    assert created.id == idea.id

    fetched = await ideas_store.get_idea(idea.id)
    assert fetched is not None
    assert fetched.title == "Test Idea"


@pytest.mark.asyncio
async def test_list_ideas_with_filter(ideas_store):
    idea1 = ProjectIdea(title="Tool A", tagline="a", category="tool", scores=Scores(value=5, learnability=5, fun=5, feasibility=5, overall=5))
    idea2 = ProjectIdea(title="Toy B", tagline="b", category="toy", scores=Scores(value=5, learnability=5, fun=5, feasibility=5, overall=5))
    await ideas_store.create_idea(idea1)
    await ideas_store.create_idea(idea2)

    tools = await ideas_store.list_ideas(category="tool")
    assert len(tools) == 1
    assert tools[0].title == "Tool A"


@pytest.mark.asyncio
async def test_update_idea(ideas_store):
    idea = ProjectIdea(title="Original", tagline="tag", category="tool", scores=Scores(value=5, learnability=5, fun=5, feasibility=5, overall=5))
    await ideas_store.create_idea(idea)

    updated = await ideas_store.update_idea(idea.id, {"title": "Updated"})
    assert updated is not None
    assert updated.title == "Updated"
    assert updated.tagline == "tag"


@pytest.mark.asyncio
async def test_delete_idea(ideas_store):
    idea = ProjectIdea(title="ToDelete", tagline="tag", category="tool", scores=Scores(value=5, learnability=5, fun=5, feasibility=5, overall=5))
    await ideas_store.create_idea(idea)

    deleted = await ideas_store.delete_idea(idea.id)
    assert deleted is True

    fetched = await ideas_store.get_idea(idea.id)
    assert fetched is None


@pytest.mark.asyncio
async def test_delete_nonexistent(ideas_store):
    deleted = await ideas_store.delete_idea("nonexistent")
    assert deleted is False


@pytest.mark.asyncio
async def test_add_ideas_deduplicates(ideas_store):
    idea1 = ProjectIdea(title="Unique Idea", tagline="a", category="tool", scores=Scores(value=5, learnability=5, fun=5, feasibility=5, overall=5))
    await ideas_store.create_idea(idea1)

    idea2 = ProjectIdea(title="Unique Idea", tagline="b", category="toy", scores=Scores(value=7, learnability=7, fun=7, feasibility=7, overall=7))
    idea3 = ProjectIdea(title="New Idea", tagline="c", category="tool", scores=Scores(value=6, learnability=6, fun=6, feasibility=6, overall=6))
    await ideas_store.add_ideas([idea2, idea3])

    all_ideas = await ideas_store.list_ideas()
    assert len(all_ideas) == 2
    titles = {i.title for i in all_ideas}
    assert titles == {"Unique Idea", "New Idea"}
