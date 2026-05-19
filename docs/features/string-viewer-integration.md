---
status: implemented
entrypoints:
  - apps/str-viewer/
  - apps/str-viewer/src/main.ts
  - apps/str-viewer/src/stringFormatter.ts
  - apps/str-viewer/src/styles.css
  - apps/str-viewer/tests/stringFormatter.test.ts
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
last_updated: 2026-05-19
---

# String Viewer Integration

## Goal

Expose the existing String Viewer tool as a lightweight static sub-app at `/str-viewer/` while keeping the unified React frontend bundle small, while also making the reading surface visually clearer and the formatter more reliable around nested escapes and repeated newlines.

## Scope

In scope:

- vendor the String Viewer source app into `apps/str-viewer/`
- build and copy it into `dist/str-viewer`
- proxy `/str-viewer/` during unified local development
- add a public navigation and homepage entrypoint that launches it as an external app boundary
- keep focused tests for formatter logic, root build/dev wiring, and navigation exposure
- refine the String Viewer typography, spacing, and surface contrast so raw input and formatted output are easier to scan
- improve formatter handling for nested escape sequences, repeated newlines, and mixed newline encodings without using `eval`
- add a lightweight output mode switch so users can compare the raw source, decoded readable text, and JSON string-field expansions without losing context

Out of scope:

- rewriting String Viewer as React
- adding backend APIs, auth, persistence, or database state
- changing String Viewer behavior beyond subpath-safe asset routing
- depending on the original absolute source path after vendoring

## File Structure

- `apps/str-viewer/`
  - owns the standalone Vite/TypeScript String Viewer app, including formatter logic, DOM UI, CSS, tests, and package metadata
- `apps/str-viewer/src/main.ts`
  - renders the standalone DOM UI, sample/clear/copy actions, output mode switching, and view-state-specific presentation such as empty or formatted output
- `apps/str-viewer/src/stringFormatter.ts`
  - owns string decoding, newline normalization, JSON string-field extraction, display-mode text generation, notice generation, and line/stat derivation for escaped-text inspection
- `apps/str-viewer/src/styles.css`
  - owns the standalone visual system for the String Viewer surface, including font stacks, contrast, layout rhythm, and responsive behavior
- `apps/str-viewer/tests/stringFormatter.test.ts`
  - verifies formatter behavior for common escapes, multi-layer escapes, and repeated newline handling
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

The current refinement pass keeps the standalone boundary intact and focuses inside the app:

- move the visual language closer to a high-contrast editor surface, with clearer system/mono font stacks and calmer dark backgrounds
- make empty state, line numbers, notices, and stats easier to read at a glance
- avoid leaving partially decoded `\\n`, `\\r`, or similar escape tokens behind when the source has been encoded in multiple layers
- preserve intentional blank lines in the formatted output while normalizing mixed newline encodings into one consistent line model
- when the source is a JSON object or array, surface nested escaped string fields as readable follow-up blocks so important payload text is not trapped behind `\\n` sequences
- expose three output modes:
  - `Raw`: exact source text, normalized only for line ending display
  - `Readable`: the primary decoded or pretty-printed view
  - `JSON Fields`: path-based decoded blocks for nested JSON string fields, with an explicit empty state when no such fields exist

This pass is now implemented in the standalone app:

- the surface uses a darker editor-like palette with clearer UI and mono font stacks, stronger contrast, and steadier panel hierarchy
- the input now exposes a clearer placeholder and the output shows a dedicated empty state when no source has been provided
- stats now include explicit blank-line count so repeated newlines are easier to spot
- JSON-string decoding now continues through bounded follow-up escape passes, so nested `\\n`, `\\r`, unicode escapes, and repeated encoded newlines resolve into the readable line model
- formatted JSON objects still keep their pretty-printed structure, but escaped string fields can be surfaced again as readable path-based follow-up blocks when that makes the important text clearer

The next refinement keeps this formatter behavior but separates the presentation into explicit output modes. The mode switch should be implemented as an accessible segmented control in the output header, update line/stat rendering for the active view, and make copy operate on the currently selected output mode.

This output-mode refinement is now implemented:

- the output header includes a segmented control for `Raw`, `Readable`, and `JSON Fields`
- stats, line rendering, empty states, and copy behavior all follow the active output mode
- `Readable` keeps the primary decoded or pretty-printed representation, while `JSON Fields` isolates path-based nested string expansions
- the formatter exposes mode-specific text, lines, and stats so the DOM UI does not duplicate parsing logic

## Change Notes

- 2026-04-22: Created the feature doc before code changes and recorded the static sub-app integration boundary.
- 2026-04-22: Vendored the standalone app, wired root build/dev/deploy routing, exposed String Viewer in the public navigation and homepage, and verified the unified `/str-viewer/` flow.
- 2026-04-22: Started a functionality and integration QA follow-up after browser testing confirmed the formatter surface works but local builds exposed an unignored TypeScript build cache file.
- 2026-04-22: Completed the QA follow-up by verifying sample, clear, formatter, copy feedback, desktop/mobile layout, main-site navigation, focused tests, build, and by ignoring generated cache/reference output.
- 2026-05-19: Started a clarity and formatter-robustness pass focused on typography, contrast, nested escape decoding, and repeated newline handling.
- 2026-05-19: Shipped the clarity pass with a darker editor-style visual system, explicit blank-line stats, a dedicated empty state, bounded multi-layer escape unfolding, refreshed formatter tests, and successful browser plus build verification.
- 2026-05-19: Browser regression samples exposed that pretty-printed JSON still hid newline-heavy payload strings behind escape sequences, and this follow-up shipped path-based readable blocks for nested JSON string fields while keeping the pretty JSON structure visible.
- 2026-05-19: Shipped an output-mode refinement that lets users switch among Raw, Readable, and JSON Fields views, with mode-aware stats, empty states, and copy behavior.
