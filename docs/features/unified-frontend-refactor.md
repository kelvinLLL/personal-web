status: in_progress
entrypoints:
  - scripts/dev-all.mjs
  - scripts/build-all.mjs
  - scripts/prepare-daily-nuance-data.mjs
  - scripts/prepare-ideas-data.mjs
  - scripts/build-frontend.mjs
  - frontend/src/App.tsx
  - scripts/build-str-viewer.mjs
  - frontend/src/app/layout/RootLayout.tsx
  - frontend/src/app/router/router.tsx
  - frontend/src/core/site/routes.ts
  - frontend/src/core/site/legacyReader.ts
  - frontend/src/core/site/superhaojun.ts
  - frontend/src/core/site/navigation.ts
  - frontend/src/lib/apiClient.ts
  - frontend/public/data/ideas/latest.json
  - frontend/public/data/daily-nuance/latest.json
  - frontend/src/index.css
  - frontend/src/features/home/page/HomePage.tsx
  - frontend/src/features/home/components/FeatureGrid.tsx
  - frontend/src/features/home/components/RoadmapSection.tsx
  - frontend/src/features/ideas/page/IdeasPage.tsx
  - frontend/src/features/ideas/page/IdeaDetailPage.tsx
  - frontend/src/features/daily-nuance/page/DailyNuancePage.tsx
  - frontend/src/features/book-reader/page/BookReaderPage.tsx
  - frontend/src/features/book-reader/components/LegacyReaderTransitionCard.tsx
  - frontend/src/features/site-agent/page/SuperHaojunPage.tsx
  - frontend/src/core/site/backlog.ts
  - apps/book-reader/src/App.jsx
  - apps/book-reader/src/components/Toolbar.jsx
  - apps/str-viewer/
hard_constraints:
  - Follow docs/development-rules.md.
  - Keep every file under 500 lines.
  - Organize modules by real responsibility and stable boundaries instead of forcing generic directory names.
  - Keep feature-level logic low-coupling and avoid page files becoming orchestration sinks.
  - Use uv-managed Python 3.12 for Python services and tooling.
design_notes:
  - The long-term target is one public frontend with multiple internal services.
  - Daily Nuance should share product grammar with Ideas, not business semantics.
  - Preserve the current Book Reader as a public legacy route during transition.
  - Keep thin `frontend/src/pages/*` compatibility shims only where they still reduce router migration risk.
  - The current refinement pass should push home and ideas toward an editorial front door, not a dashboard.
  - Homepage entrypoints should be immediately scannable and avoid decorative cognitive load.
  - Ideas should read as a curated collection first and an operator workbench second.
  - The public book-reader surface should stay anchored to the higher-quality legacy experience until a future replacement is explicitly re-scoped.
  - Homepage backlog visibility should surface current priorities without turning the homepage into a project dashboard.
  - The legacy reader remains a separate app boundary and must be linked as an external app surface from the SPA instead of being treated like an in-app React Router route.
  - Ideas workflow entry should stay visible even when admin auth is missing; auth can gate execution, but not discoverability.
  - The `/book-reader` route should behave as a thin launch boundary into the legacy reader instead of maintaining a second reading experience.
  - Public typography should come from one loaded site font family instead of mixing an unloaded body font with a separate theme font.
  - Production builds must not inherit local-only backend origins such as `localhost` just because a dev convenience env file exists on one machine.
  - Public Ideas reads should fall back to a shipped static snapshot when the deployed frontend has no live `/api/ideas` backend behind it.
  - Build-time Ideas snapshot preparation must tolerate deployments where `backend/data/ideas.json` is intentionally absent from version control and should reuse the committed frontend snapshot in that case.
  - Build-time Daily Nuance preparation must also tolerate deployment hosts where the generated submodule snapshot is absent and should reuse the committed frontend snapshot instead of running the live-source pipeline by default.
  - The public site should expose both a floating agent shell and a visible `SuperHaojun` launch boundary so users can intentionally move from inline help into the richer standalone WebUI without maintaining a weaker duplicate page in the SPA.
  - Legacy sub-apps launched from the SPA must preserve an explicit return path back to the unified site even after the user has crossed the app boundary.
  - String Viewer is a lightweight static sub-app mounted at `/str-viewer/` and should stay outside the main React bundle.
  - During local dev, configured child-app proxy targets are internal upstreams and must not leak into user-visible navigation URLs; `/book-reader-legacy/` should remain same-origin so the unified dev root can keep proxy ownership.
  - Runtime launch boundaries such as `SuperHaojun` may auto-forward only when they have an explicit configured public runtime URL or a documented temporary deployment default; avoid hidden localhost/dev-target redirects that send users to a dead service.
