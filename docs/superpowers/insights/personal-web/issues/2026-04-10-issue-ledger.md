# Issue Ledger — 2026-04-10

This ledger captures confirmed issues found during the first full-stack architecture and frontend-interaction review.

## Priority Summary

| ID | Priority | Area | Problem | Recommended Direction |
| --- | --- | --- | --- | --- |
| PW-001 | P1 | Deployment | Dev root and production artifact do not expose the same product surface | Decide whether `frontend` is production-facing; then align routing, build, and output |
| PW-002 | P1 | Dev Runtime | Auto port fallback can assign conflicting ports to multiple child apps | Reserve ports globally during runtime planning |
| PW-003 | P1 | Frontend Data Flow | Unified dev entry triggers CORS failures for idea/model requests | Prefer same-origin `/api` in dev or compute CORS dynamically |
| PW-004 | P1 | Ideas Interaction | Status filter UI does not match backend query contract | Unify param naming and add interaction tests |
| PW-005 | P2 | Ideas Interaction | Sort controls can be clicked without reliably reordering the list | Re-sort in-store on sort change or use derived selectors |
| PW-006 | P2 | Auth Model | Admin session persistence and token retrieval use different storage keys | Centralize auth/session access behind one source of truth |
| PW-007 | P1 | Ideas Workflow | No clear, usable, real-time update workflow for refreshing ideas; current dataset behaves like sample data | Treat idea discovery/update as a first-class operator flow with freshness, history, and live progress |
| PW-008 | P2 | Interaction Quality | Detail page loading state violates current React lint rule | Refactor data-loading state flow and add regression coverage |
| PW-009 | P2 | Accessibility | Filter chips and several stateful controls lack richer semantics | Add button-state semantics and keyboard/readability checks |
| PW-010 | P2 | Test Coverage | Existing tests miss several broken user paths | Add contract tests for filters, sort behavior, CORS/dev routing, and workflow refresh flows |

## Detailed Ledger

### PW-001 — Delivery Surface Drift

- Priority: `P1`
- Area: deployment / architecture
- Symptom:
  - local root experience is driven by `frontend`
  - production `dist/` only contains `portal`, `book-reader`, and `daily-nuance`
- Why this matters:
  - we cannot reason clearly about what the real product is
  - frontend interaction work on `/ideas` and `/settings` may never ship
- Evidence:
  - `package.json` contains `build:frontend`
  - `scripts/build-all.mjs` does not call it
  - `dist/` has no `frontend` output
- Change direction:
  - choose one of two models
  - model A: `frontend` is real production surface, so include it in build and deployment
  - model B: `frontend` is an internal/admin experience, so move it under an explicitly internal route or separate app

### PW-002 — Dev Port Allocation Is Not Collision-Safe

- Priority: `P1`
- Area: developer experience / runtime
- Symptom:
  - fallback ports are chosen independently, so two apps can be assigned the same replacement port
- Why this matters:
  - the reverse proxy can end up pointing the wrong path prefix to the wrong app
  - visual verification becomes misleading
- Change direction:
  - allocate all runtime ports from a shared reserved set
  - validate the full runtime map before spawning child processes
  - fail fast if a unique runtime layout cannot be built

### PW-003 — Dev Root API Access Breaks Under Cross-Origin Conditions

- Priority: `P1`
- Area: frontend/backend contract
- Symptom:
  - `apiRequest()` always sends `Content-Type: application/json`
  - GET requests trigger preflight
  - backend CORS list only allows fixed `localhost` origins
- Why this matters:
  - the unified dev entry can show a healthy shell while data-backed pages fail silently or degrade into error banners
- Change direction:
  - default to same-origin `/api` in unified dev
  - only set `Content-Type` when a body exists
  - generate or inject the exact allowed dev origins when ports float

### PW-004 — Ideas Status Filter Is Functionally Broken

- Priority: `P1`
- Area: ideas list interaction
- Symptom:
  - frontend sends `status`
  - backend expects `status_filter`
- Why this matters:
  - the control suggests list narrowing, but the backend ignores the intended filter
  - users lose trust in the list as a decision tool
