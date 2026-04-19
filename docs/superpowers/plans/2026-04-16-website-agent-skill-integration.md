# Website Agent Skill Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first website-agent slice by mounting `SuperHaojun` at `apps/superhaojun`, exposing a website-owned skill and capability layer for `Ideas` plus site intro/navigation, and rendering a floating chat shell that supports both inline interaction and explicit page transitions.

**Architecture:** Keep `SuperHaojun` as the canonical runtime and add a thin website adapter in the backend. The backend owns a small capability registry, website skill assets, and runtime-to-site tool registration; the frontend owns a floating agent shell, route-aware context, and structured rendering for inline answers, navigation suggestions, and workflow run state.

**Tech Stack:** FastAPI, Python 3.11+, React 19, React Router 7, TypeScript, Zustand, Vitest, Testing Library, pytest, existing `SuperHaojun` runtime at `apps/superhaojun`

---

### Task 0: Sync Docs-First Context Before Implementation

**Files:**
- Modify: `docs/features/agent-harness-integration.md`
- Modify: `docs/integrations/superhaojun-env-handoff.md` only if local bootstrap facts changed

- [ ] **Step 1: Re-open the feature doc and verify the implementation boundary**

Confirm the feature doc still matches the approved slice:

- floating shell
- inline and transition modes
- `apps/superhaojun`
- skill-first contract layer
- first `Ideas`-focused integration loop

- [ ] **Step 2: Update the feature doc before code if the active boundary changed**

Refresh only if needed:

- `entrypoints`
- `Current Design`
- `Change Notes`

- [ ] **Step 3: Sanity-check the env handoff before touching runtime bootstrap**

Verify the handoff doc still reflects:

- `backend/.env`
- `apps/superhaojun/.env`
- no required `.haojun/` config for the first slice

### Task 1: Validate And Mount The External Runtime Boundary

**Files:**
- Modify: `.gitmodules`
- Create: `apps/superhaojun` (git submodule)
- Modify: `backend/pyproject.toml`
- Create: `backend/tests/test_site_agent_runtime_loader.py`
- Create: `backend/services/site_agent/runtime_loader.py`

- [ ] **Step 1: Add the submodule on a named branch and record the initial SHA**

Run:

```bash
git submodule add -b main https://github.com/kelvinLLL/SuperHaojun.git apps/superhaojun
git -C apps/superhaojun rev-parse HEAD
```

Expected:

- `.gitmodules` contains `apps/superhaojun`
- the initial mounted commit SHA is captured in the task notes or commit message

- [ ] **Step 2: Record the real mounted runtime contract before coding against it**

Inspect and note the actual public contract from the mounted submodule:

- import path for `build_runtime`
- location of `Tool`
- location of `ToolRegistry`
- location of `MessageBus`
- how runtime events are emitted and forwarded in the mounted version

This step should produce a short task note or comment in the commit message capturing the validated contract.

- [ ] **Step 3: Write a failing runtime-loader test against the real mounted layout**

Assert:

- `apps/superhaojun/src/superhaojun/runtime.py` exists
- the loader can import `superhaojun.runtime.build_runtime`
- the loader raises a clear error if the submodule path is absent

Example:

```python
def test_runtime_loader_imports_build_runtime():
    loader = load_superhaojun_build_runtime
    build_runtime = loader()
    assert callable(build_runtime)
```

- [ ] **Step 4: Add the minimal backend dependencies required for runtime import**

If the backend virtualenv cannot import the mounted runtime because of missing harness dependencies, add only the smallest required import-time dependencies to `backend/pyproject.toml`.

Current expected minimum candidates:

- `openai`
- `rich`
- `prompt-toolkit`

After editing dependencies, refresh the backend environment before re-running tests.

- [ ] **Step 5: Implement the runtime loader minimally**

Implement a single helper that:

- resolves `apps/superhaojun/src`
- prepends that path once if needed
- imports `build_runtime`
- raises a clear configuration error if the submodule is missing

- [ ] **Step 6: Run the runtime-loader tests**

Run:

```bash
cd backend && .venv/bin/pip install -e .
cd backend && .venv/bin/python -m pytest tests/test_site_agent_runtime_loader.py -v
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add .gitmodules apps/superhaojun backend/pyproject.toml backend/services/site_agent/runtime_loader.py backend/tests/test_site_agent_runtime_loader.py
git commit -m "feat: mount superhaojun runtime boundary"
```

### Task 2: Lock The Capability Registry With Narrow Failing Tests

**Files:**
- Create: `backend/tests/test_site_agent_registry.py`
- Create: `backend/services/site_agent/models.py`
- Create: `backend/services/site_agent/registry.py`
- Create: `backend/services/site_agent/skills/using-personal-web.md`
- Create: `backend/services/site_agent/skills/ideas-read.md`
- Create: `backend/services/site_agent/skills/ideas-workflow.md`
- Create: `backend/services/site_agent/skills/content-read.md`