last_updated: 2026-04-22
---

# Unified Frontend Refactor

## Goal

Refactor `personal-web` toward a single coherent public frontend that can absorb future features without adding more public app surfaces.

## Scope

In scope:

- unify the public product direction around `frontend`
- redesign `/`
- retain and refine `/ideas`
- rebuild `/daily-nuance` inside the unified frontend
- keep `/book-reader` as the stable public reading entry while launching the legacy reader
- preserve the current reader as `/book-reader-legacy/` behind that entry

Out of scope:

- building or maintaining a second in-site reader implementation
- full deep-reader parity work on a replacement reader
- long-term preservation of the old `daily-nuance` site as a public surface
- immediate removal of all legacy code

## File Structure

- `docs/superpowers/specs/2026-04-13-unified-frontend-refactor-design.md`
  - design contract for the refactor
- `docs/superpowers/plans/2026-04-13-unified-frontend-refactor.md`
  - implementation plan for the refactor
- `docs/features/unified-frontend-refactor.md`
  - living feature doc for the refactor
- `scripts/dev-all.mjs`
  - starts the unified local dev stack and proxies the frontend, backend, and legacy reader through one root URL
- `scripts/build-all.mjs`
  - builds the unified frontend first, then the legacy reader into its subpath output
- `scripts/build-frontend.mjs`
  - empties the deployment output, then builds the frontend with production-safe env overrides instead of inheriting local dev-only backend origins
- `scripts/prepare-daily-nuance-data.mjs`
  - refreshes the Daily Nuance snapshot from the submodule pipeline only when explicitly needed, otherwise reusing the committed frontend snapshot so deployment does not stall on live-source generation
- `scripts/prepare-ideas-data.mjs`
  - refreshes `frontend/public/data/ideas/latest.json` from backend working data when available, but must also reuse the committed snapshot unchanged on deployments where the backend data file is absent
- `frontend/src/App.tsx`
  - thin application bootstrap that mounts the router provider
- `frontend/src/app/layout/RootLayout.tsx`
  - app-shell layout boundary that owns the header and route outlet
- `frontend/src/app/router/router.tsx`
  - canonical SPA route registry, redirect behavior, and testable memory-router factory
- `frontend/src/core/site/routes.ts`
  - canonical route constants for the unified public surface
- `frontend/src/core/site/legacyReader.ts`
  - centralizes the canonical legacy-reader URL and app-boundary behavior for both dev and deployed environments
- `frontend/src/core/site/superhaojun.ts`
  - centralizes the standalone `SuperHaojun` route metadata, runtime WebUI URL, and launch-boundary redirect helper so the public site can hand users into the canonical external runtime surface without scattering link logic
- `frontend/src/core/site/navigation.ts`
  - shared navigation and homepage-card model for the public surface, including the canonical book-reader and `SuperHaojun` entry copy
- `frontend/src/lib/apiClient.ts`
  - centralizes frontend API base resolution and must stay safe for static production builds
- `frontend/public/data/ideas/latest.json`
  - build-time mirrored Ideas snapshot used as the public read-only fallback when static deployments have no live Ideas API
- `frontend/public/data/daily-nuance/latest.json`
  - committed Daily Nuance snapshot reused on deployment when the generated submodule snapshot is absent
- `frontend/src/index.css`
  - owns the global typography, smoothing, and page-transition baseline shared by all public routes
- `frontend/src/core/site/backlog.ts`
  - compact typed backlog mirror for homepage roadmap visibility, excluding completed or abandoned reader-rebuild work
- `frontend/src/features/home/`
  - owns the homepage hero, entry cards, backlog visibility, and summary previews for the unified front door
- `frontend/src/features/home/components/FeatureGrid.tsx`
  - renders the homepage entry cards and keeps Book Reader as one canonical entry instead of exposing duplicate new/legacy routes
- `frontend/src/features/home/components/RoadmapSection.tsx`
  - renders the concise homepage backlog module from the typed site backlog data
- `frontend/src/features/ideas/`
  - owns the idea model, API adapter, store wrapper, and feature pages
- `frontend/src/features/daily-nuance/`
  - owns the snapshot model, static-data adapter, and ranking-based nuance UI
