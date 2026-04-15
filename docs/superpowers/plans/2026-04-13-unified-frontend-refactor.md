# Unified Frontend Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Refactor `personal-web` toward one unified public frontend in `frontend`, rebuild `daily-nuance` there, preserve the current `book-reader` as a temporary public legacy route, and establish a cleaner feature-oriented frontend architecture for future growth.

**Architecture:** Keep one public frontend surface while allowing multiple internal runtimes. Phase 1 should keep `ideas` working, rebuild `daily-nuance` as a unified-frontend feature backed by generated snapshot data, move the public reader route to a new shell page, and remount the existing reader at `/book-reader-legacy/`. Use the refactor to simplify the dev/build toolchain by retiring `portal` and the old public `daily-nuance` site from the main delivery path.

**Tech Stack:** Vite, React 19, TypeScript, React Router 7, Zustand, Tailwind CSS 4, shadcn/ui, Node test runner, Vitest, uv, Python 3.12

---

### Task 1: Lock The New Public Surface And Toolchain Contracts With Failing Tests

**Files:**
- Modify: `tests/site-config.test.mjs`
- Modify: `tests/devPorts.test.mjs`
- Create: `frontend/src/app/router/__tests__/router.test.tsx`
- Create: `frontend/src/features/daily-nuance/__tests__/DailyNuancePage.test.tsx`
- Create: `frontend/src/features/book-reader/__tests__/BookReaderPage.test.tsx`

- [x] **Step 1: Add root contract coverage for the new route map**

Update `tests/site-config.test.mjs` to assert:
- the legacy reader base is `/book-reader-legacy/`
- the root output layout no longer includes a standalone `daily-nuance` build target
- `vercel.json` preserves only the legacy reader passthrough before the SPA fallback

- [x] **Step 2: Add dev-runtime coverage for the simplified child-app map**

Update `tests/devPorts.test.mjs` to assert:
- the dev runtime no longer depends on `portal`
- the dev runtime no longer proxies a standalone `daily-nuance` app
- the only child-app passthrough remaining is the legacy reader path

- [x] **Step 3: Add frontend router coverage for the new primary navigation**

Create `frontend/src/app/router/__tests__/router.test.tsx` to verify:
- primary navigation includes `Home`, `Ideas`, `Daily Nuance`, and `Book Reader`
- `Settings` is no longer a primary public-nav item
- `/daily-nuance` resolves inside the SPA
- `/book-reader` resolves inside the SPA

- [x] **Step 4: Add page-level tests for the new Daily Nuance and Book Reader surfaces**

Create tests that prove:
- `DailyNuancePage` fetches and renders the snapshot summary and both ranking sections
- `BookReaderPage` exposes the new-reader shell and the legacy transition entrypoint

- [x] **Step 5: Run the targeted tests and confirm they fail for the intended reasons**

Run:
```bash
node --test tests/site-config.test.mjs tests/devPorts.test.mjs
npm --prefix frontend run test -- src/app/router/__tests__/router.test.tsx src/features/daily-nuance/__tests__/DailyNuancePage.test.tsx src/features/book-reader/__tests__/BookReaderPage.test.tsx
```

Expected:
- root tests fail because the old sub-app constants and rewrites still exist
- frontend tests fail because the new routes and pages do not exist yet

### Task 2: Prepare Daily Nuance Data For The Unified Frontend And Simplify The Root Toolchain

**Files:**
- Create: `scripts/prepare-daily-nuance-data.mjs`
- Modify: `scripts/build-all.mjs`
- Modify: `scripts/dev-all.mjs`
- Modify: `scripts/lib/site-config.mjs`
- Modify: `scripts/lib/dev-ports.mjs`
- Modify: `vercel.json`
- Modify: `tests/site-config.test.mjs`
- Modify: `tests/devPorts.test.mjs`
- Modify: `tests/dailyNuanceDev.test.mjs`

- [x] **Step 1: Write the failing expectation for frontend-consumable nuance data**

Define the target behavior:
- running the nuance preparation step generates the latest snapshot
- the latest snapshot is copied into the frontend's static asset space
- the public site no longer depends on a Docusaurus build for `/daily-nuance`

- [x] **Step 2: Implement a dedicated nuance data-prep script**

Create `scripts/prepare-daily-nuance-data.mjs` to:
- run `uv sync` in `apps/daily-nuance`
- run `uv run novel-nuance --workspace . --date <date>`
- copy `apps/daily-nuance/generated/api/snapshot-latest.json` into a frontend-served location such as `frontend/public/data/daily-nuance/latest.json`

- [x] **Step 3: Rewrite the build order around the unified frontend**

Update `scripts/build-all.mjs` so the order becomes:
1. prepare `daily-nuance` data
2. build the unified frontend
3. build the legacy reader

Expected output:
- `dist/index.html`
- `dist/book-reader-legacy/index.html`
- no standalone `dist/daily-nuance/`

- [x] **Step 4: Simplify local dev around frontend + backend + legacy reader**

