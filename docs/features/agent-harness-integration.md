---
status: in_progress
entrypoints:
  - docs/features/agent-harness-integration.md
  - docs/integrations/superhaojun-env-handoff.md
  - docs/superpowers/specs/2026-04-16-website-agent-skill-integration-design.md
  - docs/superpowers/plans/2026-04-16-website-agent-skill-integration.md
  - apps/superhaojun
  - backend/pyproject.toml
  - backend/uv.lock
  - backend/services/site_agent/runtime_loader.py
  - backend/services/site_agent/models.py
  - backend/services/site_agent/registry.py
  - backend/services/site_agent/context.py
  - backend/services/site_agent/capabilities/site.py
  - backend/services/site_agent/capabilities/ideas.py
  - backend/services/site_agent/capabilities/content.py
  - backend/services/site_agent/capability_handlers.py
  - backend/services/site_agent/tool_bridge.py
  - backend/services/site_agent/adapter.py
  - backend/services/site_agent/skills/using-personal-web.md
  - backend/services/site_agent/skills/ideas-read.md
  - backend/services/site_agent/skills/ideas-workflow.md
  - backend/services/site_agent/skills/content-read.md
  - backend/tests/test_site_agent_runtime_loader.py
  - backend/tests/test_site_agent_registry.py
  - backend/tests/test_site_agent_adapter.py
  - docs/superpowers/plans/2026-04-14-product-backlog.md
  - backend/main.py
  - backend/routers/agent.py
  - backend/routers/ideas.py
  - backend/routers/workflow.py
  - backend/services/workflow_runs_store.py
  - frontend/src/app/layout/RootLayout.tsx
  - frontend/src/features/site-agent
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
last_updated: 2026-04-17
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
- `backend/uv.lock`
  - reproducible backend package state for this slice, which must stay in sync with the Python floor and dependency metadata used to import the mounted runtime boundary
- `backend/services/site_agent/runtime_loader.py`
  - thin loader that resolves the mounted harness path and imports the canonical `build_runtime` entrypoint without re-exporting more runtime internals
- `backend/services/site_agent/models.py`
  - minimal typed capability metadata models for the first website-agent registry slice, keeping stable ids, risk metadata, and skill references explicit
- `backend/services/site_agent/registry.py`
  - first capability registry slice that maps approved capability ids to stable metadata without executing handlers yet
- `backend/services/site_agent/context.py`
  - request-context resolver that turns a website route plus optional bearer token into page-aware capability context for the adapter
- `backend/services/site_agent/capabilities/site.py`
  - pure site-owned handlers for intro text and navigation recommendations that stay independent from runtime concerns
- `backend/services/site_agent/capabilities/ideas.py`
  - pure ideas and workflow handlers that reuse existing stores and auth-aware policy checks instead of duplicating route logic
- `backend/services/site_agent/capabilities/content.py`
  - read-only content handlers for the shipped `daily-nuance` snapshot and the backend-owned mirror of the current skill marketplace seed
- `backend/services/site_agent/capability_handlers.py`
  - website-owned capability registry to handler binding so tools can execute real site behavior through one stable map
- `backend/services/site_agent/tool_bridge.py`
  - thin bridge that wraps website capability handlers as `SuperHaojun` `Tool` instances with JSON-schema inputs and stringified structured results
- `backend/services/site_agent/adapter.py`
  - thin website adapter that builds a per-request runtime, injects selected website skills, registers only relevant tools, and forwards runtime bus events to website transport
- `backend/services/site_agent/skills/*.md`
  - concise skill assets that describe when to use the website-agent skills, which capabilities they cover, and when inline vs transition mode fits best
- `backend/tests/test_site_agent_runtime_loader.py`
  - regression test for the mounted runtime boundary, covering the real import path and the missing-submodule error path
- `backend/tests/test_site_agent_registry.py`
  - narrow regression tests for the approved first capability slice so later adapter work starts from a stable contract