- `frontend/src/features/daily-nuance/components/NuanceSnapshotMeta.tsx`
  - renders the compact snapshot metadata badges and owns their contrast treatment
- `frontend/src/features/book-reader/`
  - owns the public reading entry page and the visible launch boundary into the legacy reader app
- `frontend/src/features/book-reader/page/BookReaderPage.tsx`
  - forwards `/book-reader` into the canonical legacy reader and renders a manual fallback CTA if auto-navigation is blocked
- `frontend/src/features/book-reader/components/LegacyReaderTransitionCard.tsx`
  - renders the canonical launch card for the legacy reader and communicates both the launch boundary and the return path back to the main site
- `frontend/src/features/site-agent/page/SuperHaojunPage.tsx`
  - forwards `/superhaojun` into the canonical standalone WebUI and keeps a manual fallback CTA visible when automatic navigation is blocked or the runtime URL is not configured
- `frontend/src/features/ideas/page/IdeasPage.tsx`
  - owns the public workflow entry actions and decides when discovery UI is visible
- `frontend/src/components/ideas/WorkflowProgress.tsx`
  - owns the workflow run experience and must surface auth guidance when execution is gated
- `frontend/public/books/manifest.json`
  - preset shelf manifest for the new in-site reader slice
- `frontend/public/books/*.epub`
  - reader assets served directly by the unified frontend for the preset shelf
- `frontend/src/pages/Home.tsx`, `frontend/src/pages/Ideas.tsx`, `frontend/src/pages/IdeaDetail.tsx`, `frontend/src/pages/DailyNuance.tsx`, `frontend/src/pages/BookReader.tsx`
  - thin compatibility shims kept for router-facing imports while feature ownership settles
- `apps/book-reader/`
  - legacy reader implementation preserved under `/book-reader-legacy/`
- `apps/book-reader/src/App.jsx`
  - renders the legacy reader shell and keeps top-level site navigation visible whenever the reader is not in focused reading mode
- `apps/book-reader/src/components/Toolbar.jsx`
  - renders focused reader controls and must preserve a visible route back to the unified site even while reading
- `apps/daily-nuance/`
  - nuance-generation workspace retained as a data source, not as a public route

## Current Design

Phase 1 now serves one public SPA surface from `frontend`:

- `/`
- `/ideas`
- `/daily-nuance`
- `/book-reader`
- `/str-viewer/`
- `/superhaojun`

The existing reader remains available under `/book-reader-legacy/` and is still built and proxied as a separate app during the transition. String Viewer is also built and proxied as a separate app, but unlike Book Reader it is served directly at its canonical public route instead of using an SPA transition page.

Daily Nuance no longer depends on the old public Docusaurus site. Instead, the root toolchain prepares a generated snapshot and copies it into the frontend's static asset space, and the unified frontend reads that snapshot directly. The deployment-safe version of this flow must now match the Ideas snapshot behavior: when the generated submodule snapshot is absent on a build host, the committed frontend snapshot should be reused instead of silently triggering the live-source pipeline.

The root dev flow now exposes one root URL on port `3000` and internally proxies:

- the unified frontend
- the FastAPI backend
- the legacy reader app

`portal` and the old public `daily-nuance` site are no longer part of the main delivery path. The unified frontend keeps explicit ownership boundaries for app shell, route registry, home, ideas, daily nuance, and book reader.

The current refinement pass is intentionally narrower than the full migration. It focuses on the visual and information architecture of:

- the homepage hero, entrypoint block, and preview hierarchy
- the ideas page header, control band, and card presentation
- the book-reader route collapsing back to a single high-quality legacy entry
- the homepage exposing current backlog progress in a concise, scannable way

The approved direction for this pass is `Editorial Front Door`:

- keep the homepage hero atmospheric but more restrained
- make tool entrypoints faster to scan than the current card-led block
- keep homepage previews as evidence of content, not as primary navigation
- make ideas feel like a curated collection before they feel like a control panel
- keep admin and workflow actions visible but visually secondary
- keep control-band action buttons tonally integrated with the panel instead of defaulting to pure white outline buttons
- keep inactive control-band filter chips in the same subdued tone instead of mixing white pills with muted stone controls

That refinement is now implemented in the current frontend:

