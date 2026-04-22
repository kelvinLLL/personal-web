---
status: implemented
entrypoints:
  - apps/str-viewer/
  - scripts/lib/site-config.mjs
  - scripts/lib/dev-ports.mjs
  - scripts/dev-all.mjs
  - scripts/build-all.mjs
  - scripts/build-str-viewer.mjs
  - frontend/src/core/site/routes.ts
  - frontend/src/core/site/navigation.ts
  - frontend/src/components/layout/SiteHeader.tsx
  - frontend/src/features/home/components/FeatureGrid.tsx
  - vercel.json
  - .gitignore
  - tests/site-config.test.mjs
  - tests/devPorts.test.mjs
  - frontend/src/app/router/__tests__/router.test.tsx
  - frontend/src/components/layout/__tests__/Navbar.test.tsx
  - frontend/src/features/home/__tests__/HomePage.test.tsx
hard_constraints:
  - Follow docs/development-rules.md.
  - Keep String Viewer as a separate static app boundary mounted at /str-viewer/.
  - Do not merge the String Viewer UI into the main React bundle for this slice.
  - Vendor only maintainable source and build files; do not vendor node_modules, dist, or TypeScript build cache.
design_notes:
  - String Viewer is a small Vite/TypeScript tool with no runtime dependencies.
  - The root site owns build, dev proxy, navigation, and deployment wiring.
  - The String Viewer app owns its formatter logic, DOM UI, styles, and focused tests.
  - The homepage and header should treat /str-viewer/ as an external app boundary even though it is same-origin.
last_updated: 2026-04-22
---

# String Viewer Integration

## Goal

Expose the existing String Viewer tool as a lightweight static sub-app at `/str-viewer/` while keeping the unified React frontend bundle small and preserving a maintainable source boundary under `apps/str-viewer/`.

## Scope

In scope:

- vendor the String Viewer source app into `apps/str-viewer/`
- build and copy it into `dist/str-viewer`
- proxy `/str-viewer/` during unified local development
- add a public navigation and homepage entrypoint that launches it as an external app boundary
- keep focused tests for formatter logic, root build/dev wiring, and navigation exposure

Out of scope:

- rewriting String Viewer as React
- adding backend APIs, auth, persistence, or database state
- changing String Viewer behavior beyond subpath-safe asset routing
- depending on the original absolute source path after vendoring

## File Structure

- `apps/str-viewer/`
  - owns the standalone Vite/TypeScript String Viewer app, including formatter logic, DOM UI, CSS, tests, and package metadata
- `scripts/build-str-viewer.mjs`
  - installs, builds, and copies the standalone app into the root deploy output under `dist/str-viewer`
- `scripts/lib/site-config.mjs`
  - owns the canonical `/str-viewer/` base path, app directory, dev port, build env, and output layout entry
- `scripts/lib/dev-ports.mjs`
  - routes unified local dev requests for `/str-viewer/` to the standalone app dev server
- `scripts/dev-all.mjs`
  - starts the standalone String Viewer dev server alongside the existing unified frontend, backend, and legacy reader services
- `scripts/build-all.mjs`
  - includes the standalone String Viewer production build after the unified frontend build
- `frontend/src/core/site/routes.ts`
  - exposes the canonical same-origin static route constant
- `frontend/src/core/site/navigation.ts`
  - adds String Viewer to public navigation and homepage feature cards as an external app boundary
- `frontend/src/components/layout/SiteHeader.tsx`
  - renders both internal `NavLink` items and external app-boundary anchors
- `frontend/src/features/home/components/FeatureGrid.tsx`
  - renders the String Viewer card with external app-boundary semantics
- `vercel.json`
  - preserves the static sub-app passthrough before the SPA fallback rewrite
- `.gitignore`
  - keeps generated dependency folders, production output, TypeScript build cache, and generated design-reference artifacts out of the vendored source boundary

## Current Design

String Viewer follows the same delivery pattern as the legacy Book Reader where it matters: the root site knows how to build, proxy, and link to the sub-app, while the sub-app remains independently built and tested.

Unlike Book Reader, String Viewer does not need a React transition page. `/str-viewer/` is the canonical public route and serves the static app directly. The SPA links to it with normal anchor navigation and `data-app-boundary="external"` so the same-origin path does not get mistaken for an internal React Router route.

The standalone app uses `VITE_BASE_PATH=/str-viewer/` for production builds so generated JS and CSS asset URLs resolve correctly from the subpath. Unified local development starts the standalone Vite server with the same base path and proxies `/str-viewer/` through the root dev URL.

## Change Notes

- 2026-04-22: Created the feature doc before code changes and recorded the static sub-app integration boundary.
- 2026-04-22: Vendored the standalone app, wired root build/dev/deploy routing, exposed String Viewer in the public navigation and homepage, and verified the unified `/str-viewer/` flow.
- 2026-04-22: Started a functionality and integration QA follow-up after browser testing confirmed the formatter surface works but local builds exposed an unignored TypeScript build cache file.
- 2026-04-22: Completed the QA follow-up by verifying sample, clear, formatter, copy feedback, desktop/mobile layout, main-site navigation, focused tests, build, and by ignoring generated cache/reference output.
