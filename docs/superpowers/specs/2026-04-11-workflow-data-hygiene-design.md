# Workflow Data Hygiene Design

**Goal:** Make the `Ideas` discovery workflow temporarily usable in production-like local development by fixing the current workflow crash, separating durable idea data from workflow run artifacts, and making cross-app navigation resilient even when developers open the frontend on a child port instead of the unified root.

## Scope

- replace the current fragile one-pass discovery flow with a staged `30 -> 15 -> 5-10` pipeline
- switch workflow analysis to the user-selected stable paid model path, currently `minimax-m2.7`
- keep cost bounded with strict per-run limits and candidate-level failure handling
- separate workflow run artifacts from the durable published ideas store
- stop tests from polluting real `ideas.json`
- clean up the current durable ideas dataset so it reflects real product data again
- make local cross-app navigation work from both the unified root and the frontend dev port

## Non-Goals

- full agent-harness orchestration
- multi-run workflow history UI
- automated scheduling or background refresh
- a full review queue for manual approval before persistence
- a full redesign of the `Ideas` interface

## Current Problems

### Workflow Runtime

- The current workflow can search and begin analysis, but it crashes once it builds the first valid `Scores` object because `overall=0` violates the model constraint.
- Analysis failures are swallowed candidate-by-candidate, but build-time schema failures still abort the SSE stream.
- The workflow persists directly into the durable ideas store, so it has no safe staging area.

### Data Hygiene

- The durable ideas dataset currently contains test and placeholder content such as `Tool X`, `Toy Y`, `Done Idea`, and `Meta Idea`.
- Tests use the real app instance without rebinding the global `ideas_store`, so API tests mutate real local data.
- There is no distinction between intermediate workflow artifacts and published ideas.

### Local Dev Navigation

- `npm run dev` correctly starts several services on different ports and exposes a unified root proxy.
- However, if developers open the frontend child server directly instead of the unified root, links to `/book-reader/` and `/daily-nuance/` no longer resolve through the proxy layer and appear broken.
- The system currently relies too much on developer discipline instead of providing safe defaults.

## Proposed Design

### 1. Staged Discovery Pipeline

The workflow should become a clear four-stage pipeline:

1. `Search 30`
2. `Reduce to 15`
3. `Analyze 15`
4. `Persist 5-10`

This keeps the expensive model calls focused on the strongest candidates while still giving discovery enough breadth to surface useful ideas.

### 2. Search 30

The workflow gathers roughly `30` raw candidates from Tavily using multiple query families:

- `problem-driven`
- `community-driven`
- `implementation-driven`

Each family contributes a fixed number of queries and each query has a capped result count. This makes the workflow predictable and testable.

Each raw candidate should capture:

- title
- url
- snippet/content excerpt
- source query
- source domain

### 3. Reduce to 15

Before spending money on model analysis, the workflow performs a deterministic shortlist pass.

This pass should:

- deduplicate by normalized URL
- near-deduplicate by normalized title
- penalize or drop obvious aggregator pages
- drop low-information candidates
- preserve source diversity so the shortlist is not dominated by a single domain or content type

This stage is intentionally rule-based. It should be transparent, cheap, and stable.

### 4. Analyze 15 with `minimax-m2.7`

The shortlist is analyzed using a single structured-output prompt per candidate.

The analysis prompt should optimize for one question:

> "Can this candidate be turned into a concrete, worth-building project idea for this site?"

The model output should include at least:

- normalized title
- tagline
- category
- target user
- project angle
- why now
- quality score
- feasibility score
- novelty score
- buildability score
- effort
- risk flags
- references

The workflow should then compute a final sortable score from those dimensions on the server side. The server owns ranking logic; the model should not be trusted as the final scorer.

### 5. Persist 5-10 Durable Ideas

The workflow should not persist all analyzed candidates into the durable ideas library.

Instead:

- analyze up to `15`
- rank them on the server
- persist only the top `5-10`

These persisted records should be marked as `workflow_selected`.

This keeps the published ideas library curated enough to stay useful while preserving broader run output elsewhere.

### 6. Store Workflow Run Snapshots Separately

Add a separate workflow-run persistence layer. A run snapshot stores:

- run id
- started/completed timestamps
- direction
- model key
- raw candidate count
- shortlisted candidate count
- analyzed candidate count
- selected candidate count
- candidate records with stage metadata
- per-candidate failure state if analysis fails

This snapshot is the temporary artifact store for the "analyze 15" set and lets us preserve expensive analysis results without polluting the durable ideas library.

### 7. Failure Handling

The workflow must never abort the stream because one candidate fails.

Candidate-level failures should become structured run results such as:

- `search_failed`
- `analysis_failed`
- `invalid_output`
- `persistence_skipped`

The SSE stream should always finish with either:

- `done`
- `done_with_warnings`
- `failed`

If the model is rate-limited, the run should still complete and report partial results.

### 8. Ideas Data Cleanup

The durable ideas store should contain only real product data after this change.

We should:

- remove placeholder and test residue from the durable dataset
- keep manual ideas that are still meaningful
- ensure future tests never touch the durable store again

The durable source values should be constrained to:

- `manual`
- `workflow_selected`

Any broader run metadata belongs in workflow snapshots, not in the published ideas list.

### 9. Test Isolation

API tests must use a temporary store, not the process-global durable store created at import time.

The cleanest temporary fix is to make the app or store layer test-rebindable so tests can point routers at a temporary `IdeasStore`. The important constraint is behavioral:

- API tests should never mutate `backend/data/ideas.json`

### 10. Local Dev Navigation Resilience

The unified root server remains the preferred entrypoint, but the frontend dev server should also proxy sub-app paths in development.

This gives two safe paths:

- opening `http://127.0.0.1:3000`
- opening the frontend child port directly

When the frontend child port is opened directly, requests to:

- `/book-reader/`
- `/daily-nuance/`

should still route to the correct child service.

This is a developer-experience safeguard, not a production architecture change.

## UI Behavior

The current `Ideas` workflow panel can remain mostly intact for this temporary release, but it should report more truthful completion information:

- searched count
- shortlisted count
- analyzed count
- persisted count
- failed count

This is enough to make the run interpretable without building a full workflow dashboard.

## Testing Strategy

### Backend

- workflow builds valid scores without schema crashes
- workflow completes when some candidates fail analysis
- workflow persists only the selected subset
- workflow run snapshots are written separately
- API tests use temporary data stores only

### Frontend

- workflow panel renders terminal state summaries correctly
- partial-failure runs surface warnings instead of generic crashes
- direct frontend-port navigation still reaches the sub-app links in development where applicable

### Integration

- start `npm run dev`
- verify unified root navigation
- verify frontend child-port navigation to `/book-reader/` and `/daily-nuance/`
- run one bounded workflow and confirm durable ideas increase only by the selected count

## Residual Risks

- `minimax-m2.7` is paid, so a misconfigured loop could still cost money if limits regress
- rule-based shortlist reduction may still miss some high-value candidates
- workflow snapshots may need pruning in the future if they accumulate heavily

## Recommendation

Ship this as a temporary but disciplined workflow layer:

- deterministic search and shortlist
- bounded model analysis
- selective durable persistence
- explicit run artifacts
- clean test isolation
- resilient local navigation

This gives us a trustworthy base to later replace the analysis phase with a custom agent harness without rewriting the whole product surface.