- [ ] **Step 1: Add failing backend tests for the capability registry**

Add tests that assert the first registry exposes:

- `site.intro`
- `site.navigate`
- `ideas.list`
- `ideas.get`
- `ideas.meta`
- `ideas.workflow.start`
- `ideas.workflow.get_run`
- `content.daily_nuance.latest`
- `content.skill_marketplace.catalog`

Example:

```python
def test_registry_exposes_first_capability_slice():
    registry = build_site_capability_registry()
    ids = {cap.capability_id for cap in registry.list_capabilities()}
    assert "site.intro" in ids
    assert "ideas.workflow.start" in ids
    assert "content.daily_nuance.latest" in ids
```

- [ ] **Step 2: Implement the registry contract and first skill assets minimally**

Include stable entries for:

- `site.intro`
- `site.navigate`
- `ideas.list`
- `ideas.get`
- `ideas.meta`
- `ideas.workflow.start`
- `ideas.workflow.get_run`
- `content.daily_nuance.latest`
- `content.skill_marketplace.catalog`

Write concise skill assets that describe:

- when to use the skill
- covered capabilities
- safe vs privileged behavior
- when inline mode is enough
- when transition mode is better

- [ ] **Step 3: Run the backend registry tests**

Run:

```bash
cd backend && .venv/bin/python -m pytest tests/test_site_agent_registry.py -v
```

Expected:

- test fails first because the registry files do not exist yet
- test passes after the minimal registry implementation lands

- [ ] **Step 4: Commit**

```bash
git add backend/tests/test_site_agent_registry.py backend/services/site_agent/models.py backend/services/site_agent/registry.py backend/services/site_agent/skills
git commit -m "feat: add website agent capability registry"
```

### Task 3: Implement Capability Handlers And The Thin Website Adapter

**Files:**
- Create: `backend/services/site_agent/context.py`
- Create: `backend/services/site_agent/capabilities/site.py`
- Create: `backend/services/site_agent/capabilities/ideas.py`
- Create: `backend/services/site_agent/capabilities/content.py`
- Create: `backend/services/site_agent/capability_handlers.py`
- Create: `backend/services/site_agent/tool_bridge.py`
- Create: `backend/services/site_agent/adapter.py`
- Create: `backend/routers/agent.py`
- Create: `backend/tests/test_site_agent_adapter.py`
- Modify: `backend/main.py`

- [ ] **Step 1: Add route-aware request context resolution**

Map incoming website requests into a compact context object:

- route
- page type
- visible entity id or slug
- auth state
- admin state
- inline-capable capability groups
- bearer token subject when present

Example:

```python
def resolve_site_context(route: str, *, entity_id: str | None = None) -> SiteContext:
    if route.startswith("/ideas"):
        return SiteContext(page_type="ideas", route=route, entity_id=entity_id)
    return SiteContext(page_type="home", route=route, entity_id=entity_id)
```

- [ ] **Step 2: Implement pure capability handlers**

Use existing backend stores and services for:

- ideas list
- idea detail
- ideas meta
- workflow start
- workflow run lookup
- site intro
- navigation recommendations
- `daily-nuance` latest snapshot reads from shipped static data
- `skill-marketplace` catalog reads from typed shipped frontend-owned seed data mirrored through a small backend view or loader

Keep handlers pure and website-owned. Do not put product semantics inside the runtime loader.

- [ ] **Step 3: Define the auth contract for `POST /api/agent/query` before tool registration**

Lock this request rule:

- the frontend sends the existing admin bearer token when available
- the backend endpoint reads `Authorization` the same way other protected routes do
- the context resolver marks `is_admin` from the verified token subject
- read-only site intro and navigation remain available without auth
- privileged capabilities such as workflow start consult the resolved auth state, not frontend-only flags

- [ ] **Step 4: Implement a tool bridge for runtime registration**

Register website capabilities onto the `SuperHaojun` `ToolRegistry` through local wrapper tools that:

- expose JSON-schema parameters
- set sensible risk levels
- call capability handlers
- return structured stringified results for the runtime

Example shape:

```python
class SiteNavigateTool(Tool):
    name = "site_navigate"
    risk_level = "read"
    parameters = {...}

    async def execute(self, target: str, **kwargs):
        return json.dumps(await navigate_handler(target=target))
```

- [ ] **Step 5: Implement the thin adapter**

The adapter should:

- build or reuse a runtime instance
- inject selected skill text into the request path
- register only the relevant website tools for the current request
- listen to `MessageBus` events
- expose a clean async generator for the website transport

Do not add website-only execution shortcuts outside the runtime path.

- [ ] **Step 6: Add the agent router and mount it**

