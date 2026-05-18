---
status: designing
entrypoints:
  - docs/superpowers/specs/2026-05-18-life-log-design.md
  - data/life-log/
  - frontend/src/
hard_constraints:
  - Follow docs/development-rules.md.
  - The first implementation is Codex-authored and site-read-only.
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
- add a dedicated `Life Log` website channel
- render a chronological list and entry detail view
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
- `docs/features/life-log.md`
  - living feature document and current boundary notes
- `data/life-log/`
  - source Markdown entries authored by Codex from user transcripts
- `frontend/src/`
  - eventual read-only Life Log route, navigation entry, and rendering components
- `scripts/`
  - eventual build-time preparation script if the frontend needs a JSON snapshot of Markdown entries

## Current Design

Life Log uses a Codex-first writing workflow:

1. The user speaks into an external speech-to-text tool.
2. The user sends the transcript to Codex.
3. Codex creates or updates one dated Markdown entry under `data/life-log/`.
4. The website reads the entries at build time or through a generated static snapshot.
5. The website displays entries as a private chronological archive.

The Markdown file is the durable source of truth. Each file keeps:

- frontmatter metadata for date, title, mood, tags, visibility, and source type
- the original transcript
- event bullets
- core insight
- lightly edited version
- literary note version

This intentionally separates writing from reading. Codex handles language shaping and revision. The website stays simple, predictable, and read-only in the first slice.

## Change Notes

- 2026-05-18: Created the Life Log feature doc and selected the Markdown-first, Codex-authored, read-only website approach.
