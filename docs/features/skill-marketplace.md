status: implemented
entrypoints:
  - docs/features/skill-marketplace.md
  - docs/superpowers/specs/2026-04-15-skill-marketplace-design.md
  - docs/superpowers/plans/2026-04-15-skill-marketplace.md
  - frontend/src/core/site/routes.ts
  - frontend/src/core/site/navigation.ts
  - frontend/src/core/site/backlog.ts
  - frontend/src/app/router/router.tsx
  - frontend/src/pages/SkillMarketplace.tsx
  - frontend/src/pages/SkillMarketplaceDetail.tsx
  - frontend/src/features/skill-marketplace/page/SkillMarketplacePage.tsx
  - frontend/src/features/skill-marketplace/page/SkillMarketplaceDetailPage.tsx
  - frontend/src/features/skill-marketplace/components/MarketplaceHero.tsx
  - frontend/src/features/skill-marketplace/components/MarketplaceSection.tsx
  - frontend/src/features/skill-marketplace/components/MarketplaceFilters.tsx
  - frontend/src/features/skill-marketplace/components/MarketplaceCard.tsx
  - frontend/src/features/skill-marketplace/components/MarketplaceFeaturedRow.tsx
  - frontend/src/features/skill-marketplace/components/MarketplaceGlossary.tsx
  - frontend/src/features/skill-marketplace/components/MarketplaceSignalList.tsx
  - frontend/src/features/skill-marketplace/components/MarketplaceEmptyState.tsx
  - frontend/src/features/skill-marketplace/model/marketplace.ts
  - frontend/src/features/skill-marketplace/data/personalCatalog.ts
  - frontend/src/features/skill-marketplace/data/communityCatalog.ts
  - frontend/src/features/skill-marketplace/data/categories.ts
  - frontend/src/features/skill-marketplace/lib/filters.ts
  - frontend/src/features/skill-marketplace/lib/lookup.ts
  - frontend/src/features/skill-marketplace/__tests__/SkillMarketplacePage.test.tsx
  - frontend/src/features/skill-marketplace/__tests__/SkillMarketplaceDetailPage.test.tsx
hard_constraints:
  - Keep personal entries and curated community entries as separate stable catalogs instead of mixing them into one undifferentiated list.
  - Treat the first release as a directory-first browsing surface, not as an install-first operator console.
  - Expose artifact type and ecosystem compatibility explicitly for each listing.
  - Mirror marketplace data into typed frontend modules instead of parsing markdown at runtime for primary rendering.
  - Keep quality signals different for personal entries and community entries instead of forcing one universal metric model.
  - Keep the marketplace feature slice self-contained so routing, data, filters, and presentation do not collapse into a single oversized page file.
  - Ship shareable detail pages for both personal and community entries in the first release.
design_notes:
  - The feature should borrow the directory grammar of claudemarketplaces.com without copying its visual language directly.
  - The marketplace should feel like part of the current editorial front door, not like a separate SaaS storefront.
  - My Skills is the primary shelf; Curated Community is a clearly separated secondary shelf.
  - The first release should optimize for discovery, comparison, and understanding before any installation workflow exists.
  - Category chips, concise summaries, and quality signals should make the page fast to scan without turning it into a dashboard.
  - A glossary layer is useful because the catalog may eventually contain multiple artifact types such as skills, plugins, MCP surfaces, or agents.
  - Homepage integration should advertise one marketplace surface, while the actual browse and detail experience lives fully on marketplace routes.
  - The data layer should start with a small hand-curated typed catalog so future doc sync or API migration stays possible.
  - Shareable detail pages still need an explicit visible return action so users do not depend on browser chrome to recover context.
last_updated: 2026-04-15
---

# Skill Marketplace

## Goal

Create a dedicated marketplace surface for personal skills and curated community tools that makes them easy to discover, compare, and understand inside the unified frontend.

Success means the feature reads as a clear directory rather than a generic landing page, keeps personal and community catalogs distinct, and fits the current product's calm editorial UI language.

## Scope

In scope:

- define the first-release information architecture for the marketplace
- add one public route for the marketplace inside the unified frontend
- separate `My Skills` and `Curated Community` as distinct catalog sections
- support directory-style scanning through categories, artifact types, and compatibility signals
- design a details surface that explains what each entry is, why it matters, and when to use it
- capture marketplace-specific metadata and curation rules

Out of scope:

- real installation, enablement, or package-management workflows
- user submissions, comments, ratings, or voting
- automatic ingestion from third-party registries
- mixing personal and community entries into one unified undifferentiated feed
- turning the marketplace into a workflow-heavy operator panel

## File Structure

- `docs/features/skill-marketplace.md`
  - living feature doc for local constraints, design decisions, and implementation updates
- `docs/superpowers/specs/2026-04-15-skill-marketplace-design.md`
  - fuller design spec for the marketplace before implementation begins
- `frontend/src/core/site/routes.ts`
  - canonical route registration for the marketplace index route
- `frontend/src/core/site/navigation.ts`
  - navigation and homepage entry model for exposing the marketplace as a first-class surface
- `frontend/src/core/site/backlog.ts`
  - typed homepage backlog mirror that reflects whether the marketplace is still a future bet or already shipped
- `frontend/src/app/router/router.tsx`
  - SPA route registration for the marketplace index and detail pages
- `frontend/src/pages/SkillMarketplace.tsx`
  - lazy page wrapper for the marketplace index route
- `frontend/src/pages/SkillMarketplaceDetail.tsx`
  - lazy page wrapper for shareable marketplace detail routes