Expose one initial endpoint:

- `POST /api/agent/query`

Start with SSE to match the current website backend style and keep the frontend simple.

- [ ] **Step 7: Add backend adapter tests only after the endpoint shape exists**

Cover:

- anonymous request can use read-only site intro and navigation paths
- `/ideas` route context injects `ideas-read`
- content-read capabilities have an executable path
- workflow start without auth is rejected clearly
- agent event stream includes structured runtime events and capability results

- [ ] **Step 8: Re-run backend adapter tests**

Run:

```bash
cd backend && .venv/bin/python -m pytest tests/test_site_agent_adapter.py -v
```

Expected: PASS

- [ ] **Step 9: Run the existing auth and workflow tests**

Run:

```bash
cd backend && .venv/bin/python -m pytest tests/test_auth.py tests/test_workflow.py -v
```

Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add backend/main.py backend/routers/agent.py backend/services/site_agent backend/tests/test_site_agent_adapter.py
git commit -m "feat: add website agent adapter and capability handlers"
```

### Task 4: Build The Floating Frontend Agent Shell With Narrow UI Tests

**Files:**
- Create: `frontend/src/features/site-agent/model/agent.ts`
- Create: `frontend/src/features/site-agent/api/siteAgentApi.ts`
- Create: `frontend/src/features/site-agent/store/useSiteAgentStore.ts`
- Create: `frontend/src/features/site-agent/lib/pageContext.ts`
- Create: `frontend/src/features/site-agent/components/SiteAgentLauncher.tsx`
- Create: `frontend/src/features/site-agent/components/SiteAgentPanel.tsx`
- Create: `frontend/src/features/site-agent/components/SiteAgentComposer.tsx`
- Create: `frontend/src/features/site-agent/components/SiteAgentMessageList.tsx`
- Create: `frontend/src/features/site-agent/components/SiteAgentSuggestionList.tsx`
- Create: `frontend/src/features/site-agent/components/SiteAgentRunCard.tsx`
- Create: `frontend/src/features/site-agent/__tests__/SiteAgentShell.test.tsx`
- Modify: `frontend/src/app/layout/RootLayout.tsx`

- [ ] **Step 1: Add failing frontend shell tests**

Cover:

- floating launcher renders in `RootLayout`
- shell opens and closes
- route-aware title changes between `/` and `/ideas`
- no dedicated full-page agent route is introduced in v1

- [ ] **Step 2: Define the frontend agent message model**

Model:

- text parts
- navigation suggestion parts
- workflow run parts
- tool activity parts
- request state
- panel state

- [ ] **Step 3: Build the API streaming client**

Use the existing `apiStreamRequest` pattern and parse SSE events from `/api/agent/query`.

Keep one thin file responsible for:

- sending requests
- parsing SSE chunks
- surfacing typed events to the store

- [ ] **Step 4: Implement a local store for shell state**

Track:

- open or closed
- floating position
- active route context
- current auth token for agent requests
- messages
- pending request
- suggested transitions
- active workflow run cards

- [ ] **Step 5: Implement the launcher and panel**

Requirements:

- floating launcher visible across public routes
- draggable on desktop
- compact panel
- clear current page label
- no dedicated full-page agent route in v1

- [ ] **Step 6: Mount the shell in `RootLayout`**

The shell should sit outside page feature slices so it remains persistent during navigation.

- [ ] **Step 7: Re-run frontend shell tests**

Run:

```bash
npm --prefix frontend run test -- --run frontend/src/features/site-agent/__tests__/SiteAgentShell.test.tsx
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/layout/RootLayout.tsx frontend/src/features/site-agent
git commit -m "feat: add floating site agent shell"
```

### Task 5: Wire Inline Mode, Transition Mode, Workflow Status, And Home/Router Integration

**Files:**
- Modify: `frontend/src/features/site-agent/components/SiteAgentPanel.tsx`
- Modify: `frontend/src/features/site-agent/components/SiteAgentMessageList.tsx`
- Modify: `frontend/src/features/site-agent/components/SiteAgentSuggestionList.tsx`
- Modify: `frontend/src/features/site-agent/components/SiteAgentRunCard.tsx`
- Modify: `frontend/src/features/site-agent/lib/pageContext.ts`
- Modify: `frontend/src/features/site-agent/store/useSiteAgentStore.ts`
- Modify: `frontend/src/features/site-agent/__tests__/SiteAgentShell.test.tsx`
- Modify: `frontend/src/app/router/__tests__/router.test.tsx`
- Modify: `frontend/src/features/home/__tests__/HomePage.test.tsx`

- [ ] **Step 1: Implement inline mode**

Render:

- normal text replies
- current-page explanations
- read-only inline results for ideas and content

- [ ] **Step 2: Implement transition mode**

Render explicit navigation suggestions as clickable actions that:

- show destination label
- explain why the page jump helps
- use React Router navigation visibly

Example rendered payload:

```ts
{
  type: 'navigation',
  to: '/ideas',
  label: 'Open Ideas',
  reason: 'This task is easier in the full Ideas surface.'
}
```

- [ ] **Step 3: Implement structured workflow run rendering**

When the backend returns workflow start or run updates:

- render a run card
- show status, searched count, analyzed count, persisted count, failed count
- do not flatten the workflow into plain text only

- [ ] **Step 4: Ensure the shell respects the two user modes**

Verify:

- some requests stay fully inside the panel
- some requests recommend explicit page transitions
- the transition remains user-visible and clickable
- authenticated requests forward the existing admin token into `/api/agent/query`

- [ ] **Step 5: Update homepage and router tests only after the shell contract is real**

Assert:

- the homepage still renders cleanly with the floating launcher present
- route tests still pass primary navigation expectations
- no dedicated full-page agent route is introduced

- [ ] **Step 6: Re-run frontend tests**

Run:

```bash
npm --prefix frontend run test -- --run frontend/src/features/site-agent/__tests__/SiteAgentShell.test.tsx frontend/src/features/home/__tests__/HomePage.test.tsx frontend/src/app/router/__tests__/router.test.tsx
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/site-agent frontend/src/features/home/__tests__/HomePage.test.tsx frontend/src/app/router/__tests__/router.test.tsx
git commit -m "feat: add inline and transition agent interactions"
```

### Task 6: Verify End-To-End Runtime Integration Against The Mounted Harness

**Files:**
- Modify: backend and frontend files only if verification exposes real issues

- [ ] **Step 1: Start the backend with the mounted submodule and local env files**

Run:

```bash
cd backend && .venv/bin/uvicorn main:app --reload --port 8000
```

Expected:

- backend boots with `apps/superhaojun` present
- missing-submodule errors are gone

- [ ] **Step 2: Start the frontend**

Run:

```bash
npm --prefix frontend run dev
```

- [ ] **Step 3: Verify one homepage request**

Manual check:

- open the homepage
- open the floating shell
- ask what this website is for
- confirm an inline intro response arrives

- [ ] **Step 4: Verify one route-aware ideas request**

Manual check:

- navigate to `/ideas`
- ask what this page does
- confirm route-aware ideas explanation arrives

- [ ] **Step 5: Verify one transition suggestion**

Manual check:

- from homepage ask to open ideas or show skill marketplace
- confirm the shell shows an explicit clickable page transition

- [ ] **Step 6: Verify one privileged workflow attempt**

Manual check:

- without admin auth, ask to run idea discovery
- confirm the shell surfaces a permission failure clearly
- with admin auth, retry
- confirm a run card appears with structured status

- [ ] **Step 7: Run focused regression checks**

Run:

```bash
cd backend && .venv/bin/python -m pytest tests/test_site_agent_registry.py tests/test_site_agent_adapter.py tests/test_auth.py tests/test_workflow.py -v
npm --prefix frontend run test -- --run frontend/src/features/site-agent/__tests__/SiteAgentShell.test.tsx frontend/src/app/router/__tests__/router.test.tsx frontend/src/features/home/__tests__/HomePage.test.tsx
npm --prefix frontend run build
```

Expected:

- targeted backend tests pass
- targeted frontend tests pass
- production build succeeds

### Task 7: Sync Docs And Close The Slice

**Files:**
- Modify: `docs/features/agent-harness-integration.md`
- Modify: `docs/integrations/superhaojun-env-handoff.md`
- Modify: `docs/superpowers/specs/2026-04-16-website-agent-skill-integration-design.md`
- Modify: implementation files if verification forced small design corrections

- [ ] **Step 1: Update the living feature doc to match shipped reality**

Refresh:

- `status`
- `entrypoints`
- `File Structure`
- `Current Design`
- `Change Notes`

- [ ] **Step 2: Update the env handoff if bootstrap reality changed**

Capture:

- final submodule mount behavior
- any new local config files
- any runtime boot gotchas discovered during integration

- [ ] **Step 3: Update the spec only if verification changed the approved design**

Do not rewrite the spec for implementation trivia. Only sync meaningful design changes.

- [ ] **Step 4: Sanity-check the slice against the approved product rules**

Verify:

- `SuperHaojun` remains the runtime core
- the website adapter is still thin
- floating shell supports both inline and transition modes
- workflow actions remain explicit and run-based
- privileged actions are still visibly gated

- [ ] **Step 5: Commit**

```bash
git add docs/features/agent-harness-integration.md docs/integrations/superhaojun-env-handoff.md docs/superpowers/specs/2026-04-16-website-agent-skill-integration-design.md
git commit -m "docs: sync website agent integration slice"
```