- `backend/tests/test_site_agent_adapter.py`
  - adapter-focused regression tests for route-aware skill injection, auth-gated workflow behavior, executable content reads, and structured runtime event streaming
- `docs/superpowers/plans/2026-04-14-product-backlog.md`
  - existing backlog note that already frames this work as `harness` integration plus a later chatbot UI slice
- `backend/main.py`
  - backend composition root where today's routers define the currently reachable site capabilities
- `backend/routers/agent.py`
  - first website-agent transport route that accepts query requests, resolves auth/context, and streams runtime events over SSE
- `backend/routers/ideas.py`
  - current CRUD-style idea operations that are likely candidates for future read/write tool exposure
- `backend/routers/workflow.py`
  - current long-running workflow surface, including streaming behavior, that foreshadows how harness-triggered actions may need run semantics
- `backend/services/workflow_runs_store.py`
  - existing run-artifact persistence layer that is relevant to auditability and resumable agent operations
- `frontend/src/app/layout/RootLayout.tsx`
  - persistent public layout boundary where the floating site-agent shell should mount outside page feature slices so it survives route changes
- `frontend/src/features/site-agent/`
  - frontend-only shell boundary for the floating launcher, compact panel, route context helper, shell state store, typed message parts, and the streaming client for `POST /api/agent/query`
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
- the second implementation slice stays metadata-only and still intentionally narrow:
  - define a small typed registry contract for website-agent capabilities
  - register exactly the first approved capability ids for site intro/navigation, ideas reads, first workflow run metadata, and two content read surfaces
  - add the first markdown skill assets that describe when to stay inline vs when to transition into a full page
  - do not execute handlers, bridge tools, or expose write capabilities yet
- the validated mounted runtime contract at the current submodule SHA is:
  - `build_runtime` from `superhaojun.runtime`
  - `Tool` from `superhaojun.tools.base`
  - `ToolRegistry` from `superhaojun.tools.registry`
  - `MessageBus` from `superhaojun.bus`
  - runtime messages are emitted with `MessageBus.emit(...)`, and the mounted WebUI forwards them by registering `bus.on(...)` handlers in `superhaojun.webui.server.WebUIState._setup_bus_forwarders()`
- the website backend currently needs only `openai` as an additional import-time dependency to load the mounted runtime entrypoint; `rich` and `prompt-toolkit` are present in the harness repo but are not imported by this first loader path
- the backend package metadata must not advertise a lower Python floor than the mounted runtime boundary; since the mounted `SuperHaojun` package requires Python `>=3.12`, the backend metadata for this integration slice must match that floor
- the runtime loader should treat the mounted `apps/superhaojun/src` path as an idempotent boundary mount and avoid duplicating it in `sys.path` across repeated calls
- the runtime loader must not trust an already-cached `superhaojun.runtime` module from `sys.modules`; this boundary should resolve the mounted submodule entrypoint even when the import cache is polluted by earlier process state
- any cached non-mounted `superhaojun.*` child module, such as `superhaojun.bus`, should also be treated as pollution because relative imports inside the mounted runtime must resolve only against the mounted package tree
- the backend lockfile must stay synchronized with the Task 1 package metadata so `uv lock --check` remains a valid reproducibility guard after Python-floor or import-time dependency changes
- the backend package metadata should track the mounted runtime minima for shared runtime dependencies so the website boundary does not advertise older compatibility than the mounted harness for `openai`, `pydantic`, `pydantic-settings`, `fastapi`, `uvicorn`, and `pyyaml`
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
- production deployment for the integrated agent slice should target `personal-web`; `apps/superhaojun` is an implementation dependency via submodule, not a separately deployed public product in this setup
- the shipped Task 4 frontend slice stays intentionally narrow:
  - mount the shell once from `RootLayout`
  - keep the launcher visible across the public SPA routes
  - derive a compact page label from the current pathname instead of adding a dedicated agent route
  - use a local store for shell state, pending request state, route context, suggestions, and run-card placeholders
  - keep message rendering skeletal but typed so later inline/transition rendering can extend the same boundary
