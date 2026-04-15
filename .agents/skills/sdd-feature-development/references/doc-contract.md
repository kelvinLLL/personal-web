# Doc Contract

## Feature Doc Location

- feature docs live in `docs/features/`
- each feature uses one living markdown document
- use stable hyphen-case file names

## Header Metadata

Keep the header compact and include:

- `status`
- `entrypoints`
- `hard_constraints`
- `design_notes`
- `last_updated`

Every feature doc inherits `docs/development-rules.md` by default. Use `hard_constraints` for feature-specific additions, not for repeating every global rule.

## Required Sections

Every feature doc must contain:

- `Goal`
- `Scope`
- `File Structure`
- `Current Design`
- `Change Notes`

## Section Rules

### Goal

State what the feature is trying to achieve and what success looks like.

### Scope

Clarify what is in scope and what is intentionally out of scope for the current work.

### File Structure

Explain the files and directories that define the feature boundary. Do not only paste a tree; include each file's responsibility.

### Current Design

Capture the current structure, boundaries, and any important data or control flow decisions.

### Change Notes

Keep a compact running log of meaningful updates that changed the feature's design, structure, or rules.

## Relationship To Global Rules

- feature docs keep local context
- `docs/development-rules.md` keeps reusable rules and promoted insights
- if a lesson will change future work outside the current feature, promote it upward
