# Feature Docs

Feature docs live in `docs/features/` and are maintained as living docs.

## Purpose

- keep feature-local context close to implementation work
- make the active file structure easy to recover
- record the current design and important changes as the feature evolves

## Docs-First Workflow

For feature work in this repo:

1. identify the feature
2. open or create `docs/features/<feature>.md`
3. update the living doc before implementation
4. implement the change
5. update the living doc again so it matches reality

Reusable rules belong in `docs/development-rules.md`, not only in the local feature doc.

## Naming

- use one markdown file per feature
- prefer clear, stable hyphen-case names
- keep the feature boundary narrower than a whole subsystem when possible

## Current Docs

- [SDD Feature Development](./sdd-feature-development.md)
- [Unified Frontend Refactor](./unified-frontend-refactor.md)