Update `scripts/dev-all.mjs`, `scripts/lib/site-config.mjs`, and `scripts/lib/dev-ports.mjs` so that:
- `portal` is no longer started
- Docusaurus is no longer started for `daily-nuance`
- the nuance preparation step runs before frontend dev when needed
- the root dev proxy only passes through the legacy reader child app

- [x] **Step 5: Update Vercel rewrites and root tests**

Adjust `vercel.json` and root tests so:
- `/book-reader-legacy/:path*` is the only passthrough child-app rule
- all other public routes fall back to the SPA entry

- [x] **Step 6: Re-run the root-node tests until green**

Run:
```bash
node --test tests/site-config.test.mjs tests/devPorts.test.mjs tests/dailyNuanceDev.test.mjs
```

Expected: PASS

### Task 3: Introduce A Clear App Shell And Route Registry In `frontend`

**Files:**
- Create: `frontend/src/app/layout/RootLayout.tsx`
- Create: `frontend/src/app/router/router.tsx`
- Create: `frontend/src/core/site/navigation.ts`
- Create: `frontend/src/core/site/routes.ts`
- Create: `frontend/src/components/layout/SiteHeader.tsx`
- Modify: `frontend/src/App.tsx`
- Modify or Replace: `frontend/src/components/layout/Navbar.tsx`
- Test: `frontend/src/app/router/__tests__/router.test.tsx`

- [x] **Step 1: Define the public route constants and nav model**

Create route and navigation modules that explicitly define:
- `/`
- `/ideas`
- `/daily-nuance`
- `/book-reader`
- `/settings` as a non-primary route

- [x] **Step 2: Move the root layout concern out of the current navbar file**

Create `RootLayout.tsx` and `SiteHeader.tsx` so:
- layout ownership is separate from nav-link rendering
- the public shell can evolve without mixing router composition into one file

- [x] **Step 3: Move router construction into `app/router/router.tsx`**

Update `frontend/src/App.tsx` to become a thin bootstrap file that renders the router provider from a dedicated app-layer module.

- [x] **Step 4: Make the primary nav match the approved product surface**

Ensure the primary header contains:
- `Home`
- `Ideas`
- `Daily Nuance`
- `Book Reader`

Do not keep `Reader` or `Settings` in the primary public nav.

- [x] **Step 5: Run the router test and iterate until it passes**

Run:
```bash
npm --prefix frontend run test -- src/app/router/__tests__/router.test.tsx
```

Expected: PASS

### Task 4: Rebuild The Homepage And Rehouse `ideas` Under Explicit Feature Boundaries

