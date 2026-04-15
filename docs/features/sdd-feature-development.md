---
status: shipped
entrypoints:
  - AGENTS.md
  - .agents/skills/sdd-feature-development/SKILL.md
  - docs/development-rules.md
  - docs/features/README.md
hard_constraints:
  - Follow docs/development-rules.md.
  - Keep the skill concise and move detailed contract material into referenced docs.
  - Keep each file focused; split or extract before a file grows past 500 lines.
design_notes:
  - Dogfood the docs-first workflow while implementing it.
  - Keep feature-local context here and promote only reusable rules upward.
last_updated: 2026-04-13
---

# SDD Feature Development

## Goal

Add a repo-local skill and supporting repo docs that force docs-first feature development in `personal-web`.

## Scope

In scope:

- create the repo-local skill
- create a global development-rules document
- create a feature-doc index
- create a reusable feature-doc template
- add repo-level instructions that point future sessions to the workflow

Out of scope:

- a generic cross-project reusable version
- automated doc generation from code
- a broader repo reorganization

## File Structure

- `AGENTS.md`
  - repo-level instruction entrypoint for future sessions
- `.agents/skills/sdd-feature-development/SKILL.md`
  - skill workflow and enforcement rules
- `.agents/skills/sdd-feature-development/references/doc-contract.md`
  - detailed feature-doc contract and document relationships
- `.agents/skills/sdd-feature-development/assets/feature-doc-template.md`
  - starter template for new feature living docs
- `docs/superpowers/specs/2026-04-13-repo-sdd-docs-skill-design.md`
  - approved design contract for the workflow
- `docs/superpowers/plans/2026-04-13-repo-sdd-docs-skill.md`
  - implementation plan for this feature
- `docs/development-rules.md`
  - reusable project rules and promoted insights
- `docs/features/README.md`
  - feature-doc index and maintenance rules
- `docs/features/sdd-feature-development.md`
  - living doc for this feature
- `tests/repoSddDocsSkill.test.mjs`
  - contract test for the new workflow assets

## Current Design

The workflow is intentionally split across a small number of artifacts:

- the skill enforces behavior
- the feature-doc template and contract define document shape
- the global rules doc stores reusable project guidance
- each feature doc stores local context and evolving structure

This feature was implemented docs-first:

1. keep this living doc current
2. add contract tests
3. create the workflow artifacts
4. update this doc to match the final implementation

The repo-level interaction now works like this:

- `AGENTS.md` points sessions to the workflow
- the skill enforces the behavior during feature work
- `docs/features/README.md` explains the feature-doc layer
- `docs/development-rules.md` holds reusable rules
- each feature doc remains the local source of truth for the feature boundary

## Change Notes

- 2026-04-13: Created the initial living doc before implementation to dogfood the intended workflow.
- 2026-04-13: Added the repo-local skill, template, global rules doc, feature-doc index, and repo entry instructions.
