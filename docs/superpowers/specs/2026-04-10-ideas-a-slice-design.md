# Ideas A-Slice Design

**Goal:** Repair the `Ideas` vertical slice so the list is trustworthy, refreshable, and backed by a consistent frontend/backend contract, while introducing a limited `shadcn` foundation for future UI work.

## Scope

- fix status filter contract drift
- make sort changes immediately visible
- unify frontend admin token access
- add a clear refresh/discovery workflow in the `Ideas` area
- expose list freshness metadata
- fix the detail-page loading pattern flagged by lint
- replace a small set of ideas/settings controls with `shadcn` primitives

## Non-Goals

- full product-wide redesign
- full auth/permission redesign
- full workflow history or candidate review system
- portal/homepage visual refactor

## Design

### Frontend

- Keep `Ideas` as the primary work surface.
- Add two explicit actions:
  - `Refresh List`: refetch the currently published ideas and freshness metadata
  - `Run Discovery`: admin-only, streams progress and refreshes the list when complete
- Show freshness in the page header so users can tell whether the data is current.
- Move admin token access behind a single helper instead of ad-hoc `localStorage` reads.
- Make sorting local and immediate instead of indirectly coupled to refetches.

### Backend

- Accept the frontend's `status` query parameter while retaining compatibility with the old `status_filter`.
- Add a lightweight metadata endpoint for `updated_at` and total count so the UI can communicate freshness.

### UI

- Initialize `shadcn` in `frontend`.
- Use a very small component set first: button, card, badge, input, textarea, alert.
- Apply these only to the `Ideas` and related workflow/settings surfaces touched by this slice.

### Testing

- Add backend tests for status filtering and metadata.
- Add frontend tests for:
  - sort changes
  - refresh action
  - workflow progress / completion behavior where practical
  - unified token access helper behavior

