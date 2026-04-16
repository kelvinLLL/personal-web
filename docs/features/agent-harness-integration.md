---
status: designing
entrypoints:
  - docs/features/agent-harness-integration.md
  - docs/integrations/superhaojun-env-handoff.md
  - docs/superpowers/specs/2026-04-16-website-agent-skill-integration-design.md
  - docs/superpowers/plans/2026-04-16-website-agent-skill-integration.md
  - apps/superhaojun
  - backend/pyproject.toml
  - backend/services/site_agent/runtime_loader.py
  - backend/tests/test_site_agent_runtime_loader.py
  - docs/superpowers/plans/2026-04-14-product-backlog.md
  - backend/main.py
  - backend/routers/ideas.py
  - backend/routers/workflow.py
  - backend/services/workflow_runs_store.py
  - frontend/src/app/router/router.tsx
  - frontend/src/core/site/routes.ts
hard_constraints:
  - Treat `SuperHaojun` as an external runtime boundary that will be integrated as a submodule, not copied into the website codebase.
  - Separate human-facing page routes from model-facing action contracts instead of deriving one implicitly from the other.
  - Classify exposed capabilities by risk and side effects so read surfaces, mutating actions, and long-running workflows do not share one undifferentiated interface.
  - Keep auth, approval, and audit requirements explicit at the action layer, especially for workflow-triggering or persistence-changing operations.
  - Prefer a skill-first contract surface for the website harness integration, while keeping the underlying capability registry stable enough to support future adapters.
design_notes:
  - The first optimization pass should focus on governance of the action surface before building a rich web chatbot shell.
  - Current site capabilities already exist across REST routes and workflow streaming; the missing layer is a stable skill-friendly contract and execution policy.
  - Long-running operations should be modeled as runs with progress and terminal states, not as opaque single-response mutations.
  - The feature boundary includes discoverability, schema design, permissions, observability, and non-committed local configuration handoff, not only the harness runtime itself.
  - The public frontend entry should be a floating chat shell that supports both inline page-local interaction and explicit user-visible page transitions when work needs a larger surface.
last_updated: 2026-04-16
---

# Agent Harness Integration

## Goal

Integrate `SuperHaojun` into `personal-web` in a way that makes site capabilities safely discoverable and callable by large models through a floating website agent experience.

Success means the site does not treat agent access as an afterthought. Instead, important operations are exposed through stable, typed, auditable interfaces with clear risk boundaries, while the website itself stays a thin product adapter around the external harness runtime. The user-facing entry should feel like a persistent floating site agent that can either solve work inside the small window or explicitly guide the user into larger page surfaces when needed. The first concrete deliverable is a skill-first contract layer plus clear local configuration handoff, not a runtime rewrite.

## Scope

In scope:

- define the current feature boundary for harness integration and model-friendly site operations
- document the external `SuperHaojun` runtime boundary and the adapter role the website should own
- document which existing site capabilities already behave like callable actions
- establish governance expectations for read actions, write actions, and long-running workflows
- design a stable skill-first contract layer that can sit between the current backend/frontend and the external harness runtime
- track non-committed environment and local config files needed to run the harness and the website together

Out of scope:

- implementing the harness runtime in this first documentation pass
- forking or re-implementing `SuperHaojun` inside the website repo
- designing the final chatbot UI in detail
- exposing every sub-app capability immediately, especially legacy app internals that do not yet have stable boundaries
- committing to one external protocol before clarifying the site's own internal action model

## File Structure

- `docs/features/agent-harness-integration.md`
  - living feature doc for the harness-integration boundary, its constraints, and the current action-surface design
- `docs/integrations/superhaojun-env-handoff.md`
  - operator-facing checklist for gitignored secrets, optional local overrides, and cross-repo config files needed before runtime integration
- `apps/superhaojun`
  - mounted git submodule for the external runtime so the website can depend on the canonical harness without copying it
- `backend/pyproject.toml`
  - backend dependency boundary where only the minimum import-time runtime requirements should be added for the mounted harness
- `backend/services/site_agent/runtime_loader.py`
  - thin loader that resolves the mounted harness path and imports the canonical `build_runtime` entrypoint without re-exporting more runtime internals
- `backend/tests/test_site_agent_runtime_loader.py`
  - regression test for the mounted runtime boundary, covering the real import path and the missing-submodule error path
- `docs/superpowers/plans/2026-04-14-product-backlog.md`
  - existing backlog note that already frames this work as `harness` integration plus a later chatbot UI slice
- `backend/main.py`
  - backend composition root where today's routers define the currently reachable site capabilities
- `backend/routers/ideas.py`
  - current CRUD-style idea operations that are likely candidates for future read/write tool exposure