- Change direction:
  - use a shared request contract for query params
  - add backend tests for all accepted query keys
  - add a UI-level test proving the filtered result count changes

### PW-005 — Sort Controls Do Not Reliably Recompute the Visible List

- Priority: `P2`
- Area: ideas interaction
- Symptom:
  - sort buttons update filter state
  - data fetch only re-runs for category/status changes
  - visible order can remain stale until another event happens
- Why this matters:
  - "clickable but inert" is one of the fastest ways to make a product feel unfinished
- Change direction:
  - derive sorted ideas from store state whenever `sortBy` changes
  - or trigger a deterministic local re-sort in `setFilter`

### PW-006 — Admin Session Model Is Split Across Incompatible Storage Paths

- Priority: `P2`
- Area: auth / permissions
- Symptom:
  - store persists under `ai-config`
  - `ideasApi` looks in `admin-session`
  - ideas CRUD is effectively unauthenticated on the backend anyway
- Why this matters:
  - the UI teaches one mental model while the API enforces another
  - future security hardening becomes harder because ownership is blurred
- Change direction:
  - define whether ideas management is public, admin-only, or mixed
  - route all session reads through one auth helper
  - enforce the same rule in UI, API, and tests

### PW-007 — Ideas Lack A First-Class Live Update Workflow

- Priority: `P1`
- Area: product workflow / frontend interaction
- Symptom:
  - the only discovery action is an admin-only toggle labeled `Discover Ideas`
  - there is no explicit "refresh now", "sync latest", or "check freshness" entry point
  - the main list does not expose last refresh time, run status, or incremental updates
  - current persisted ideas include repeated placeholder-like entries such as `Tool X` and `Toy Y`
- Why this matters:
  - the ideas area behaves more like a prototype shelf than a trustworthy operating surface
  - users cannot tell whether the dataset is fresh, historical, sample, or generated moments ago
- Change direction:
  - define actor-specific flows
  - admin flow: `Run discovery`, `Refresh ranking`, `View run history`, `Review candidates`, `Publish to list`
  - visitor flow: `See freshness`, `See source`, `See what changed`
  - technical direction:
  - persist workflow runs separately from published ideas
  - expose run status and freshness metadata through dedicated endpoints
  - stream progress to the UI and auto-merge results only after review/publish rules are met
  - clearly label seed/demo/sample data until real sources are established

### PW-008 — Idea Detail Loading Flow Needs React-State Hardening

- Priority: `P2`
- Area: frontend correctness
- Symptom:
  - detail page sets loading state synchronously inside an effect
  - current lint already flags this pattern
- Why this matters:
  - this is an early warning that data loading is being modeled imperatively instead of declaratively
- Change direction:
  - refactor into a safer async loading pattern
  - add tests for loading, success, error, and route change behavior

### PW-009 — Stateful Controls Need Better Semantics

- Priority: `P2`
- Area: accessibility / usability
- Symptom:
  - filter chips read visually as segmented controls but expose weak state semantics
  - important state changes rely mostly on color
- Why this matters:
  - keyboard and assistive-technology feedback will lag behind the visual design
- Change direction:
  - add `aria-pressed`, tab-like semantics, or proper radio-group semantics where appropriate
  - include focus-state and keyboard interaction checks in review

### PW-010 — The Test Suite Misses Several User-Visible Failures

- Priority: `P2`
- Area: quality engineering
- Symptom:
  - tests pass while broken interaction paths still exist
- Why this matters:
  - we are over-testing units and under-testing promises made by the product surface
- Change direction:
  - add contract coverage for:
  - status filter query behavior
  - sort interaction reordering
  - unified dev routing
  - cross-origin/API behavior
  - live workflow refresh and publish paths

## Suggested Next Ordering

1. Fix delivery-surface alignment and decide what is truly production-facing.
2. Repair unified dev/API routing so the product can be trusted during local work.
3. Fix ideas list truthfulness: status filter, sort, auth/session consistency.
4. Design the real ideas operator workflow and data lifecycle.
5. Add targeted interaction and contract tests around the repaired flows.