- the homepage hero stays atmospheric but no longer tries to explain every tool
- the homepage entrypoint block is faster to scan and uses simpler directory-style entries
- the homepage now includes a compact roadmap section backed by a typed backlog mirror instead of markdown parsing at runtime
- homepage previews are framed as evidence of live content rather than primary navigation
- the unified frontend must now acknowledge `SuperHaojun` as a first-class destination instead of leaving the richer runtime-oriented surface hidden behind the floating shell
- `/superhaojun` should behave like `/book-reader`: a thin launch boundary into the higher-quality standalone surface rather than a second explanatory app inside the SPA
- the ideas page now opens as a curated collection with a secondary control band
- idea cards emphasize why an idea matters before exposing workflow actions
- `/book-reader` now acts as a thin launch boundary into the legacy reader, which is again the canonical public reading experience
- the homepage no longer exposes a duplicate Legacy Reader card because Book Reader itself already resolves to the canonical legacy surface
- the canonical Book Reader flow must stay bidirectional, so the legacy reader itself needs a visible route back to the unified site after the user crosses the app boundary
- the reader backlog mirror no longer advertises a rebuild that is no longer on the active delivery path
- the stabilization follow-up is now implemented:
  - legacy-reader links are rendered as external app boundaries instead of SPA-internal routes
  - Daily Nuance snapshot badges now use explicit high-contrast treatment
  - Ideas always exposes the daily-update workflow entry and shows auth guidance when admin access is missing

Residual risk remains intentionally limited to:

- the legacy reader still being a separate app and build chain
- temporary page-level compatibility shims in `frontend/src/pages/`
- homepage preview panels for ideas and nuance still depending on backend/runtime availability outside this slice
- local dev legacy-reader access still depending on correct app-boundary handling between the SPA and the separate legacy app
- production behavior of backend-driven ideas surfaces still depending on whether a real `/api/*` backend is deployed behind the static frontend
- public Ideas reads now expected to degrade to a mirrored static snapshot on pure static deployments, while write and workflow operations still require a live backend
- the standalone `SuperHaojun` WebUI still depending on separate runtime configuration and hosting even though the unified site now treats it as the canonical public runtime surface

## Change Notes

