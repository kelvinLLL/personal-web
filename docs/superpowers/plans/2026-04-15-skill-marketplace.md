# Skill Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first public `Skill Marketplace` release as a directory-first surface with split personal/community catalogs, quick-browse filters, and shareable detail pages.

**Architecture:** Keep all marketplace behavior inside a dedicated frontend feature slice. Mirror the catalog into typed data modules, derive browse and detail views through small helper functions, and integrate the surface into the existing public navigation and homepage entry model without turning the homepage into a secondary marketplace.

**Tech Stack:** React 19, React Router 7, TypeScript, Tailwind CSS 4, Vitest, Testing Library

---

### Task 1: Lock The Marketplace Contract With Failing Tests

**Files:**
- Create: `frontend/src/features/skill-marketplace/__tests__/SkillMarketplacePage.test.tsx`
- Create: `frontend/src/features/skill-marketplace/__tests__/SkillMarketplaceDetailPage.test.tsx`
- Modify: `frontend/src/app/router/__tests__/router.test.tsx`
- Modify: `frontend/src/components/layout/__tests__/Navbar.test.tsx`
- Modify: `frontend/src/features/home/__tests__/HomePage.test.tsx`

- [ ] **Step 1: Add route and navigation expectations**

Assert:
- `/skill-marketplace` resolves inside the SPA
- `/skill-marketplace/personal/:slug` resolves inside the SPA
- the navbar exposes `Skill Marketplace`
- the homepage feature grid exposes a single marketplace entry

- [ ] **Step 2: Add page-level expectations for the marketplace index**

Cover:
- hero title and marketplace positioning copy
- separate `My Skills` and `Curated Community` sections
- quick-browse chips for categories, artifact types, and compatibility
- featured content and full-grid content both render

- [ ] **Step 3: Add page-level expectations for the detail surface**

Cover:
- personal detail pages show constraints, insights, and workflow usage context
- community detail pages show curation reason, trust level, and ecosystem framing
- missing slugs fall back to a readable empty state instead of crashing

- [ ] **Step 4: Run targeted frontend tests and confirm failure**

Run: `npm --prefix frontend run test -- --run frontend/src/app/router/__tests__/router.test.tsx frontend/src/components/layout/__tests__/Navbar.test.tsx frontend/src/features/home/__tests__/HomePage.test.tsx frontend/src/features/skill-marketplace/__tests__/SkillMarketplacePage.test.tsx frontend/src/features/skill-marketplace/__tests__/SkillMarketplaceDetailPage.test.tsx`

Expected:
- route tests fail because marketplace pages and routes do not exist yet
- homepage or navbar tests fail because the new entrypoint is not wired in yet

### Task 2: Build The Typed Marketplace Model And Catalog Helpers

**Files:**
- Create: `frontend/src/features/skill-marketplace/model/marketplace.ts`
- Create: `frontend/src/features/skill-marketplace/data/categories.ts`
- Create: `frontend/src/features/skill-marketplace/data/personalCatalog.ts`
- Create: `frontend/src/features/skill-marketplace/data/communityCatalog.ts`
- Create: `frontend/src/features/skill-marketplace/lib/filters.ts`
- Create: `frontend/src/features/skill-marketplace/lib/lookup.ts`

- [ ] **Step 1: Define the shared listing contract**

Model:
- shared entry fields such as `id`, `slug`, `artifactType`, `ownerType`, `summary`, `whyItMatters`, and `featured`
- personal-signal and community-signal structures as distinct typed shapes
- filter taxonomies for categories, artifact types, and compatibility

- [ ] **Step 2: Seed a hand-curated personal catalog**

Include a small but believable first-release set that demonstrates:
- multiple categories
- both `skill` and `plugin`
- varied maturity and reuse signals

- [ ] **Step 3: Seed a hand-curated community catalog**

Include a small curated shelf that demonstrates:
- trust and reputation signals
- external source links
- ecosystem framing distinct from personal entries

- [ ] **Step 4: Implement pure helpers for browse and detail behavior**

Support:
- filter matching across categories, artifact type, and compatibility
- featured-entry selection
- slug lookup by owner type
- related-entry selection without coupling that logic to React components

### Task 3: Implement The Marketplace Index Surface

