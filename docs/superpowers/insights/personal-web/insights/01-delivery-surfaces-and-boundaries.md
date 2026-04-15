# Insight 01 — Keep Delivery Surfaces And Architecture Boundaries Aligned

## Core Rule

If a user can reach a surface in local development, we should know whether that surface is:

- part of the real shipped product
- an internal tool
- a prototype not meant for production

Anything else creates architecture drift.

## What The Current Codebase Already Does Well

- it already thinks in bounded app surfaces: `portal`, `book-reader`, `daily-nuance`, `frontend`, `backend`
- build and dev logic are explicitly scripted instead of hidden
- route prefixes like `/book-reader/` and `/daily-nuance/` show clear intent

## Methodology Lens

- `C4 Model`:
  - the container-level question is "what are the deployable/runtime pieces, and how do users reach them?"
- `Service boundary thinking`:
  - a boundary is only useful if deployment, routing, and ownership all tell the same story

## How This Lens Exposed A Problem Here

At the container level, the repo says there are multiple app surfaces. But local root traffic goes to `frontend`, while the production build only emits `portal`, `book-reader`, and `daily-nuance`.

That mismatch tells us the system boundary is not fully decided yet.

## Guidance For Future Work

- decide the product map before adding more pages
- if a surface is public, it must exist in the production delivery chain
- if a surface is internal, name and route it like an internal tool
- if a surface is experimental, isolate it so it cannot be mistaken for the shipped product

## Simple Example

Bad:

- local `/ideas` is treated like the main product
- production deploy has no `/ideas` surface at all

Better:

- choose one model:
- `/ideas` becomes part of the public site and is built into the shipped artifact
- or `/admin/ideas` becomes an internal app with explicit deployment rules

## Design Smell To Watch For

"This exists in dev, but we will decide later whether it really ships."

That sentence is usually the start of delivery-surface drift.