- `frontend/src/features/skill-marketplace/model/marketplace.ts`
  - type contracts for entries, categories, artifact types, compatibility, and quality signals
- `frontend/src/features/skill-marketplace/data/personalCatalog.ts`
  - typed source of truth for personal marketplace entries and editorial ordering
- `frontend/src/features/skill-marketplace/data/communityCatalog.ts`
  - typed source of truth for curated community entries and trust framing
- `frontend/src/features/skill-marketplace/data/categories.ts`
  - shared filter taxonomy and chip metadata for categories, artifact types, and compatibility
- `frontend/src/features/skill-marketplace/lib/filters.ts`
  - marketplace filtering helpers kept outside the page component
- `frontend/src/features/skill-marketplace/lib/lookup.ts`
  - detail lookup helpers, related-entry selection, and route-aware catalog reads
- `frontend/src/features/skill-marketplace/page/SkillMarketplacePage.tsx`
  - route-level composition for hero, filters, split catalogs, and glossary
- `frontend/src/features/skill-marketplace/page/SkillMarketplaceDetailPage.tsx`
  - route-level composition for personal and community detail views
- `frontend/src/features/skill-marketplace/components/MarketplaceHero.tsx`
  - top-of-page framing, counts, and introductory positioning
- `frontend/src/features/skill-marketplace/components/MarketplaceFilters.tsx`
  - category and type filters that support fast scanning without becoming an operator control band
- `frontend/src/features/skill-marketplace/components/MarketplaceSection.tsx`
  - section shell for `My Skills` and `Curated Community`
- `frontend/src/features/skill-marketplace/components/MarketplaceCard.tsx`
  - reusable listing card for directory entries with concise signals and links
- `frontend/src/features/skill-marketplace/components/MarketplaceFeaturedRow.tsx`
  - denser featured-entry row so the primary catalog can surface current or high-value picks above the grid
- `frontend/src/features/skill-marketplace/components/MarketplaceGlossary.tsx`
  - compact explanation of artifact types and curation logic
- `frontend/src/features/skill-marketplace/components/MarketplaceSignalList.tsx`
  - small reusable signal renderer that keeps personal and community detail panels legible
- `frontend/src/features/skill-marketplace/components/MarketplaceEmptyState.tsx`
  - fallback state for filters that return no matching entries
- `frontend/src/features/skill-marketplace/__tests__/SkillMarketplacePage.test.tsx`
  - page-level contract tests for hero counts, split sections, and quick-browse filtering
- `frontend/src/features/skill-marketplace/__tests__/SkillMarketplaceDetailPage.test.tsx`
  - page-level contract tests for shareable detail structure and signal rendering

## Current Design

- this should behave like a directory-style marketplace rather than an install-first store
- the most relevant structural reference is `claudemarketplaces.com`
- the final UI should still inherit the visual language of the current personal-web frontend
- the first release should separate `My Skills` from `Curated Community`
- the personal shelf remains the primary identity of the feature
- the recommended public route is `/skill-marketplace`
- detail pages should be shareable from the start:
  - `/skill-marketplace/personal/:slug`
  - `/skill-marketplace/community/:slug`
- the page structure should use five layers:
  - `Hero`
  - `Quick Browse`
  - `My Skills`
  - `Curated Community`
  - `Glossary / FAQ`
- first-release artifact types are:
  - `skill`
  - `plugin`
- the metadata model should leave room for later artifact types such as:
  - `mcp`
  - `agent`
  - `command`
- personal and community entries require different quality-signal models instead of one shared popularity-oriented metric set
- personal detail pages should be the place where constraints, insights, reuse context, and workflow purpose become visible without bloating the list view
- the first implementation pass will mirror a hand-curated typed catalog into frontend modules instead of reading markdown at runtime
- the shipped seed data currently uses three personal entries and three curated community entries so the page can demonstrate both artifact types and both signal models without needing runtime data fetching
- the page should own lightweight browse-state locally and derive filtered lists through feature-level helpers
- homepage integration should consist of one public entry card plus navigation support; deeper controls stay inside the marketplace route
- homepage backlog state now marks `Skill Marketplace` as `in_progress` while the first release is being integrated, instead of leaving it as a purely future item
- shareable detail pages should sit under the marketplace base route so the owner boundary is visible in the URL itself
- detail pages should expose a visible return action near the top of the page, even when the URL is opened directly in a fresh tab

The fuller design now lives in `docs/superpowers/specs/2026-04-15-skill-marketplace-design.md`.

## Change Notes

- 2026-04-15: Created the living feature doc and captured the initial approved direction: directory-first marketplace, split personal/community catalogs, and claudemarketplaces.com as the primary structural reference.
- 2026-04-15: Wrote the first full design spec with recommended route naming, split-catalog information architecture, listing metadata, quality-signal model, detail-page structure, and typed-data frontend boundaries.
- 2026-04-15: Updated the feature doc for implementation start, expanding the planned entrypoints to include route wrappers, split data modules, detail pages, filtering helpers, and feature-level tests.
- 2026-04-15: Implemented the first release in the unified frontend with typed personal/community catalogs, quick-browse filters, shareable detail pages, navigation wiring, homepage entry exposure, and route/home/detail tests.
- 2026-04-15: Started a polish follow-up to add a stable visible return action on detail pages so shareable URLs do not strand the user away from the marketplace index.
- 2026-04-15: Completed the detail-page polish follow-up by adding a visible top-level return action on shipped detail routes and re-verifying the route contract in frontend tests plus static-browser checks.