- `backend/routers/workflow.py`
  - current long-running workflow surface, including streaming behavior, that foreshadows how harness-triggered actions may need run semantics
- `backend/services/workflow_runs_store.py`
  - existing run-artifact persistence layer that is relevant to auditability and resumable agent operations
- `frontend/src/core/site/routes.ts`
  - canonical public route registry for human navigation, useful for separating UI navigation from agent action boundaries
- `frontend/src/app/router/router.tsx`
  - current SPA route wiring, relevant because page routes should not be mistaken for the machine-facing interface contract

## Current Design

- there is not yet a formal `agent harness` runtime surface inside the repo
- the intended runtime is now explicitly `SuperHaojun`, maintained in a separate repository and planned for submodule integration
- the intended submodule mount point is `apps/superhaojun`, matching the repo's existing pattern for separately maintained apps
- the first implementation slice at this boundary is intentionally narrow:
  - mount the submodule
  - validate the actual runtime import contract from the mounted code
  - add a backend loader that imports `build_runtime` from the mounted source tree and fails clearly when the submodule is absent
  - keep adapter, registry, and tool-bridge logic out of this task so the external/runtime boundary is proven before higher-level integration begins
- the validated mounted runtime contract at the current submodule SHA is:
  - `build_runtime` from `superhaojun.runtime`
  - `Tool` from `superhaojun.tools.base`
  - `ToolRegistry` from `superhaojun.tools.registry`
  - `MessageBus` from `superhaojun.bus`
  - runtime messages are emitted with `MessageBus.emit(...)`, and the mounted WebUI forwards them by registering `bus.on(...)` handlers in `superhaojun.webui.server.WebUIState._setup_bus_forwarders()`
- the website backend currently needs only `openai` as an additional import-time dependency to load the mounted runtime entrypoint; `rich` and `prompt-toolkit` are present in the harness repo but are not imported by this first loader path
- the site already exposes several behavior classes that matter for agent integration:
  - public navigation routes in the SPA
  - CRUD-style idea data routes in the backend
  - workflow-triggering endpoints with streaming progress and persisted run artifacts
- the external handoff document for `SuperHaojun` recommends a specific split:
  - the harness stays the canonical runtime core
  - the website owns a thin adapter for auth, request shaping, context injection, and streaming transport
  - site-internal actions should appear to the runtime as tools rather than hidden website-only branches
- the current system boundary is human-first:
  - frontend pages are optimized for browsing
  - backend routes are optimized for app functionality
  - there is no dedicated layer that packages those operations into model-friendly tools with explicit schema, permissions, or action metadata
- the desired frontend shape is now clearer:
  - a floating, draggable chat entry should exist across the site
  - users should be able to complete some help and operation flows entirely inside the floating shell
  - users should also be able to accept explicit page-jump recommendations when a larger product surface is the better fit
- the best current precedent in this repo is the `Ideas` workflow refactor:
  - it distinguishes durable content from workflow run artifacts
  - it treats long-running work as staged execution rather than one blind mutation
  - it creates a useful starting point for later harness orchestration
- the active design question is therefore not only "how do we mount the harness?"
  - it is also "what is the stable skill surface of the site, how should it be governed, and which local config must be handed in outside git before the integration can even boot?"

## Change Notes

- 2026-04-16: Created the living feature doc and defined the initial feature boundary around harness integration plus model-friendly action-surface governance, before any implementation work begins.
- 2026-04-16: Refined the feature boundary around the external `SuperHaojun` runtime, the thin website adapter model from the handoff document, and the need for a dedicated env/config handoff checklist before submodule integration starts.
- 2026-04-16: Fixed the planned submodule location to `apps/superhaojun` so the integration follows the same separately maintained app pattern as the existing submodules.
- 2026-04-16: Added the approved frontend direction: a floating site-agent shell with two interaction modes, inline work in the small panel and explicit user-visible navigation into larger page surfaces.
- 2026-04-16: Wrote the approved design spec and first implementation plan for the website-agent slice, covering the floating shell, skill-first contract layer, capability registry, thin website adapter, and the initial `Ideas`-focused integration loop.
- 2026-04-16: Updated the feature doc for Task 1 so the first code slice is explicitly the mounted runtime boundary: submodule mount, minimal backend import-time dependencies, and a loader test that validates the real `SuperHaojun` runtime entrypoint before any adapter logic lands.
- 2026-04-16: Validated the mounted `SuperHaojun` runtime contract at submodule SHA `79b1c94f5f7f59a678d5478fa23319b2f75382d2`, then shipped the first backend loader plus tests around that exact import surface and the missing-submodule error path.