- the first registry slice should mirror existing real surfaces:
  - site intro and navigation align with the public SPA route map
  - ideas read capabilities align with the existing `/api/ideas`, `/api/ideas/meta`, and `/api/ideas/{idea_id}` routes
  - workflow capabilities for `start` and `get_run` are registered as future-facing metadata only in this task
  - content capabilities point at the current `daily-nuance` snapshot and the declared `skill-marketplace` catalog surface
- the third implementation slice turns the metadata-only registry into a real website-owned execution path:
  - resolve a compact site context from route, page type, visible entity hints, and bearer-token subject
  - keep capability handlers pure and website-owned so the runtime only sees typed tools, not hidden website branches
  - use the verified backend token path to determine `is_authenticated` and `is_admin`, and let privileged handlers consult that resolved context instead of trusting frontend flags
  - mirror the current skill marketplace seed into a small backend-owned read view instead of parsing frontend TypeScript at request time
  - keep workflow start conservative for now by returning a structured privileged-path result from the capability handler unless a broader async orchestration refactor becomes necessary
- the adapter/runtime contract for Task 3 stays intentionally thin:
  - build or reuse a runtime through `load_superhaojun_build_runtime()`
  - inject only the relevant website skill text into prompt custom instructions for the current request
  - register only the website tools that match the resolved capability groups for the active page context
  - listen to `MessageBus` events and expose them as structured SSE frames without adding website-only execution shortcuts outside the runtime path
- the first backend transport surface for this feature is `POST /api/agent/query`:
  - frontend may send the existing admin bearer token when available
  - backend resolves that token with the same auth helper used by protected routes
  - anonymous requests still keep read-only intro and navigation capability paths available
  - privileged capabilities such as workflow start remain backend-authorized even if the frontend claims admin state
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
- 2026-04-16: Follow-up Task 1 review fixes tightened the backend Python version contract to the mounted runtime floor and expanded the runtime-loader tests to cover idempotent `sys.path` mounting plus clearer transitive dependency import failures.
- 2026-04-16: Final Task 1 review fixes added the lockfile-sync requirement for this runtime boundary slice, along with a packaging-level regression guard and a regenerated backend `uv.lock`.
- 2026-04-16: Final Task 1 hardening also requires the loader to ignore polluted `sys.modules` cache entries for `superhaojun.runtime` and keeps the backend dependency minima aligned with the mounted runtime for shared compatibility-critical packages.
- 2026-04-16: Final Task 1 isolation hardening treats polluted child modules under `superhaojun.*` as boundary violations too, so mounted relative imports cannot accidentally mix cached modules from another package instance.
- 2026-04-16: Task 2 narrows the next slice to a metadata-only capability registry plus the first four skill assets, covering exactly the approved intro, navigation, ideas read, workflow-run metadata, and content catalog capabilities.
- 2026-04-17: Task 3 expands the website-owned boundary with route-aware context resolution, pure capability handlers, a thin tool bridge and adapter, and the first `POST /api/agent/query` SSE transport.
- 2026-04-17: The first `ideas.workflow.start` implementation stays conservative by returning an auth-gated transition result instead of launching a background workflow run from the agent transport.
- 2026-04-17: Task 4 ships the frontend shell skeleton with a persistent `RootLayout` mount, a local shell store, typed message parts, a thin SSE client, and narrow UI tests that explicitly keep v1 on a floating launcher/panel instead of a dedicated full-page agent route.
- 2026-04-19: Clarified the deployment boundary: production rollout for the integrated website agent should deploy `personal-web` and update the `apps/superhaojun` submodule, not deploy `SuperHaojun` as a separate public app for this website setup.
- 2026-04-19: Synced the mounted `apps/superhaojun` submodule to upstream commit `ad9c8b9fa8737276a33ff40fc3f61d5f6c589ebb` before deployment-oriented documentation updates.