**Files:**
- Create: `frontend/src/features/skill-marketplace/components/MarketplaceHero.tsx`
- Create: `frontend/src/features/skill-marketplace/components/MarketplaceFilters.tsx`
- Create: `frontend/src/features/skill-marketplace/components/MarketplaceSection.tsx`
- Create: `frontend/src/features/skill-marketplace/components/MarketplaceCard.tsx`
- Create: `frontend/src/features/skill-marketplace/components/MarketplaceFeaturedRow.tsx`
- Create: `frontend/src/features/skill-marketplace/components/MarketplaceGlossary.tsx`
- Create: `frontend/src/features/skill-marketplace/components/MarketplaceSignalList.tsx`
- Create: `frontend/src/features/skill-marketplace/components/MarketplaceEmptyState.tsx`
- Create: `frontend/src/features/skill-marketplace/page/SkillMarketplacePage.tsx`
- Create: `frontend/src/pages/SkillMarketplace.tsx`

- [ ] **Step 1: Compose the marketplace page shell**

Include:
- editorial hero
- lightweight quick-browse controls
- primary `My Skills` shelf
- secondary `Curated Community` shelf
- glossary / FAQ

- [ ] **Step 2: Keep browse state local and minimal**

Use:
- local React state in the page
- pure helper functions from `lib/filters.ts`
- no runtime markdown reads

- [ ] **Step 3: Make the list cards signal-rich but compact**

Show:
- name, summary, and why-it-matters framing
- artifact type and compatibility chips
- owner-specific signal blocks without pretending both catalogs use the same metric model

- [ ] **Step 4: Re-run the marketplace page tests**

Run: `npm --prefix frontend run test -- --run frontend/src/features/skill-marketplace/__tests__/SkillMarketplacePage.test.tsx`

Expected: PASS

### Task 4: Implement Shareable Detail Pages And Public Integration

**Files:**
- Create: `frontend/src/features/skill-marketplace/page/SkillMarketplaceDetailPage.tsx`
- Create: `frontend/src/pages/SkillMarketplaceDetail.tsx`
- Modify: `frontend/src/core/site/routes.ts`
- Modify: `frontend/src/core/site/navigation.ts`
- Modify: `frontend/src/core/site/backlog.ts`
- Modify: `frontend/src/app/router/router.tsx`
- Modify: `frontend/src/features/home/components/FeatureGrid.tsx`

- [ ] **Step 1: Add the public route contract**

Register:
- `/skill-marketplace`
- `/skill-marketplace/personal/:slug`
- `/skill-marketplace/community/:slug`

- [ ] **Step 2: Implement the detail composition**

Render:
- overview
- why-it-matters
- usage context
- owner-specific signal blocks
- related entries
- recovery state for missing slugs

- [ ] **Step 3: Expose the marketplace in navigation and homepage entrypoints**

Integrate:
- primary navigation link
- homepage feature card
- backlog state update that matches the feature becoming a shipped surface

- [ ] **Step 4: Re-run the route, navbar, homepage, and detail tests**

Run: `npm --prefix frontend run test -- --run frontend/src/app/router/__tests__/router.test.tsx frontend/src/components/layout/__tests__/Navbar.test.tsx frontend/src/features/home/__tests__/HomePage.test.tsx frontend/src/features/skill-marketplace/__tests__/SkillMarketplaceDetailPage.test.tsx`

Expected: PASS

### Task 5: Sync Docs And Verify The Release Slice

**Files:**
- Modify: `docs/features/skill-marketplace.md`
- Modify: feature files as needed based on verification output

- [ ] **Step 1: Update the feature doc to match shipped reality**

Refresh:
- `status`
- `entrypoints`
- `File Structure`
- `Current Design`
- `Change Notes`

- [ ] **Step 2: Run focused frontend verification**

Run:
- `npm --prefix frontend run test -- --run frontend/src/app/router/__tests__/router.test.tsx frontend/src/components/layout/__tests__/Navbar.test.tsx frontend/src/features/home/__tests__/HomePage.test.tsx frontend/src/features/skill-marketplace/__tests__/SkillMarketplacePage.test.tsx frontend/src/features/skill-marketplace/__tests__/SkillMarketplaceDetailPage.test.tsx`
- `npm --prefix frontend run build`

Expected:
- all targeted tests pass
- production build succeeds

- [ ] **Step 3: Sanity-check docs-first rules before closeout**

Verify:
- no marketplace UI depends on markdown parsing at runtime
- personal and community catalogs remain visibly distinct
- no single marketplace page file became the orchestration sink
