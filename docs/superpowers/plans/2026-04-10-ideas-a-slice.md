# Ideas A-Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `Ideas` slice contract-consistent, refreshable, and easier to evolve visually.

**Architecture:** Keep the existing React + Zustand + FastAPI shape, but harden the contract between frontend and backend. Add a thin metadata endpoint, centralize admin-token access, and introduce a small `shadcn` base layer only where this slice already changes.

**Tech Stack:** React 19, Vite, Zustand, FastAPI, pytest, Vitest, shadcn/ui

---

### Task 1: Lock Down Failing Tests First

**Files:**
- Modify: `backend/tests/test_api.py`
- Modify: `frontend/src/store/__tests__/ideasStore.test.ts`
- Create or Modify: `frontend/src/lib/__tests__/*`

- [ ] Add backend coverage for status filtering via `status`
- [ ] Add backend coverage for ideas metadata
- [ ] Add frontend coverage for immediate local re-sorting
- [ ] Add frontend coverage for unified admin-token access helper
- [ ] Run the targeted tests and confirm they fail for the intended reason

### Task 2: Harden Backend Ideas Contracts

**Files:**
- Modify: `backend/routers/ideas.py`
- Modify: `backend/services/ideas_store.py`

- [ ] Accept both `status` and `status_filter`
- [ ] Add a metadata endpoint returning freshness information
- [ ] Keep response shapes minimal and explicit
- [ ] Run targeted backend tests until green

### Task 3: Harden Frontend Ideas Data Flow

**Files:**
- Modify: `frontend/src/store/ideasStore.ts`
- Modify: `frontend/src/lib/ideasApi.ts`
- Create: `frontend/src/lib/adminSession.ts`
- Modify: `frontend/src/components/ideas/WorkflowProgress.tsx`
- Modify: `frontend/src/pages/Ideas.tsx`

- [ ] Replace ad-hoc token reads with one helper
- [ ] Make sort changes update visible ordering immediately
- [ ] Add explicit refresh capability
- [ ] Refresh the list after workflow completion
- [ ] Show freshness / updated-at state in the page

### Task 4: Fix Detail-Page Loading Pattern

**Files:**
- Modify: `frontend/src/pages/IdeaDetail.tsx`

- [ ] Refactor the loading state so lint passes without synchronous effect-setters
- [ ] Verify the detail page still handles loading, error, and success states correctly

### Task 5: Introduce Limited shadcn Foundations

**Files:**
- Create or Modify: `frontend/components.json`
- Create: `frontend/src/components/ui/*`
- Create: `frontend/src/lib/utils.ts`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/pages/Ideas.tsx`
- Modify: `frontend/src/components/ideas/WorkflowProgress.tsx`
- Modify: `frontend/src/pages/Settings.tsx`

- [ ] Initialize shadcn for the Vite frontend
- [ ] Add only the minimal primitives needed by this slice
- [ ] Replace a targeted subset of controls, not the whole app
- [ ] Preserve existing information architecture while improving consistency

### Task 6: Verify The Slice End To End

**Files:**
- Modify as needed based on test output

- [ ] Run backend tests
- [ ] Run frontend tests
- [ ] Run frontend lint
- [ ] Run frontend build
- [ ] Summarize any residual risk if something remains intentionally deferred
