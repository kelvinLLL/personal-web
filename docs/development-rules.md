# Development Rules

## Purpose

This document stores reusable development rules for `personal-web`.

Use it for project-wide constraints and durable insights that should influence future feature work. Keep feature-specific context in `docs/features/<feature>.md`.

## Hard Constraints

- Use docs-first feature development in this repo.
- Before feature implementation, open or create `docs/features/<feature>.md` and update it first.
- Every feature doc inherits this document by default and adds only feature-specific hard constraints.
- Keep files focused; split or extract before a file grows past 500 lines unless an existing repo pattern or a clear reason says otherwise.
- Prefer explicit boundaries and named abstractions over ad hoc logic spread across pages, routes, or entry files.
- Organize modules by responsibility and stable boundaries, not because a fashionable directory list says every project must look the same.
- When a feature starts mixing multiple concerns, split it into smaller modules with explicit ownership instead of growing one broad file or one vague utility bucket.
- Feature docs must reflect current code reality, not only intended future state.
- When documentation or backlog status needs to appear in the UI, mirror the needed state into a small typed frontend module instead of parsing markdown at runtime.
- When one surface links to a separately served app, treat that target as an external app boundary in the SPA. Do not route to it with in-app client routing primitives just because the path looks same-origin.
- Do not hide important workflow entrypoints just because execution is permission-gated. Keep the CTA visible and surface the auth requirement at execution time.
- When a replacement surface is materially worse than the incumbent, collapse the public entry back to the incumbent instead of maintaining two competing product paths.
- When a public read surface must still work on static hosting, mirror a build-time snapshot into frontend assets and let the UI fall back to that snapshot instead of assuming a live `/api/*` backend will always exist.

## Documentation Flow

1. Identify the feature being changed.
2. Open or create `docs/features/<feature>.md`.
3. Update the feature doc header metadata and required sections before code changes.
4. Implement the change.
5. Update the feature doc again so file structure, design notes, and change notes match shipped reality.
6. Promote any reusable insight into this document.

## Insight Promotion

Promote an insight from a feature doc into this file when it is:

- likely to matter again outside the current feature
- specific enough to change future design or implementation choices
- observable in review, testing, or architecture decisions

Do not promote:

- one-off implementation trivia
- temporary migration notes
- generic slogans that do not change decisions
