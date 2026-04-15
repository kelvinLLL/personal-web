# Book Reader Reader Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/book-reader` transition shell with a real in-site EPUB reading slice and add a compact backlog-visibility section to the homepage.

**Architecture:** Keep the first reader phase intentionally narrow. Serve a preset book catalog from the unified frontend, render EPUB content in-place with `epubjs`, persist settings and progress in browser storage, and keep the legacy reader as the fallback route. Add homepage backlog visibility from a small frontend data model that mirrors the tracked backlog without making the homepage a dashboard.

**Tech Stack:** Vite, React 19, TypeScript, React Router 7, Tailwind CSS 4, Vitest, epubjs, browser localStorage, frontend public assets

---

### Task 1: Lock The New Reader Slice And Homepage Backlog With Failing Tests

**Files:**
- Modify: `frontend/src/features/book-reader/__tests__/BookReaderPage.test.tsx`
- Modify: `frontend/src/features/home/__tests__/HomePage.test.tsx`

- [ ] **Step 1: Write the failing Book Reader expectations**

Expect `/book-reader` to show:
- a real reading-space heading or summary
- a visible preset book card
- an active reading workspace region
- the legacy fallback link

- [ ] **Step 2: Write the failing homepage backlog expectations**

Expect `/` to show:
- a backlog section heading
- the in-progress book-reader item
- at least one pending item still visible for context

- [ ] **Step 3: Run the focused tests to verify they fail for the right reasons**

Run:

```bash
npm --prefix frontend run test -- src/features/book-reader/__tests__/BookReaderPage.test.tsx src/features/home/__tests__/HomePage.test.tsx
```

Expected:
- Book Reader test fails because the route is still only a transition shell
- HomePage test fails because backlog visibility does not exist yet

### Task 2: Add The Reader Catalog, Persistence, And EPUB Surface Boundaries

**Files:**
- Create: `frontend/src/features/book-reader/model/book.ts`
- Create: `frontend/src/features/book-reader/api/bookCatalog.ts`
- Create: `frontend/src/features/book-reader/lib/readerStorage.ts`
- Create: `frontend/src/features/book-reader/components/EpubReaderSurface.tsx`
- Create: `frontend/src/types/epubjs.d.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create or Copy: `frontend/public/books/manifest.json`
- Create or Copy: `frontend/public/books/美国反对美国 （OCR校对版）.epub`

- [ ] **Step 1: Add the frontend asset source for preset books**

Place the manifest and EPUB asset under `frontend/public/books/` so the unified frontend can serve them without depending on the legacy route.

- [ ] **Step 2: Add the manifest loader and type contracts**

Create:
- book catalog item type
- reader settings type
- book progress type
- manifest loader with runtime validation

- [ ] **Step 3: Add browser persistence helpers**

Persist:
- reader settings
- per-book progress

Do not mix EPUB rendering concerns into the storage module.

- [ ] **Step 4: Add the EPUB surface component**

Create a focused `EpubReaderSurface.tsx` that:
- loads `epubjs`
- renders the book into a provided container
- emits TOC and location updates
- applies theme and typography overrides
- exposes imperative next/previous/goTo controls

### Task 3: Replace The Transition Shell With A Real Reader Workspace

**Files:**
- Create: `frontend/src/features/book-reader/components/BookShelf.tsx`
- Create: `frontend/src/features/book-reader/components/ReaderWorkspace.tsx`
- Modify: `frontend/src/features/book-reader/page/BookReaderPage.tsx`
- Modify or Replace: `frontend/src/features/book-reader/components/ReaderShellIntro.tsx`
- Modify: `frontend/src/features/book-reader/components/LegacyReaderTransitionCard.tsx`

- [ ] **Step 1: Create the shelf UI for preset books**

Render a small shelf that:
- lists preset books from the manifest
- highlights the active selection
- offers an open / continue action

- [ ] **Step 2: Create the reader workspace**

Render:
- active book summary
- progress summary
- theme/font controls
- TOC list
- next/previous controls
- EPUB viewport
- legacy fallback callout

- [ ] **Step 3: Keep the page file as an orchestrator only**

`BookReaderPage.tsx` should:
- load the manifest
- select the active book
- hydrate settings and progress
- pass state into presentational components

It should not own raw EPUB integration details.

- [ ] **Step 4: Preserve the backup path honestly**

Keep `/book-reader-legacy/` visible as the fallback for unfinished capabilities, but no longer as the primary payload of the route.

### Task 4: Add Homepage Backlog Visibility

**Files:**
- Create: `frontend/src/core/site/backlog.ts`
- Create: `frontend/src/features/home/components/RoadmapSection.tsx`
- Modify: `frontend/src/features/home/page/HomePage.tsx`
- Modify: `frontend/src/core/site/navigation.ts`

- [ ] **Step 1: Define a small frontend backlog summary model**

Mirror the tracked backlog with:
- id
- label
- status
- summary
- next step

Keep it concise and manually curated for now.

- [ ] **Step 2: Build the homepage backlog section**

Render a compact visual section that:
- surfaces 3-4 tracked items
- highlights the `in_progress` reader work
- makes progress readable without overwhelming the homepage

- [ ] **Step 3: Refresh Book Reader copy in shared navigation summaries**

Update the Book Reader summary so it no longer describes the route as only a transition shell.

### Task 5: Update Living Docs And Verify End-To-End

**Files:**
- Modify: `docs/features/unified-frontend-refactor.md`
- Modify: `docs/superpowers/plans/2026-04-14-product-backlog.md`

- [ ] **Step 1: Update the living docs so they match the shipped slice**

Record:
- `/book-reader` now shipping a real EPUB reader slice
- homepage backlog visibility added
- `BL-04` still in progress overall, but with the first reader slice shipped

- [ ] **Step 2: Run focused frontend tests**

Run:

```bash
npm --prefix frontend run test -- src/features/book-reader/__tests__/BookReaderPage.test.tsx src/features/home/__tests__/HomePage.test.tsx
```

Expected: PASS

- [ ] **Step 3: Run the full frontend suite**

Run:

```bash
npm --prefix frontend run test
```

Expected: PASS

- [ ] **Step 4: Run the frontend production build**

Run:

```bash
npm --prefix frontend run build
```

Expected: PASS

- [ ] **Step 5: Visually verify the homepage and `/book-reader`**

Verify in the browser:
- homepage shows the backlog section
- `/book-reader` shows a real reading workspace
- a preset book is visibly loaded
- the legacy fallback remains available
