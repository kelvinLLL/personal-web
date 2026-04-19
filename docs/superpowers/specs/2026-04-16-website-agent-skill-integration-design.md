# Website Agent Skill Integration Design

**Goal:** Integrate `SuperHaojun` into `personal-web` as the canonical agent runtime while giving the website a skill-first contract layer and a floating chat entry that can either solve work inline or explicitly guide users into larger page surfaces.

## Scope

In scope:

- mount `SuperHaojun` as a git submodule at `apps/superhaojun`
- define the website-owned adapter boundary around the external runtime
- define a skill-first website contract layer for site capabilities
- define a capability registry that keeps skill prose and executable actions aligned
- define the first frontend entry shape for the website agent
- define the first capability slices for `ideas`, navigation, and read-only content

Out of scope:

- rewriting or forking the `SuperHaojun` runtime core
- building a full general-purpose assistant for every sub-app on day one
- exposing legacy `book-reader` internals as first-class agent actions in the first slice
- implementing a marketplace or remote distribution system for website skills
- making MCP the primary integration protocol

## Why This Shape

The external handoff for `SuperHaojun` is clear:

- the harness should remain the runtime core
- the website should add a thin adapter
- website actions should be exposed as tools, not hidden special cases

That still leaves one important website problem unsolved:

- a website needs more than a raw tool list
- users need a friendly chat entry
- models need progressive disclosure instead of one giant prompt
- operators need stable governance for permissions, risk, confirmation, and long-running actions

So the right shape is not:

- raw API-first integration
- MCP-first integration
- one giant prompt blob

The right shape is:

- floating frontend agent shell
- skill-first interaction model
- capability registry under the skills
- thin website adapter between the site and `SuperHaojun`

## Industry Grounding

This design borrows stable ideas from mature agent/tool systems without adopting MCP as the public integration surface:

- OpenAI tools and remote tool guidance emphasize typed tool boundaries and explicit tool choice rather than ad hoc prompt magic
- MCP emphasizes structured tool schemas, clear read/write boundaries, and high caution around write actions
- A2A and workflow-oriented specs reinforce that long-running work should be modeled as tasks or runs instead of pretending every action is a one-shot RPC
- Stripe-style idempotency is a useful baseline for any mutation path that may be retried by an agent

In this website, those lessons become:

- use skills for progressive disclosure
- keep capabilities typed and governed underneath
- treat workflow-like operations as runs
- keep risky actions explicit and auditable

## Core Decision

Treat website integration as three layers:

1. `SuperHaojun` as runtime core
2. `personal-web` website agent adapter
3. `personal-web` skill and capability layer

This preserves the strongest parts of the harness:

- agent loop
- tool orchestration
- turn visibility
- streaming semantics

while letting the website own the things only the website can know:

- auth-aware context
- page context
- product navigation
- UI shape
- site-specific risk boundaries

## Frontend Experience

The public entry should be a floating website agent shell, not a full-page assistant by default.

### Entry Shape

- show a persistent floating launcher across the main site
- support dragging on desktop
- open into a compact chat panel
- keep the panel visually distinct from ordinary page cards
- preserve a strong sense of current page context

### Two Interaction Modes

The shell must support both of these modes:

1. Inline mode

- the user stays in the floating panel
- the agent answers questions
- the agent explains the current page
- the agent reads or summarizes current-page content
- the agent completes small safe actions that fit inside the panel

2. Transition mode

- the agent recommends or triggers an explicit page transition when a larger surface is better
- examples:
  - jump from homepage to `Ideas`
  - open a specific skill detail page
  - move into a deeper workflow or reading surface
- the navigation should remain user-visible and interpretable, not a silent teleport hidden behind chat

### Capability Lanes In The UI

The expanded shell should make room for these mental buckets:

- `This Page`
- `Navigate`
- `Intro`
- `General`
- `Admin Actions`

These do not all need to be first-class tabs in v1, but the runtime and skill layer should think in these categories from the start.

