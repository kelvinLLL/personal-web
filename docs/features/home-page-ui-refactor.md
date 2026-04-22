---
status: implemented
entrypoints:
  - README.md
  - frontend/src/core/site/deployment.ts
  - frontend/src/features/home/page/HomePage.tsx
  - frontend/src/features/home/components/HomeHero.tsx
  - frontend/src/features/home/components/FeatureGrid.tsx
  - frontend/src/features/home/components/RoadmapSection.tsx
  - frontend/src/features/home/components/IdeasPreview.tsx
  - frontend/src/features/home/components/NuancePreview.tsx
  - frontend/src/components/layout/SiteHeader.tsx
  - frontend/src/index.css
  - frontend/src/features/home/__tests__/HomePage.test.tsx
hard_constraints:
  - Follow docs/development-rules.md.
  - Keep the homepage owned by frontend/src/features/home.
  - Preserve the existing route and app-boundary behavior for Ideas, Daily Nuance, Skill Marketplace, Book Reader, String Viewer, and SuperHaojun.
  - Keep tappable controls at least 44px high where the homepage introduces new interactive surfaces.
design_notes:
  - Use the ui-ux-pro-max portfolio/personal design system direction: monochrome foundation, blue accent, strong text contrast, and restrained motion.
  - Treat the homepage as an editorial command center, not a generic marketing landing page or a dense dashboard.
  - Use Lucide icons for structural visual cues instead of emoji or text-only affordances.
  - Prefer full-width bands and unframed layouts over nested card stacks; cards are acceptable for repeated entries and preview items.
  - Motion should be short, purposeful, and disabled under prefers-reduced-motion.
  - Do not rely on automatic `prefers-color-scheme` dark variables unless every affected surface has matching dark-mode text and surface treatments.
  - Temporary infrastructure handoffs from the homepage must be explicit external CTAs, not hidden automatic redirects.
last_updated: 2026-04-23
---

# Home Page UI Refactor

## Goal

Make the public homepage feel more polished, intentional, and immediately scannable while keeping it useful as the front door to the unified personal-web surfaces.

## Scope

In scope:

- refactor the homepage hero hierarchy and calls to action
- improve the homepage entrypoint grid with clearer visual rhythm, icons, and touch targets
- refine backlog and preview sections so they read as supporting evidence instead of competing dashboards
- tune global homepage-facing tokens and motion safeguards if needed
- update focused homepage tests to match the new UI copy and structure

Out of scope:

- changing route contracts or adding new product destinations
- changing Ideas, Daily Nuance, Book Reader, Skill Marketplace, or SuperHaojun feature behavior
- replacing the current site font package or adding remote font dependencies
- introducing a new design system library

## File Structure

- `frontend/src/features/home/page/HomePage.tsx`
  - owns the homepage section order and page-level spacing
- `frontend/src/core/site/deployment.ts`
  - owns temporary deployment handoff URLs used by homepage CTAs, including the Aliyun public service link
- `frontend/src/features/home/components/HomeHero.tsx`
  - owns the first-viewport brand signal, primary CTAs, and compact status cues
- `README.md`
  - documents how to update the Aliyun service that the homepage public-IP CTA points to
- `frontend/src/features/home/components/FeatureGrid.tsx`
  - renders the repeated product entrypoints and must preserve external app-boundary semantics
- `frontend/src/features/home/components/RoadmapSection.tsx`
  - renders the compact active-backlog module from typed site backlog data
- `frontend/src/features/home/components/IdeasPreview.tsx`
  - renders a concise Ideas evidence panel from the Ideas store
- `frontend/src/features/home/components/NuancePreview.tsx`
  - renders a concise Daily Nuance evidence panel from the static snapshot loader
- `frontend/src/components/layout/SiteHeader.tsx`
  - owns top-level navigation and may need responsive polish if homepage changes expose header density issues
- `frontend/src/index.css`
  - owns global typography, theme tokens, and reduced-motion behavior
- `frontend/src/features/home/__tests__/HomePage.test.tsx`
  - verifies the homepage still exposes the expected public entrypoints and preview content

## Current Design

The current homepage is already organized around a hero, tool entrypoints, active backlog, and editorial previews. It works structurally, but the visual system still leans on repeated rounded cards, wide letter-spaced labels, and similar section treatments. The result is calm but slightly generic: the hero talks about the site more than it acts as a confident product front door, and the entrypoint section needs stronger scanning cues.

The refactor will keep the approved `Editorial Front Door` direction from `docs/features/unified-frontend-refactor.md` while making it feel more finished:

- brand signal first, with clear actions and concise operational context
- entrypoints as fast-scan product surfaces with icon cues and stable hover/focus states
- previews as evidence modules rather than another navigation layer
- monochrome base, accessible blue accent, no decorative emoji, no horizontal-scroll risk
- short hover/entrance transitions only, with a reduced-motion fallback

The implemented version now uses the existing hero bitmap as the first-viewport visual asset, Lucide icons for structural cues, 8px card radii for repeated UI surfaces, loading skeletons for homepage previews, and a responsive header that wraps links on narrow screens. The global automatic dark color media query was removed because the site did not have matching dark-mode component classes, which made light-theme homepage headings unreadable in dark-preference browsers.

The homepage feature grid now includes String Viewer as a same-origin external app boundary from the separate String Viewer integration feature.

The homepage Hero now includes a temporary `Open Aliyun Service` external CTA. This keeps the Vercel-hosted static domain intact while giving users a deliberate way to jump into the full ECS-hosted service at the public IP. The button is intentionally a manual app-boundary handoff rather than an automatic redirect, because the Aliyun deployment is still being stabilized before any domain cutover.

## Change Notes

- 2026-04-22: Created the narrow homepage UI refactor doc before code changes and recorded the ui-ux-pro-max design direction.
- 2026-04-22: Implemented the homepage visual refactor, updated focused tests, added reduced-motion safeguards, and verified desktop plus 375px mobile rendering with no horizontal overflow.
- 2026-04-22: Surfaced String Viewer in the homepage entry grid as an external app-boundary card owned by the String Viewer integration slice.
- 2026-04-23: Added a temporary Hero CTA from the Vercel-static homepage to the Aliyun public-IP service and documented the ECS update flow in the root README.
