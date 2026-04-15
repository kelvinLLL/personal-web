---
name: sdd-feature-development
description: Use when implementing or materially changing a feature in personal-web and the repo's docs-first SDD workflow should govern the work.
---

# SDD Feature Development

This repo uses `SDD` as `Spec/Docs-Driven Development`.

Before feature implementation, read:

- `docs/development-rules.md`
- `docs/features/README.md`
- `references/doc-contract.md`

## Required Sequence

1. Identify the feature being changed.
2. Open `docs/features/<feature>.md`.
3. If it does not exist, create it from `assets/feature-doc-template.md`.
4. Before writing code, update:
   - header metadata
   - `Goal`
   - `Scope`
   - `File Structure`
   - `Current Design`
5. Implement the change.
6. Update the feature doc again so it matches the final code and decisions.
7. If the work produced a reusable rule, promote that insight into `docs/development-rules.md`.

## Mandatory Rules

- No code before doc.
- Keep feature-local context in the feature doc.
- Keep reusable rules in `docs/development-rules.md`.
- `File Structure` is mandatory and must explain file responsibilities, not only names.
- If the implementation changes the active boundary or structure, the doc must change in the same work.

## Scope Guard

Use this skill for feature work in this repo. Do not use it for:

- one-off typo fixes that do not change a feature boundary
- unrelated repository housekeeping
- work that only updates an existing durable rule without touching a feature

## Writing Style

- keep docs concise
- prefer concrete rules over slogans
- write docs that reflect the current system, not speculative architecture
- move detailed contract material into the referenced docs instead of bloating this file

## Promotion Rule

Promote reusable insight when the lesson is likely to matter in another feature and would improve future implementation choices if remembered.