### Visibility Requirements

The shell should preserve explainability instead of flattening everything into plain chat text:

- show tool activity when it happens
- show workflow run state explicitly
- show confirmation state for privileged actions
- show why a transition is being suggested

### Responsive Interpretation

- desktop: draggable floating shell
- mobile: docked bottom sheet or equivalent compact overlay

The important product rule is persistence and context awareness, not literal drag behavior on every form factor.

## Website Skills

The website should expose skills as the model-facing organizing layer.

These skills are not meant to replace the runtime.
They exist to:

- explain what the site can do
- limit prompt scope to the relevant slice
- make permission and risk boundaries legible
- guide the model toward the right capability group

### First Skill Set

- `using-personal-web`
  - top-level site map and routing skill
- `ideas-read`
  - browse, inspect, and explain idea content
- `ideas-workflow`
  - trigger and monitor idea-discovery workflows
- `content-read`
  - read-only content surfaces such as `daily-nuance` and `skill-marketplace`

Deferred:

- `ideas-write`
- deeper `book-reader` actions
- more specialized page skills

### Skill Responsibilities

Each skill should answer:

- when should this skill be used
- what surface does it cover
- what actions are safe vs privileged
- when should the model stay inline vs recommend a page transition
- what examples of user intent map to this skill

### Progressive Disclosure

Do not inject every skill on every request.

Default pattern:

- always load `using-personal-web`
- load page-specific or intent-specific skills only when relevant
- load privileged skills only when the user and context justify them

Examples:

- homepage question about where to start:
  - `using-personal-web`
- question on the `Ideas` page:
  - `using-personal-web` + `ideas-read`
- request to run idea discovery:
  - `using-personal-web` + `ideas-read` + `ideas-workflow`

## Capability Registry

Skills need a stable executable substrate so the website does not drift into one set of prose and another set of actual actions.

Define a website-owned capability registry with a stable schema.

### Minimum Fields

- `capability_id`
- `title`
- `surface`
- `kind`
  - `read`
  - `write`
  - `workflow`
  - `navigation`
- `summary`
- `input_schema`
- `output_schema`
- `auth_required`
- `risk_level`
- `confirmation_required`
- `idempotent`
- `run_mode`
  - `sync`
  - `async`
- `backend_binding`
- `visible_in_skills`

### First Capability Set

- `site.intro`
- `site.navigate`
- `ideas.list`
- `ideas.get`
- `ideas.meta`
- `ideas.workflow.start`
- `ideas.workflow.get_run`
- `content.daily_nuance.latest`
- `content.skill_marketplace.catalog`

Deferred:

- `ideas.create`
- `ideas.update`
- `ideas.delete`
- deep reader actions

### Why The Registry Matters

It gives the system one stable truth for:

- prompt shaping
- tool exposure
- confirmation rules
- logging and audit
- future protocol adapters if needed later

## Website Agent Adapter

The adapter is the website-owned bridge around `SuperHaojun`.

### Responsibilities

- accept website agent requests
- resolve user identity and auth context
- resolve current page context
- choose which website skills to inject
- expose website capabilities as runtime-callable tools
- stream runtime events back to the frontend

### Non-Responsibilities

- reimplementing tool orchestration
- bypassing the runtime for website-only shortcuts
- owning business logic that should live in capability handlers
- becoming a second hidden agent framework

### Context Injection

Every request into the adapter should carry structured site context:

- current route
- current page type
- current visible entity id or slug when relevant
- allowed capability groups
- auth state
- admin state if present
- recent run or tool context when useful

This is what enables questions like:

- what is this page for
- what can I do here
- explain this idea
- take me to the right place

## Interaction Policy

### Inline Mode

Use inline mode when:

- the answer fits in chat
- the action is read-only
- the action is small and safe
- the user is clearly asking about the current page

Examples:

- summarize this page
- explain the filters
- tell me what this skill does
- show the latest ideas