**Files:**
- Create: `frontend/src/features/home/page/HomePage.tsx`
- Create: `frontend/src/features/home/components/HomeHero.tsx`
- Create: `frontend/src/features/home/components/FeatureGrid.tsx`
- Create: `frontend/src/features/home/components/IdeasPreview.tsx`
- Create: `frontend/src/features/home/components/NuancePreview.tsx`
- Create: `frontend/src/features/ideas/page/IdeasPage.tsx`
- Create: `frontend/src/features/ideas/page/IdeaDetailPage.tsx`
- Create: `frontend/src/features/ideas/store/useIdeasStore.ts`
- Create: `frontend/src/features/ideas/api/ideasApi.ts`
- Create: `frontend/src/features/ideas/model/idea.ts`
- Move or Split: `frontend/src/components/ideas/*`
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/pages/Ideas.tsx`
- Modify: `frontend/src/pages/IdeaDetail.tsx`
- Modify: `frontend/src/store/ideasStore.ts`
- Modify: `frontend/src/lib/ideasApi.ts`
- Modify: `frontend/src/types/idea.ts`
- Test: existing ideas frontend tests plus any new home tests as needed

- [x] **Step 1: Write the failing expectation for the new home surface**

Add or adjust frontend tests so the homepage is expected to show:
- brand + entrypoint hero
- project entry cards for the four public surfaces
- preview blocks for `ideas` and `daily-nuance`

- [x] **Step 2: Create a feature-owned home page**

Build `features/home/page/HomePage.tsx` and the supporting components so the homepage follows the approved mixed structure:
- strong top brand/navigation section
- lower content summaries

- [x] **Step 3: Move `ideas` ownership into `features/ideas` without breaking behavior**

Split current idea logic into:
- `model`
- `api`
- `store`
- `page`
- feature-owned components

Keep the current behavior working while reducing dependence on repo-global `pages`, `lib`, and `store` buckets.

- [x] **Step 4: Leave compatibility shims only if they materially reduce risk**

If needed, keep temporary page re-exports in `frontend/src/pages/` while the router transitions. If they remain, they must stay thin and be removed later.

- [x] **Step 5: Run the existing ideas/home frontend tests**

Run:
```bash
npm --prefix frontend run test -- src/pages/__tests__/Ideas.test.tsx src/pages/__tests__/IdeaDetail.test.tsx src/store/__tests__/ideasStore.test.ts src/components/ideas/__tests__/IdeaFilter.test.tsx src/components/ideas/__tests__/IdeaCard.test.tsx
```

Expected: PASS after imports and ownership boundaries are updated

### Task 5: Build `daily-nuance` As A First-Class Unified-Frontend Feature

**Files:**
- Create: `frontend/src/features/daily-nuance/model/nuance.ts`
- Create: `frontend/src/features/daily-nuance/api/dailyNuanceApi.ts`
- Create: `frontend/src/features/daily-nuance/page/DailyNuancePage.tsx`
- Create: `frontend/src/features/daily-nuance/components/NuanceHero.tsx`
- Create: `frontend/src/features/daily-nuance/components/NuanceSection.tsx`
- Create: `frontend/src/features/daily-nuance/components/NuanceItemCard.tsx`
- Create: `frontend/src/features/daily-nuance/components/NuanceSnapshotMeta.tsx`
- Create: `frontend/src/features/daily-nuance/__tests__/DailyNuancePage.test.tsx`
- Modify: `frontend/src/app/router/router.tsx`
- Modify: `frontend/src/features/home/components/NuancePreview.tsx`
- Modify as needed: `frontend/src/components/ui/*`

- [x] **Step 1: Define the nuance data model around the generated snapshot**

Capture the shape of `snapshot-latest.json` in a feature-owned model file. Keep it separate from `ideas` types even if some UI patterns are shared.

- [x] **Step 2: Create a frontend-only API adapter for the static snapshot**

Implement `dailyNuanceApi.ts` so the feature reads from the frontend-served data asset, not from the old Docusaurus app.

- [x] **Step 3: Build the page using the same product grammar as `ideas`**

The page should include:
- freshness/snapshot metadata
- `New & Fancy` section
- `Proven & Rising` section
- item cards with domains, sources, and score summaries

Keep the visual family related to `ideas` while preserving distinct semantics.

- [x] **Step 4: Wire `/daily-nuance` into the SPA router and homepage preview**

Ensure the new route is public, linked from the header, and previewed from the homepage.

- [x] **Step 5: Run the nuance page test and the frontend build**

Run:
```bash
npm --prefix frontend run test -- src/features/daily-nuance/__tests__/DailyNuancePage.test.tsx
npm --prefix frontend run build
```

Expected:
- the page test passes
- the frontend build succeeds with the static nuance snapshot included

### Task 6: Implement The New Book Reader Shell And Preserve The Old Reader As Legacy

**Files:**
- Create: `frontend/src/features/book-reader/page/BookReaderPage.tsx`
- Create: `frontend/src/features/book-reader/components/BookReaderIntro.tsx`
- Create: `frontend/src/features/book-reader/components/LegacyReaderCard.tsx`
- Create: `frontend/src/features/book-reader/__tests__/BookReaderPage.test.tsx`
- Modify: `frontend/src/pages/Reader.tsx`
- Modify: `frontend/src/app/router/router.tsx`
- Modify: `frontend/src/features/home/components/FeatureGrid.tsx`
- Modify: `scripts/lib/site-config.mjs`
- Modify: `scripts/build-book-reader.mjs`
- Modify: `apps/book-reader` environment expectations only if required by the new base path

- [x] **Step 1: Change the legacy reader mount point to `/book-reader-legacy/`**

Update build/dev constants and tests so the current reader is published under the legacy route.

- [x] **Step 2: Create the new `/book-reader` shell page**

The new shell should:
- explain the reader's place in the unified site
- present the current direction
- expose a clear CTA into the legacy reader during Phase 1

- [x] **Step 3: Remove the old `/reader` public route**

Replace it with the new `/book-reader` route in the SPA and update all internal links and homepage cards.

- [x] **Step 4: Run the targeted reader tests and root-node contract tests**

Run:
```bash
npm --prefix frontend run test -- src/features/book-reader/__tests__/BookReaderPage.test.tsx
node --test tests/site-config.test.mjs tests/devPorts.test.mjs
```

Expected: PASS

### Task 7: Sync Docs To The Final Implementation And Run Full Verification

**Files:**
- Modify: `docs/features/unified-frontend-refactor.md`
- Modify: `docs/development-rules.md` if the implementation reveals reusable rules worth promoting
- Modify as needed: any tests or small support files discovered during verification

- [x] **Step 1: Refresh the feature living doc before final verification claims**

Update:
- `status`
- `entrypoints`
- `File Structure`
- `Current Design`
- `Change Notes`

Make the doc reflect the final code reality, not the starting assumptions.

- [x] **Step 2: Run the full root and frontend test suites**

Run:
```bash
npm test
npm --prefix frontend run test
```

Expected: PASS

- [x] **Step 3: Run the frontend production build**

Run:
```bash
npm --prefix frontend run build
npm run build
```

Expected:
- unified frontend builds successfully
- root build emits the unified site plus the legacy reader output

- [x] **Step 4: Start local dev and verify the actual route story**

Run:
```bash
npm run dev
```

Verify manually:
- `/`
- `/ideas`
- `/daily-nuance`
- `/book-reader`
- `/book-reader-legacy`

- [x] **Step 5: Summarize residual risk before handoff**

Call out:
- any remaining legacy dependencies
- any intentionally deferred reader-depth work
- any follow-up cleanup needed after the public-surface migration
