# Workflow Data Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `Ideas` workflow usable by fixing its crash, isolating workflow artifacts from durable idea data, cleaning polluted idea data, and making local cross-app navigation robust from both the unified root and the frontend child port.

**Architecture:** Keep the current FastAPI + React structure, but split discovery into explicit stages and add a dedicated workflow-run persistence boundary. Durable ideas stay curated while workflow analysis results are stored separately. In development, keep the unified root proxy and add child-port sub-app proxying so navigation is resilient even when the frontend server is opened directly.

**Tech Stack:** FastAPI, Pydantic, httpx, React 19, Vite, Zustand, Vitest, pytest, Node test runner

---

### Task 1: Lock Down The Current Failure Modes With Tests

**Files:**
- Modify: `backend/tests/test_api.py`
- Modify: `backend/tests/conftest.py`
- Create or Modify: `backend/tests/test_workflow*.py`
- Modify: `tests/devPorts.test.mjs`

- [ ] Add a backend test that reproduces the workflow score-construction crash path
- [ ] Add a backend test that verifies partial candidate failures do not abort the workflow
- [ ] Add a backend test that verifies durable ideas are not polluted by API tests
- [ ] Add a backend test that verifies workflow persistence writes only selected ideas
- [ ] Add a root-node test that verifies child-port frontend navigation can resolve `/book-reader/` and `/daily-nuance/`
- [ ] Run targeted tests and confirm they fail for the intended reasons before implementation

### Task 2: Introduce A Workflow Run Store

**Files:**
- Create: `backend/services/workflow_runs_store.py`
- Create or Modify: `backend/models/workflow_run.py`
- Modify: `backend/config.py`

- [ ] Create a dedicated workflow-run model for candidate snapshots and run summaries
- [ ] Create a file-backed store separate from durable ideas
- [ ] Keep the store API small: create run, update run, append candidate events, finalize run
- [ ] Ensure the workflow-run store can use a temporary directory in tests
- [ ] Add tests for basic read/write behavior

### Task 3: Refactor Workflow Into Explicit Stages

**Files:**
- Modify: `backend/routers/workflow.py`
- Modify: `backend/services/tavily.py`
- Modify: `backend/services/ai.py` if needed for model selection ergonomics

- [ ] Extract raw candidate gathering into a `search 30` stage
- [ ] Add a deterministic shortlist reducer that compresses raw candidates to at most `15`
- [ ] Replace inline score construction with a safe server-side score builder that never initializes invalid models
- [ ] Analyze shortlisted candidates one-by-one and collect structured per-candidate outcomes
- [ ] Rank analyzed candidates on the server side
- [ ] Persist only the selected `5-10` durable ideas
- [ ] Finalize the workflow run snapshot with counts and candidate outcomes
- [ ] Ensure the SSE stream always terminates with a truthful final event, including warnings when partial failures happen

### Task 4: Make Workflow Failures Candidate-Scoped Instead Of Run-Scoped

**Files:**
- Modify: `backend/routers/workflow.py`
- Modify: `backend/models/workflow_run.py`

- [ ] Introduce candidate outcome states such as `analysis_failed`, `invalid_output`, and `selected`
- [ ] Convert model or parsing failures into candidate records instead of uncaught exceptions
- [ ] Emit summary counts in the terminal SSE event
- [ ] Add tests for `429` or generic analysis failures that still yield a completed run

### Task 5: Clean Up Durable Ideas Data And Protect It

**Files:**
- Modify: `backend/services/ideas_store.py`
- Create or Modify: `backend/scripts/*` if a one-off cleanup helper is needed
- Modify: `backend/data/ideas.json` only if a curated cleanup is explicitly carried out by the implementation

- [ ] Define the durable source policy: only `manual` and `workflow_selected`
- [ ] Remove or migrate placeholder and test residue from the durable ideas dataset
- [ ] Keep meaningful manual ideas intact where possible
- [ ] Ensure newly selected workflow ideas are labeled `workflow_selected`
- [ ] Add tests to confirm `add_ideas` dedupes selected workflow output correctly

### Task 6: Rebind API Tests To Temporary Stores

**Files:**
- Modify: `backend/tests/conftest.py`
- Modify: `backend/main.py` or router wiring if needed
- Modify: `backend/services/ideas_store.py`
- Modify: `backend/services/workflow_runs_store.py`

- [ ] Make the FastAPI app use test-local store instances during API tests
- [ ] Ensure router code does not permanently capture only the process-global durable stores
- [ ] Verify API tests mutate temporary files only
- [ ] Add a regression test that the real durable dataset is unchanged after test runs

### Task 7: Expose More Truthful Workflow Results To The Frontend

**Files:**
- Modify: `frontend/src/components/ideas/WorkflowProgress.tsx`
- Modify: `frontend/src/pages/Ideas.tsx`
- Modify: `frontend/src/lib/ideasApi.ts`
- Modify: `frontend/src/types/idea.ts` if needed

- [ ] Extend workflow completion handling to accept summary counts and warning states
- [ ] Show searched, shortlisted, analyzed, persisted, and failed counts after a run
- [ ] Keep the current simple panel shape; do not build a full workflow dashboard
- [ ] Add frontend tests for successful and warning-completion flows

### Task 8: Make Frontend Child-Port Navigation Proxy Sub-Apps

**Files:**
- Modify: `frontend/vite.config.ts`
- Modify: `scripts/dev-all.mjs`
- Modify: `scripts/lib/dev-ports.mjs` if helper data needs to be exposed
- Modify: `tests/devPorts.test.mjs`

- [ ] Inject child-app targets into the frontend dev environment from the unified dev launcher
- [ ] Add frontend dev-server proxy rules for `/book-reader/` and `/daily-nuance/`
- [ ] Preserve `/api` proxy behavior
- [ ] Add regression tests for path routing behavior
- [ ] Verify navigation works from both the unified root and the frontend child port

### Task 9: Verify End To End With Realistic Limits

**Files:**
- Modify as needed based on verification output

- [ ] Run root tests: `npm test`
- [ ] Run frontend tests: `npm --prefix frontend run test`
- [ ] Run backend tests: `cd backend && .venv/bin/python -m pytest tests/ -v`
- [ ] Run frontend build: `npm --prefix frontend run build`
- [ ] Start `npm run dev`
- [ ] Verify `Home`, `Ideas`, `Book Reader`, and `Daily Nuance` from the unified root
- [ ] Verify `Book Reader` and `Daily Nuance` also resolve from the frontend child port
- [ ] Run one bounded admin workflow and confirm:
- [ ] it finishes without SSE crash
- [ ] it records a workflow snapshot
- [ ] it persists only the selected subset into durable ideas
- [ ] Summarize residual cost and quality risks before handoff
