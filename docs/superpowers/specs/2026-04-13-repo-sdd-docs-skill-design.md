# Repo SDD Docs Skill Design

**Date:** 2026-04-13
**Status:** approved-for-spec

## Goal

Create a repo-local skill that enforces a docs-first feature development workflow for `personal-web`.

This workflow is intentionally lightweight and pragmatic:

- every feature has a living document under `docs/features/`
- documentation must be updated before implementation starts
- documentation must be updated again after implementation changes reality
- reusable insights are promoted from feature-local context into one global development-rules document

For this repo, `SDD` means `Spec/Docs-Driven Development`.

## Why This Exists

The repo already contains valuable architecture notes, issue ledgers, plans, and insights, but they are distributed across several directories and document types. The next step is not just adding more docs, but shaping a development workflow that:

- keeps each feature's local context easy to recover
- records real file structure and design intent close to implementation work
- turns repeated lessons into durable project rules
- constrains future AI-assisted development so work starts from documented intent instead of ad hoc edits

## Scope

This design covers:

- one repo-local skill for feature development discipline
- one feature-doc contract for living docs
- one global rules document for reusable project guidance
- one feature-doc index
- repo-level instructions that point future sessions toward the skill

This design does not cover:

- a fully generic reusable cross-project skill
- automated doc generation from code
- a full architecture knowledge graph
- a mandatory open-questions workflow

## Recommended Approach

Use a two-layer repo-local setup:

1. A repo-local skill that defines the required development sequence
2. Repo documents that hold the actual contract and accumulated guidance

This is preferred over a single monolithic skill because it keeps the skill concise, keeps the document contract inspectable inside the repo, and makes later extraction into a reusable cross-project skill much easier.

## Artifact Layout

The initial layout should be:

```text
AGENTS.md
docs/
  development-rules.md
  features/
    README.md
    <feature>.md
.agents/
  skills/
    sdd-feature-development/
      SKILL.md
      references/
        doc-contract.md
      assets/
        feature-doc-template.md
```

### Artifact Roles

- `AGENTS.md`
  - repo-level entry instruction
  - tells future sessions to use the repo-local SDD skill before feature work
- `docs/development-rules.md`
  - canonical global rules document
  - stores reusable rules and promoted insights
- `docs/features/README.md`
  - feature doc index
  - explains how feature docs are named and maintained
- `docs/features/<feature>.md`
  - living feature documentation
  - tracks current design intent, file structure, and implementation notes
- `.agents/skills/sdd-feature-development/SKILL.md`
  - defines the enforced workflow
- `.agents/skills/sdd-feature-development/references/doc-contract.md`
  - stores the feature-doc contract and update requirements
- `.agents/skills/sdd-feature-development/assets/feature-doc-template.md`
  - starter template for new feature docs

## Feature Doc Contract

Each feature doc is a living document, not a one-time spec.

### Header Metadata

Keep the header intentionally small:

```yaml
---
status: designing
entrypoints:
  - frontend/src/pages/Ideas.tsx
hard_constraints:
  - Follow docs/development-rules.md
  - Add feature-specific rules here
design_notes:
  - Keep page layer thin
  - Split logic before files exceed 500 lines
last_updated: 2026-04-13
---
```

### Metadata Semantics

- `status`
  - current feature phase such as `designing`, `in_progress`, or `shipped`
- `entrypoints`
  - key routes, files, or modules that future work should start from
- `hard_constraints`
  - hard rules for this feature
  - feature docs inherit `docs/development-rules.md` by default and add only feature-specific constraints here
- `design_notes`
  - short, high-value design reminders
  - not a long-form explanation section
- `last_updated`
  - latest doc refresh date

### Required Sections

Each feature doc should contain:

- `Goal`
- `Scope`
- `File Structure`
- `Current Design`
- `Change Notes`

### File Structure Section Rule

`File Structure` is mandatory and should not be only a directory tree. It should explain the responsibility of each relevant file or directory so future sessions can recover the feature boundary quickly.

## Global Rules Document

`docs/development-rules.md` is the project-level layer for reusable rules and promoted insights.

It should hold:

- general engineering constraints that apply broadly in this repo
- structural heuristics worth repeating
- documentation and update rules
- promoted lessons discovered during feature work

It should not become:

- a changelog
- a duplicate of every feature doc
- a dumping ground for local implementation trivia

The expected relationship is:

- feature docs keep local context
- global rules keep reusable rules

## Skill Behavior

The repo-local skill should enforce this sequence:

1. Identify the feature being changed
2. Open `docs/features/<feature>.md`
3. If the doc does not exist, create it from the template
4. Before implementation, update:
   - header metadata
   - `Goal`
   - `Scope`
   - `File Structure`
   - `Current Design`
5. Only then begin implementation
6. After implementation, update:
   - changed file structure responsibilities
   - the current design section if architecture shifted
   - `Change Notes`
   - `last_updated`
7. If the work produced reusable insight, promote it into `docs/development-rules.md`

### Mandatory Behavior Rules

- No code before doc
  - feature work must begin with doc creation or doc refresh
- Doc reflects reality
  - docs describe the current system, not only desired future state
- File structure is mandatory
  - every feature doc must explain the active file layout and responsibilities
- Promote reusable insights
  - reusable lessons move from the feature doc into the global rules document

## AGENTS Integration

`AGENTS.md` should act as the repo entry instruction layer, not as the full methodology store.

Its job is to:

- tell agents that this repo uses docs-first feature development
- require the repo-local skill before feature implementation
- point to `docs/development-rules.md` and `docs/features/README.md`

The detailed rules remain in the skill and docs, not duplicated in `AGENTS.md`.

## Future Extraction Path

This design is repo-local first, but intentionally structured for later reuse.

The later reusable version should separate:

- the generic SDD workflow
- the generic feature-doc contract pattern
- project-specific path conventions and rule content

Keeping the contract in `references/` and the template in `assets/` makes that extraction easier.

## Success Criteria

This design is successful when:

- every new feature starts with a living doc under `docs/features/`
- feature docs are updated both before and after implementation
- `File Structure` is consistently maintained
- reusable insights are promoted into `docs/development-rules.md`
- future sessions can recover a feature boundary quickly without re-reading the whole codebase

## Initial Implementation Plan Direction

Implementation should create:

1. the repo-local skill
2. the global rules document
3. the feature-doc index
4. the feature-doc template
5. repo-level agent instructions

Then the next real feature change in this repo should use the workflow end to end as the first live validation.