### Transition Mode

Use transition mode when:

- the user needs a richer product surface
- the result is fundamentally navigational
- the task would be cramped or confusing inside the floating shell

Examples:

- take me to the ideas page
- open that skill detail page
- continue this flow in the workflow panel

### Privileged Mode

Use privileged handling when:

- the task changes persistent state
- the task starts a workflow
- the task requires admin-only access

These actions should not masquerade as harmless chat responses.

## Long-Running Work

Workflow-like actions should remain run-based.

For v1:

- `ideas.workflow.start`
  - returns a `run_id`
- `ideas.workflow.get_run`
  - returns current status and summary

The frontend should render a run card or equivalent structured UI state instead of forcing everything into normal text messages.

## Safety And Governance

The website should make these rules explicit from the start:

- `read`, `write`, `workflow`, and `navigation` are different capability kinds
- privileged actions require auth
- high-risk actions require confirmation
- workflow start should be treated as an explicitly governed action
- mutation paths should be idempotent where practical
- runtime calls should produce structured errors instead of vague prose-only failures
- audit logs should capture at least:
  - user identity
  - capability id
  - timestamp
  - success or failure
  - run id when applicable

## Relationship To Current `SuperHaojun`

The current `SuperHaojun` runtime already supports repo-local extension discovery and prompt shaping.

That means the first website integration does not need a deep runtime rewrite.

Use this approach:

- keep website skills owned by the website repo
- have the website adapter decide which skills to inject
- let the harness consume them through the existing prompt and runtime boundaries

Do not block the first integration on inventing a much heavier native skill marketplace inside the harness.

## Initial Delivery Slice

Ship the first integration in one narrow loop:

- mount `apps/superhaojun`
- add the website agent adapter skeleton
- add the floating frontend shell
- add `using-personal-web`
- add `ideas-read`
- add `ideas-workflow`
- add the first capability registry entries
- verify one end-to-end path:
  - user asks in floating shell
  - runtime answers with page-aware context
  - runtime can read `ideas`
  - runtime can start workflow
  - frontend can show run state

## Recommended File Direction

These are the most likely new boundaries for implementation:

- `apps/superhaojun`
  - external runtime submodule
- `backend/routers/agent.py`
  - website-facing agent endpoint boundary
- `backend/services/site_agent/adapter.py`
  - request normalization and runtime bridge
- `backend/services/site_agent/registry.py`
  - capability registry
- `backend/services/site_agent/capabilities/`
  - capability handlers by domain
- `backend/services/site_agent/skills/`
  - website-owned skill assets
- `frontend/src/features/site-agent/`
  - floating shell, run cards, tool visibility, and route-aware agent UI

This is intentionally a website-owned layer. It should not require moving product semantics into the submodule.

## Verification Strategy

### Backend

- capability registry validates first capability set
- adapter injects route-aware context
- workflow capabilities remain run-based
- privileged actions reject unauthorized users clearly

### Frontend

- floating launcher renders on main site routes
- expanded shell supports inline responses
- navigation suggestions are explicit and clickable
- workflow runs render as structured status, not plain text only

### Integration

- `SuperHaojun` submodule boots from `apps/superhaojun`
- website adapter can send one page-aware request into the runtime
- a request on `/ideas` receives different context than a request on `/`
- workflow start returns visible state to the floating shell

## Risks

- the first registry may be underspecified if too many capability types are introduced at once
- the floating shell could become cramped if too many workflows are forced inline
- page context injection can become noisy if not carefully bounded
- website-owned skill assets could drift unless they stay tied to registry-backed capabilities

## Recommendation

Implement the first integration slice around:

- floating site-agent shell
- inline plus transition interaction model
- skill-first website contract
- capability registry for governance
- thin adapter around `SuperHaojun`

This gives the website an understandable product entry, keeps the runtime canonical, and leaves room to expand the site's skill surface without rebuilding the integration model later.
