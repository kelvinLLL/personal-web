# Unified Frontend Refactor Design

**Date:** 2026-04-13
**Status:** approved-for-spec-review

## Goal

Refactor `personal-web` toward one unified public frontend while preserving the freedom to use multiple internal services and technologies behind that surface.

The target public product surface is:

- `/`
- `/ideas`
- `/daily-nuance`
- `/book-reader`
- `/book-reader-legacy` during transition

The core product goal is not framework unification for its own sake. It is to create a single clear frontend product boundary that can keep growing as new features are added.

## Core Product Decisions

- `frontend` becomes the long-term public frontend for the site.
- Internal implementation may still use multiple services and technologies.
- `daily-nuance` should be treated as a sibling of `ideas`, not as a long-term standalone docs-style site.
- The existing `book-reader` must be preserved during the transition.
- The old reader remains publicly accessible for a period under a legacy route, then can be hidden later once the new reader is good enough.

## Why This Direction

The important distinction is:

- one public product surface
- many possible internal runtimes

Those are not the same decision.

This refactor should reduce product-surface drift, simplify future feature placement, and make shared capabilities such as model settings or operator workflows easier to centralize later.

## Non-Goals

This phase does not aim to:

- rewrite every legacy capability immediately
- migrate the frontend to the exact framework stack used in the reference project
- preserve the existing `daily-nuance` Docusaurus site as a long-term public surface
- fully rebuild the deep reading experience of `book-reader` in one pass

## Architecture Direction

### Public Surface

The long-term public frontend becomes a single product surface served by `frontend`.

Target routes:

- `/`
- `/ideas`
- `/daily-nuance`
- `/book-reader`
- `/book-reader-legacy`

### Internal Runtime Model

The system may still use different technologies internally:

- React + TypeScript frontend for the unified UI
- Python services for workflow, models, and backend orchestration
- temporary legacy sub-apps during migration

The design goal is therefore:

- unify the public UI boundary
- not force all internal code into one language or one runtime

## Code Architecture Constraints

These constraints are hard requirements for the refactor:

- keep files under `500` lines
- organize code by clear responsibility and stable boundaries
- avoid over-coupled page-centric code
- do not mechanically force generic directory names if they do not match the real boundaries
- split larger capabilities into smaller modules when a feature starts mixing multiple concerns
- use `uv` for Python dependency and environment management
- standardize Python on `3.12`

The right mental model is not "must have `core/models/services` because that sounds standard." The right mental model is "make the boundaries readable, low-coupling, and easy to extend."

## UI Strategy

This refactor should borrow the composition strategy from the reference UI-component project, not its framework choice.

Use:

- stable UI primitives for structure
- restrained marketing or accent components only where they genuinely help
- consistent information architecture across feature pages

Do not:

- treat decorative components as the product architecture
- spread homepage-style visual accents across operator-heavy pages

### Visual Rules By Surface

- `/`
  - strongest visual personality
  - brand + navigation + curated content summary
- `/ideas`
  - operator-oriented feature page
  - clear filters, ranking, freshness, status, and actions
- `/daily-nuance`
  - same product family as `ideas`
  - similar interaction grammar, different data semantics
- `/book-reader`
  - calm and focused
  - Phase 1 is mostly an entry shell and transition layer
- `/book-reader-legacy`
  - clearly legacy, but still usable

## Target Frontend Structure

The exact folder names may evolve, but the structure should move toward explicit feature boundaries.

One acceptable direction is:

```text
frontend/src/
  app/
    layout/
    providers/
    router/
  core/
    config/
    site/
    utils/
  components/
    ui/
    layout/
    marketing/
  features/
    home/
    ideas/
    daily-nuance/
    book-reader/
```

Important rule:

- organize by responsibility and feature ownership
- keep shared primitives separate from feature-specific code
- avoid dumping business logic into global `lib/` or page files

## Phase 1 Scope

Phase 1 should focus on establishing the unified product surface without taking unnecessary risk.

### In Scope

- make `frontend` the clear public frontend direction
- create a new unified homepage at `/`
- keep `ideas` as a first-class feature and continue refining it
- rebuild `daily-nuance` inside the unified frontend
- add a new `/book-reader` shell page
- preserve the existing reader under `/book-reader-legacy`
- align navigation and page hierarchy across these surfaces

### Out of Scope

- fully rewriting the deep reading experience in the same phase
- preserving the old `daily-nuance` site as a long-term public page
- deleting all legacy code immediately

## Route-Level Product Design

### `/`

Use a mixed homepage:

- top half: clear brand, navigation, and feature entrypoints
- lower half: curated summary content from `ideas` and `daily-nuance`

The homepage should feel like one site that contains several capability surfaces, not like a link farm.

### `/ideas`

Keep and refine the strongest existing product slice.

This page should remain a model feature for:

- feature structure
- operator interactions
- freshness and workflow visibility

### `/daily-nuance`

Rebuild it as a feature page in the unified frontend.

It should share product grammar with `ideas`, but not the same business model:

- `ideas` is about build-worthy projects
- `daily-nuance` is about interesting knowledge and signals

Shared patterns are welcome. Shared data semantics are not.

### `/book-reader`

Phase 1 should make this a new entry shell, not the final reading system.

The page should:

- place the reader clearly inside the new product architecture
- explain the new direction
- provide the transition to the legacy reader

### `/book-reader-legacy`

Keep the current reader publicly reachable during transition.

Long-term plan:

1. public legacy route during migration
2. remove from primary navigation when the new reader is good enough
3. keep as backup until it is genuinely safe to retire

## Migration Order

Recommended order:

1. restructure the unified frontend shell and boundaries
2. rebuild the homepage
3. fold `ideas` into the new feature architecture
4. rebuild `daily-nuance` in the same family
5. add the new `book-reader` shell and legacy route strategy

This order prioritizes future extensibility over immediate deep feature parity.

## Verification Strategy

### Product Surface Verification

Verify that users can understand the site as one coherent frontend:

- homepage hierarchy is clear
- navigation is consistent
- feature boundaries are understandable
- legacy reader is clearly transitional

### Capability Verification

Verify that refactoring UI does not silently break actual capability:

- `ideas` interaction flows still work
- `daily-nuance` data presentation and freshness semantics are clear
- `book-reader-legacy` remains stable

### Structure Verification

Review for:

- file size drift
- blurred responsibilities
- page-level orchestration creep
- accidental coupling across features

## Risks

### Risk 1: Half-Unified Product Surface

If the public boundary is not made explicit, the repo may keep drifting between multiple partial frontends.

### Risk 2: Forced Symmetry Between `ideas` And `daily-nuance`

They should feel related, not identical.

### Risk 3: Premature Reader Rewrite

Rebuilding deep reading interactions too early adds risk to the most polished current feature.

### Risk 4: Architecture Theater

Generic folder names are not enough. The refactor only succeeds if the resulting modules are actually low-coupling and understandable.

## Success Criteria

Phase 1 is successful when:

- `frontend` becomes the clearly intended public frontend
- the site reads as one product with several capabilities
- `ideas` and `daily-nuance` feel like related feature surfaces
- `/book-reader` and `/book-reader-legacy` create a safe transition
- the code structure becomes easier to extend with future features