- 2026-04-13: Captured the approved unified-frontend refactor direction as a living feature doc.
- 2026-04-13: Added the implementation plan for the unified frontend refactor.
- 2026-04-13: Started implementation and recorded the intended new app and feature boundaries before code changes.
- 2026-04-13: Integrated the unified frontend shell, home surface, Daily Nuance page, and Book Reader transition shell into `frontend`.
- 2026-04-13: Verified focused frontend tests, frontend production build, and root Node test suite after the first integration pass.
- 2026-04-13: Verified the unified dev stack with Playwright against `/`, `/ideas`, `/daily-nuance`, `/book-reader`, and `/book-reader-legacy/` after starting the root `npm run dev` flow.
- 2026-04-22: Added String Viewer as a lightweight static sub-app at `/str-viewer/`, with root build/dev proxy wiring and external app-boundary navigation from the SPA.
- 2026-04-13: Added a router contract test, removed the dead `pages/Reader.tsx` surface, and completed full root/frontend test and build verification for Phase 1.
- 2026-04-14: Started the `Editorial Front Door` refinement pass for the homepage and ideas surfaces, with brand-led hierarchy on home and curated-first presentation on ideas.
- 2026-04-14: Completed the home and ideas refinement pass, verified focused and full frontend suites, reran root tests/build, and confirmed the new home and ideas copy with Playwright.
- 2026-04-14: Started a follow-up refinement to keep the Ideas `Manage the collection` action buttons visually subordinate to the control band instead of reading as stark white pills.
- 2026-04-14: Completed the Ideas control-band button refinement, verified the updated button treatment with a focused test, frontend build, and browser-based style inspection.
- 2026-04-14: Started a second follow-up to remove the remaining pure-white inactive filter chips from the Ideas control band after browser auditing confirmed the actions had been fixed but the filter groups had not.
- 2026-04-14: Completed the Ideas control-band follow-up by applying one shared subdued secondary-control style to both action buttons and inactive filter chips, then re-verified with frontend tests, build, and browser auditing.
- 2026-04-14: Started the next reader phase to replace the `/book-reader` transition shell with a true in-site EPUB vertical slice and add a concise backlog-visibility section to the homepage.
- 2026-04-14: Completed the first in-site reader slice with a preset EPUB shelf, local reader settings/progress persistence, TOC navigation, homepage backlog visibility, focused/full frontend verification, and browser verification of both `/` and `/book-reader`.
- 2026-04-14: Started a stabilization follow-up after browser verification exposed three concrete gaps: legacy-reader entrypoints still behaved like SPA routes, Daily Nuance snapshot meta badges had weak contrast, and the Ideas workflow trigger stayed hidden unless an admin session already existed.
- 2026-04-14: Completed the stabilization follow-up by turning legacy-reader entrypoints into explicit external-app links, moving the active reader workspace ahead of the shelf, improving Daily Nuance meta badge contrast, and exposing the Ideas daily-update CTA with auth guidance plus verified admin-mode workflow access.
- 2026-04-15: Collapsed the public reading surface back to a legacy-only flow so `/book-reader` becomes a thin launch boundary into the higher-quality incumbent reader and the homepage/backlog stop advertising a second reader path.
- 2026-04-15: Verified the legacy-only reader simplification with focused/frontend-wide test runs, a fresh frontend build, and browser validation that `/book-reader` redirects into the legacy app while the homepage no longer exposes duplicate reader entrypoints.
- 2026-04-15: Started a deployment-hardening follow-up covering three concrete concerns before the next upload: global font clarity, explicit return navigation from Skill Marketplace detail pages, and production-safe frontend build behavior that does not inherit local-only backend origins.
- 2026-04-15: Extended the deployment-hardening follow-up after static verification showed `/api/ideas` calls collapsing into SPA HTML on pure static hosting; the public Ideas surface now needs a build-time snapshot fallback instead of assuming a live backend.
- 2026-04-15: Completed the deployment-hardening follow-up by unifying site typography around the loaded Geist family, removing the page-enter text shift, adding a build-time Ideas snapshot mirror plus frontend read fallback for pure static hosting, and keeping the legacy reader route safe behind the Vercel passthrough rewrite.
- 2026-04-15: Started a Vercel build-failure follow-up after production logs showed `prepare-ideas-data.mjs` still hard-required the gitignored backend seed file instead of reusing the committed frontend Ideas snapshot.
- 2026-04-15: Completed the Vercel build-failure follow-up by teaching `prepare-ideas-data.mjs` to refresh from backend working data when present but reuse the committed frontend Ideas snapshot when the gitignored source file is absent on deployment.
- 2026-04-19: Started a deployment and navigation hardening follow-up after ECS rollout exposed three concrete gaps: Daily Nuance prepare still falls back to a live pipeline when the generated submodule snapshot is absent, the unified frontend hides the richer `SuperHaojun` surface behind the floating shell, and the legacy reader lacks an explicit return path back to the main site.
- 2026-04-19: Completed the deployment and navigation hardening follow-up by teaching Daily Nuance prepare to reuse the committed frontend snapshot on deployment, adding `/superhaojun` as a visible larger-surface agent route, and restoring an explicit return-to-site control inside the legacy reader toolbar.
- 2026-04-19: Re-scoped `/superhaojun` into a thin launch boundary that jumps from the Vercel-served public site into the polished standalone WebUI running on the runtime host, replacing the weaker in-site explanatory page.
- 2026-04-22: Started browser-driven full-surface smoke testing after `/book-reader` was observed leaking the internal legacy-reader dev target instead of staying on the same-origin `/book-reader-legacy/` proxy path.
- 2026-04-22: Extended the smoke-test follow-up after `/superhaojun` auto-forwarded to an unstarted default dev runtime, producing a browser error page instead of the in-site floating-shell fallback.
- 2026-04-22: Completed the browser-driven smoke follow-up by keeping local Book Reader navigation on the same-origin legacy proxy, keeping SuperHaojun on the in-site fallback unless an explicit standalone runtime is configured, and verifying Home, Ideas, Daily Nuance, Skill Marketplace, Book Reader, String Viewer, SuperHaojun, and Settings in a real browser.
- 2026-04-22: Started PR-readiness cleanup after full frontend lint exposed pre-existing fast-refresh and EPUB reader typing violations that would block a clean merge gate.
- 2026-04-22: Completed PR-readiness cleanup by moving button variant styling out of the component export file and tightening the EPUB reader slice onto typed `epubjs` boundaries so full frontend lint can pass.
- 2026-04-22: Updated the `SuperHaojun` launch-boundary rule for the temporary Vercel-to-Aliyun bridge: the committed public ECS URL is now treated as the documented default, while env overrides remain the path for future domain or port changes.
