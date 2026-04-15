# Book Reader Reader Slice Design

**Date:** 2026-04-14  
**Status:** approved-for-implementation

## Goal

Replace the current `/book-reader` transition shell with a true in-site reading slice that is immediately usable inside the unified frontend.

This phase should also expose the current product backlog on the homepage in a compact, scannable way so the active work stays visible without sending people into internal docs first.

## Core Product Decisions

- `/book-reader` should stop being only a migration notice.
- The first real slice should prioritize one working EPUB reading flow over broad parity with the legacy app.
- `/book-reader-legacy/` remains the safety route for unfinished capabilities.
- The homepage should show current backlog focus, but in an editorial way rather than a dense operator dashboard.

## Why This Direction

Right now the public Book Reader route does not prove that a new reader exists. It only explains that a new reader will exist later. That leaves the product surface in an awkward state:

- the unified frontend claims ownership of reading
- the real reading experience still lives elsewhere
- the homepage has no clear way to show which work is currently in motion

The fastest honest improvement is not a full reader rewrite. It is a vertical slice that lets a visitor open a book and read it inside the unified site today, while making current progress visible on the homepage.

## Non-Goals

This phase does not aim to:

- fully replace the legacy reader
- support every legacy capability in one pass
- migrate PDF handling into the unified frontend
- migrate local file uploads into the unified frontend
- add advanced search, bookmarks, or mobile parity as first-pass requirements
- build a docs-to-UI automatic backlog sync system

## Scope

### In Scope

- fetch a preset book catalog from the unified frontend
- render a real in-site EPUB reading experience on `/book-reader`
- persist reader settings and reading progress in browser storage
- provide a table-of-contents navigation surface
- keep a clear fallback into `/book-reader-legacy/`
- add a homepage backlog section that visualizes the current registered items and status

### Out of Scope

- PDF reading in the new route
- local upload/import flows
- full keyboard shortcut parity
- search inside books
- bookmark management
- replacing the product backlog markdown as the source-of-truth

## Reader Slice Architecture

### Public Asset Strategy

The new reader slice should serve a preset catalog from the unified frontend itself.

Phase-1 asset shape:

- `frontend/public/books/manifest.json`
- `frontend/public/books/<epub-file>`

This keeps the new route independent from the legacy app at runtime for the first working slice.

### Frontend Module Boundaries

The slice should live under `frontend/src/features/book-reader/` with clear responsibility splits:

- `model/`
  - book catalog item types
  - reader settings and progress types
- `api/`
  - manifest loading
- `lib/`
  - browser persistence for settings and progress
- `components/`
  - library/shelf presentation
  - reader controls
  - reader workspace layout
  - EPUB surface integration
- `page/`
  - route-level orchestration only

No single page file should absorb catalog loading, EPUB integration, persistence, and layout logic together.

### Rendering Strategy

Use `epubjs` in the unified frontend for EPUB rendering.

The minimal slice should:

- load one preset book from the manifest
- allow selecting that book from a shelf card
- render the EPUB in-place
- expose simple next/previous navigation
- expose theme and typography controls
- persist the last reading location and restore it on revisit

### State Model

Store in browser persistence:

- reader settings
  - theme
  - font family
  - font size
  - line height
- per-book progress
  - current location
  - progress percentage
  - last opened time

The route itself should keep only lightweight UI state:

- active book id
- table of contents entries
- current location summary
- loading and error state

## Page-Level Design

### `/book-reader`

The new route should have three visible layers:

1. Reader intro  
   A calm top section that explains this is now the primary in-site reading surface.

2. Library shelf  
   A small catalog strip that shows available preset books and lets the user open one directly.

3. Reader workspace  
   A real reading area with:
   - current book summary
   - reading controls
   - TOC navigation
   - EPUB viewport
   - legacy fallback link

The page should still acknowledge that the legacy reader remains the backup for unfinished capabilities, but that note should no longer dominate the route.

### `/`

The homepage should gain a compact backlog section that:

- shows the currently registered backlog items
- makes status visible at a glance
- keeps copy concise and scannable
- feels aligned with the editorial homepage direction rather than like an internal kanban board

The homepage backlog is a visibility surface, not the system of record.

## UX Rules

- Book Reader should feel calm and productized, not like an unfinished admin tool.
- The active book should be obvious within one screen.
- The TOC and settings should help reading, not overpower it.
- The homepage backlog should highlight status and next move, not every project detail.

## Testing Strategy

The implementation should follow a red-green flow with focused tests first.

Add coverage for:

- the new `/book-reader` page rendering a real reader slice instead of a transition-only shell
- the book shelf and active reader workspace
- homepage backlog visibility

Keep EPUB integration test scope narrow by mocking the external reader surface where appropriate. Test the page contract and orchestration, not the internals of `epubjs`.

## Success Criteria

This slice is successful when:

- `/book-reader` renders a real in-site EPUB reading experience
- at least one preset book is readable inside the unified frontend
- the page still exposes `/book-reader-legacy/` as a backup path
- homepage visitors can see the current backlog focus and progress state
- tests, build, and live browser verification all pass
