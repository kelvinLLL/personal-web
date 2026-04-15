# Skill Marketplace Design

**Date:** 2026-04-15
**Status:** proposed-for-review

## Goal

Add a `Skill Marketplace` to `personal-web` that makes your own skills easy to browse and understand while also giving curated community tools a clearly separated place in the same product surface.

The first release should behave like a directory-first marketplace:

- fast to scan
- easy to compare
- clear about why an entry matters
- visually aligned with the current editorial frontend

The goal is not to build an installer, registry, or workflow control center in the first pass.

## Primary References

The most relevant reference is `claudemarketplaces.com`.

What is worth borrowing:

- directory-style browse pages
- strong category taxonomy
- listing cards with concise quality signals
- quick-start explanation and glossary language
- distinct object-group navigation such as `Skills`, `Marketplaces`, and `MCP`

What should not be copied directly:

- ad-slot layout and sponsored-card grammar
- SEO-heavy density
- generic marketplace styling that would fight the current `personal-web` UI tone

Reference pages:

- `https://claudemarketplaces.com/`
- `https://claudemarketplaces.com/skills`
- `https://claudemarketplaces.com/marketplaces`
- `https://claudemarketplaces.com/mcp`

## Core Product Decisions

- The feature name is `Skill Marketplace`.
- The recommended public route is `/skill-marketplace`.
- The marketplace is a directory, not a store.
- `My Skills` and `Curated Community` are separate, stable catalogs.
- `My Skills` is the primary shelf and defines the page identity.
- `Curated Community` is a secondary curated shelf, not a mixed feed.
- The first release supports `skill` and `plugin` as first-class artifact types.
- The metadata model must already leave room for later artifact types such as `mcp`, `agent`, and `command`.
- The first release should provide shareable detail pages.
- Installation or activation flows remain out of scope.

## Why This Direction

The product problem is not "how do we install extensions from the web page?"

The product problem is:

- how do I remember what I have built
- how do I surface the best tools quickly
- how do I keep personal tools and community discoveries organized
- how do I preserve quality signals and usage context

`claudemarketplaces.com` works as a reference because it optimizes for discovery and taxonomy before workflow. That is the right shape for this phase.

Your site should adapt that shape to a quieter editorial product:

- more intentional hierarchy
- fewer commercial patterns
- more emphasis on curation logic
- clearer separation between personal knowledge and community research

## Non-Goals

This feature should not attempt to:

- install skills directly from the UI
- manage package registries or remote sync
- crawl community sources automatically
- accept public submissions
- support comments, voting, reviews, or user accounts
- merge personal and community entries into one ranking feed
- become a general workflow dashboard

## Route Design

### Primary Route

- `/skill-marketplace`

This route is explicit, readable, and avoids confusion with internal skill docs or future shorter aliases.

### Detail Routes

Use shareable detail routes from the start:

- `/skill-marketplace/personal/:slug`
- `/skill-marketplace/community/:slug`

Why this route pattern:

- preserves the personal/community boundary in the URL itself
- avoids implicit catalog inference
- makes future analytics and filtering simpler
- keeps slug collisions manageable

## Information Architecture

The marketplace page should use five layers.

### 1. Hero

The hero should explain:

- this is a marketplace of your own skills plus curated community tools
- it is meant for browsing and understanding
- the two shelves serve different purposes

Hero content should include:

- title
- one short positioning paragraph
- compact catalog counts
- one primary CTA to browse your own skills section
- one secondary CTA to jump to the curated community section

The hero should feel consistent with the current homepage:

- calm
- editorial
- atmospheric but restrained

### 2. Quick Browse

This section borrows directly from the reference site's taxonomy behavior.

It should include:

- category chips
- artifact-type chips
- compatibility chips

Recommended initial categories:

- `Workflow`
- `Documentation`
- `Research`
- `Testing`
- `Frontend`
- `Design`
- `Automation`
- `Agent Building`

Recommended initial compatibility values:

- `Claude Code`
- `OpenCode`
- `Codex`
- `Cross-compatible`

This area must stay lightweight. It is a browse aid, not a heavy operator band.

### 3. My Skills

This is the primary section.

Structure:

- section intro
- featured row
- full listing grid

What this section should communicate:

- what you have built
- what each skill is good for
- where each skill fits in your workflow

The listing order should be editorial, not purely alphabetical.

Recommended default order:

1. featured / current
2. active and high-reuse
3. experimental
4. archived if you choose to expose them later

### 4. Curated Community

This is a separate section with a lighter weight than `My Skills`.

Structure:

- section intro
- featured community picks
- full listing grid

What this section should communicate:

- which external tools are worth knowing
- why they made it into your shelf
- which ecosystem they belong to

This section should feel more like a research shelf than a product showcase.

### 5. Glossary / FAQ

This should explain the catalog model in plain language.

Recommended questions:

- What is a skill?
- What is a plugin?
- What counts as a curated pick?
- Why are personal and community entries separated?
- What does compatibility mean here?

This section is important because the catalog will likely grow beyond a single artifact type.

## Listing Model

Each listing should have one stable typed entry.

### Shared Fields

Every entry should expose:

- `id`
- `slug`
- `name`
- `artifactType`
- `ownerType`
- `summary`
- `whyItMatters`
- `categories`
- `compatibility`
- `status`
- `sourceName`
- `sourceUrl`
- `docsUrl`
- `detail`
- `featured`

### Artifact Types

First release:

- `skill`
- `plugin`

Reserved for later:

- `mcp`
- `agent`
- `command`

### Owner Types

- `personal`
- `community`

### Compatibility

