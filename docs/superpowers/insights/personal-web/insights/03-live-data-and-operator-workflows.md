# Insight 03 — Treat Live Data And Operator Workflows As First-Class Product Flows

## Core Rule

If a screen depends on fresh or generated data, the refresh/discovery/publish workflow is part of the product, not just an implementation detail.

## What The Current Codebase Already Does Well

- there is already a workflow endpoint
- the frontend already knows how to show streaming progress
- ideas carry metadata like discovery source and workflow run id

Those are strong building blocks.

## Methodology Lens

- `Design Thinking`
  - start from the operator's real job, not only from the technical capability
- `Nielsen Norman Group: Visibility of system status`
  - users need to know freshness, progress, and result state
- `Product workflow design`
  - generation and review are usually separate steps

## How This Lens Exposed Problems Here

The current ideas area has discovery code, but not yet a complete operating flow:

- no obvious refresh action for keeping the list current
- no clearly visible freshness or last-run state
- no run history
- no draft/review/publish split
- persisted data currently contains repeated placeholder-like entries, so the list reads more like sample inventory than a trustworthy live backlog

That means the technical capability exists, but the user workflow is still underdesigned.

## Guidance For Future Work

- model idea discovery as an operator journey:
- trigger run
- watch progress
- inspect candidates
- accept or reject
- publish to the visible backlog
- show freshness directly on the list:
- last updated
- data source
- current run status
- what changed since last publish

## Simple Example

Bad:

- hidden admin-only `Discover Ideas`
- run finishes
- list quietly changes or fails
- nobody knows whether the screen is fresh

Better:

- explicit `Refresh Ideas` action
- inline run card with `running`, `failed`, `ready for review`, `published`
- list header says `Last published 12 minutes ago from workflow run #42`

## Design Smell To Watch For

"We already have the endpoint, so the workflow is basically done."

Endpoints are building blocks. Operator workflows need their own product design.
