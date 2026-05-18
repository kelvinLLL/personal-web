---
status: shipped
entrypoints:
  - docs/superpowers/specs/2026-05-18-life-log-design.md
  - docs/superpowers/specs/2026-05-18-life-log-design.zh.md
  - docs/superpowers/plans/2026-05-18-life-log.md
  - life-log/
  - tests/lifeLogParser.test.mjs
  - frontend/src/
hard_constraints:
  - Follow docs/development-rules.md.
  - The first implementation is Codex-authored and site-read-only.
  - Start implementation in a dedicated repo-root `life-log/` folder before integrating it into the existing personal-web frontend.
  - Keep raw transcripts private by default and preserve them as source material.
design_notes:
  - Markdown files are the durable source of truth.
  - The website is a memory reading surface, not the primary writing interface.
  - Add web editing later only after the file workflow proves useful.
last_updated: 2026-05-18
---

# Life Log

## Goal

Create a private personal Life Log channel for capturing voice-transcribed life notes, preserving raw source material, and rendering lightly edited literary entries on the personal website.

Success means:

- a new entry can be created from a voice transcript through Codex
- each entry remains readable as a standalone Markdown file
- the website can show a chronological private reading surface
- future book-like compilation remains possible because the source files keep raw, structured, and polished material together

## Scope

In scope for the first slice:

- define a Markdown-first entry format with structured frontmatter
- create a dedicated repo-root `life-log/` workspace
- prepare the data and rendering contract for a future `Life Log` website channel
- render or preview a chronological list and entry detail view from that workspace
- include raw transcript, event bullets, core insight, edited note, literary note, and tags
- keep website editing out of the first implementation

Out of scope for the first slice:

- browser-based creation or editing
- online speech-to-text
- authentication redesign
- database persistence
- public sharing controls beyond reserved metadata fields
- automatic book generation

## File Structure

- `docs/superpowers/specs/2026-05-18-life-log-design.md`
  - approved design contract for the first Life Log slice
- `docs/superpowers/specs/2026-05-18-life-log-design.zh.md`
  - Chinese review version of the Life Log design
- `docs/superpowers/plans/2026-05-18-life-log.md`
  - implementation plan for the isolated Life Log workspace
- `docs/features/life-log.md`
  - living feature document and current boundary notes
- `life-log/`
  - root-level Life Log workspace; owns source Markdown entries, parsing/generation scripts, and any standalone preview used before full site integration
- `life-log/data/entries/`
  - source Markdown entries authored by Codex from user transcripts
- `life-log/data/entries/2026-05-17-wedding.md`
  - first real sample entry using the wedding reflection transcript
- `life-log/src/parse-entry.mjs`
  - pure parser for frontmatter, required sections, event bullets, and entry metadata
- `life-log/scripts/build-snapshot.mjs`
  - standalone build script that parses entries and writes generated preview artifacts
- `life-log/generated/`
  - generated snapshot and HTML preview output for isolated review or later frontend consumption
- `tests/lifeLogParser.test.mjs`
  - parser contract tests for required frontmatter and sections
- `package.json`
  - exposes `npm run build:life-log`
- `frontend/src/`
  - future integration target for read-only Life Log route, navigation entry, and rendering components
- `scripts/`
  - future integration hooks if the main personal-web build needs to consume `life-log/generated/`

## Current Design

Life Log uses a Codex-first writing workflow:

1. The user speaks into an external speech-to-text tool.
2. The user sends the transcript to Codex.
3. Codex creates or updates one dated Markdown entry under `life-log/data/entries/`.
4. `npm run build:life-log` parses entries and emits `life-log/generated/entries.json` plus `life-log/generated/index.html`.
5. A later personal-web integration reads that snapshot or the Markdown source and displays a private chronological archive.

The Markdown file is the durable source of truth. Each file keeps:

- frontmatter metadata for date, title, mood, tags, visibility, and source type
- the original transcript
- event bullets
- core insight
- lightly edited version
- literary note version

This intentionally separates writing from reading. Codex handles language shaping and revision. The first implementation stays isolated in `life-log/`; the main website can integrate it once the entry format and review habit are proven.

## Change Notes

- 2026-05-18: Created the Life Log feature doc and selected the Markdown-first, Codex-authored, read-only website approach.
- 2026-05-18: Updated the implementation boundary to start in a dedicated repo-root `life-log/` folder before future integration into `personal-web`.
- 2026-05-18: Added a Chinese review version of the design for user approval.
- 2026-05-18: Shipped the isolated `life-log/` workspace with one sample entry, parser tests, JSON snapshot generation, and a standalone HTML preview.