Use an array, not a single enum, because one entry may support multiple ecosystems.

Examples:

- `['claude-code']`
- `['opencode']`
- `['claude-code', 'codex']`
- `['cross-compatible']`

## Quality Signal Model

Do not force one universal quality model on both catalogs.

### Personal Signals

Personal entries should emphasize lived usefulness rather than popularity.

Recommended fields:

- `maturity`
  - `stable`
  - `growing`
  - `experimental`
- `reuseFrequency`
  - `high`
  - `medium`
  - `low`
- `lastUpdated`
- `usedIn`
  - array of real project or workflow references
- `keyConstraints`
  - compact list of hard usage rules
- `keyInsights`
  - compact list of durable takeaways

### Community Signals

Community entries should emphasize why they are worth attention.

Recommended fields:

- `curationReason`
- `sourceReputation`
- `githubStars`
- `ecosystemSignal`
  - text summary such as `widely referenced in Claude Code workflows`
- `lastReviewed`
- `trustLevel`
  - `high`
  - `medium`
  - `watching`

## Detail Page Design

Each detail page should have a clearer structure than the list card.

### Shared Structure

1. Overview
2. Why It Matters
3. Usage Context
4. Signals
5. Links
6. Related Entries

### Personal Detail Additions

Personal entries should also show:

- key constraints
- notable insights
- where you use it
- what workflow weakness it fixes

This is the best place to preserve your project-specific knowledge without bloating the list view.

### Community Detail Additions

Community entries should also show:

- why you curated it
- what ecosystem it belongs to
- what makes it different from alternatives
- what level of trust it currently has

## Visual Direction

The feature should look like a sibling of the current homepage, not a bolt-on marketplace template.

### Visual Principles

- calm editorial layout
- high scan speed
- clear section separation
- restrained accent usage
- strong typography and spacing hierarchy
- compact but readable chips and signal blocks

### What To Borrow From the Reference

- visible category system
- directory density
- signal-rich cards
- glossary framing

### What To Preserve From `personal-web`

- atmospheric but controlled hero treatment
- stone-based surfaces with selective accent color
- simple, readable card edges
- subdued interaction states
- no ad-like visual behavior

### Section Weight

- `My Skills`
  - visually stronger
  - slightly richer framing
  - more prominent featured row
- `Curated Community`
  - lighter framing
  - more shelf-like
  - more obviously secondary

## Data and Documentation Strategy

The marketplace should not render directly from markdown parsing at runtime.

### Required Strategy

- keep authoritative docs where needed
- mirror the marketplace's primary render data into typed frontend modules
- keep personal and community data in clearly separated structures

### Why

- more stable rendering
- easier filtering and sorting
- lower coupling between docs and UI
- easier future migration to APIs if needed

### Documentation Mapping

For personal entries, detail pages should be able to reference structured knowledge that originates from local docs or skill files, but the UI should consume a typed mirror.

That means:

- docs remain source material
- catalog data becomes the UI-facing representation

## Recommended Frontend Structure

```text
frontend/src/features/skill-marketplace/
  page/
    SkillMarketplacePage.tsx
    SkillMarketplaceDetailPage.tsx
  components/
    MarketplaceHero.tsx
    MarketplaceFilters.tsx
    MarketplaceSection.tsx
    MarketplaceCard.tsx
    MarketplaceFeaturedRow.tsx
    MarketplaceStats.tsx
    MarketplaceGlossary.tsx
    MarketplaceSignalList.tsx
    MarketplaceEmptyState.tsx
  model/
    marketplace.ts
  data/
    personalCatalog.ts
    communityCatalog.ts
    categories.ts
  lib/
    filters.ts
    grouping.ts
    lookup.ts
```

This keeps:

- types separate from data
- data separate from filtering logic
- list composition separate from detail presentation

It also avoids turning the page file into an orchestration sink.

## Homepage and Navigation Integration

The marketplace should appear as a first-class public surface.

Recommended integration:

- add `Skill Marketplace` to public navigation
- expose one homepage entry card
- keep the homepage backlog entry until the first release ships

Do not:

- expose separate homepage cards for personal and community catalogs
- move detailed marketplace controls onto the homepage

The homepage should advertise the surface, not host the directory.

## First-Release Scope

### In Scope

- public marketplace route
- dual-catalog page
- quick-browse taxonomy
- featured rows
- listing grids
- shareable detail pages
- glossary
- typed catalog data

### Out of Scope

- installation UI
- syncing to remote registries
- submission flow
- community ranking system
- account-aware personalization

## Verification Strategy

The first implementation should be verified at three levels.

### Product Verification

- the page is understandable on first scan
- personal and community catalogs are visibly distinct
- the page reads as a marketplace directory, not a dashboard

### Structure Verification

- no oversized page files
- catalog data is typed
- filtering logic is not embedded everywhere
- detail views are shareable and stable

### UI Verification

- hero matches the site's visual family
- chips and signal rows remain readable
- section hierarchy is clear on desktop and mobile

## Open Decisions

These still need confirmation before implementation planning:

- whether the public label should remain exactly `Skill Marketplace` or broaden later to something like `Agent Extensions`
- whether detail pages should support inline preview panels in addition to dedicated routes
- whether `MCP` should remain a reserved type in v1 data only or stay entirely out of the visible UI until later

## Recommendation

Build `Skill Marketplace` as a calm, directory-first catalog surface with:

- one explicit public route
- two separated shelves
- strong taxonomy
- shareable detail pages
- typed data mirrors

The best first release is the one that makes your own skills legible and your community picks trustworthy without pretending to solve installation or registry management yet.
