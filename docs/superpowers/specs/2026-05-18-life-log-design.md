# Life Log Design

## Goal

Add an independent private `Life Log` channel to `personal-web`.

The channel captures voice-transcribed personal reflections and everyday events before they disappear into time. It should feel like a personal memory archive first, and only secondarily like a publishing surface.

The first slice uses Markdown files as the durable source of truth. Codex is the creation and editing interface; the website is the read-only place to revisit entries.

## Product Shape

Life Log is a private channel in the personal website, separate from `Daily Nuance`.

The first slice has two user-facing surfaces:

- `Life Log Index`
  - chronological list of entries
  - date, title, mood, tags, and short excerpt
  - lightweight filtering by tag can come later
- `Life Log Entry`
  - title and date
  - event bullets
  - core insight
  - edited note
  - literary note
  - optional collapsed raw transcript

The site should make review easy, not turn the user into an admin operator. The primary emotional job is: "I can come back and see who I was becoming."

## First-Slice Workflow

The writing path is intentionally outside the browser:

1. The user records speech in any external speech-to-text tool.
2. The user gives the transcript to Codex.
3. Codex creates a dated Markdown entry.
4. Codex may revise the entry later when the user says "改一下今天这篇" or provides more material.
5. The site renders the latest committed entries.

This avoids building browser auth, live AI generation, save conflict handling, and speech-to-text before the core habit is proven.

## Data Format

Entries live under:

```text
data/life-log/YYYY-MM-DD.md
```

If multiple entries are needed on the same day, use a short suffix:

```text
data/life-log/YYYY-MM-DD-wedding.md
```

Each entry uses Markdown with frontmatter:

```md
---
date: 2026-05-17
title: 婚礼、正反馈和一块拼图
mood: 感慨
source: voice-transcript
visibility: private
tags:
  - 婚礼
  - 探索生活
  - 正反馈
  - 小世界与大世界
---

## 今日发生的事

- 去参加了贝贝和他老婆的婚礼。

## 今日核心感悟

...

## 整理版

...

## 札记版

...

## 原始记录

...
```

The raw transcript stays in the file because it is source material, not noise. The polished sections can improve over time without losing the original voice.

## Content Contract

Every generated entry should include:

- `title`: specific enough to be memorable
- `date`: local calendar date in Asia/Shanghai
- `mood`: one short phrase
- `tags`: stable retrieval handles
- `今日发生的事`: concrete event bullets
- `今日核心感悟`: the emotional or conceptual center
- `整理版`: cleaned-up but still close to the user's voice
- `札记版`: more literary, but not over-written
- `原始记录`: original transcript

Codex should preserve the user's thinking texture. The output should not become generic inspirational prose.

## Frontend Design

The Life Log UI should be quiet and readable.

Recommended direction:

- simple chronological archive
- generous reading width
- tags as secondary metadata
- one primary content column
- raw transcript hidden behind a disclosure control
- no decorative hero or marketing copy

The channel is personal, not promotional. The visual tone should feel like a private study notebook rather than a social feed.

## Implementation Boundaries

First slice:

- create the data folder
- add at least one sample entry from the user's 2026-05-17 wedding reflection
- add build-time parsing or snapshot generation for Markdown files
- add read-only frontend route and navigation entry
- test that entries parse and render

Later slices:

- lightweight web edits for title/tags/favorite
- tag and mood filters
- search
- yearly/monthly review
- compilation mode for book-like chapters
- optional private/public publishing controls

## Non-Goals

The first slice does not include:

- online recording
- speech-to-text
- web-based AI rewrite
- database storage
- multi-user access
- public commenting
- full CMS editing

## Risks And Decisions

Markdown versus JSON:

- Markdown is chosen because the entries are primarily personal writing.
- Frontmatter provides enough structure for listing and filtering.
- A build-time JSON snapshot can be generated later if the frontend needs typed data.

Read-only versus editing:

- Read-only is chosen for the first slice because Codex is already the writing environment.
- Editing can be added after the capture habit is proven.

Privacy:

- Entries default to `visibility: private`.
- Raw transcripts are kept but should not be surfaced prominently.
- If the site later supports public publishing, private remains the default.

## Testing

First implementation should include:

- a parser test for required frontmatter
- a fixture or sample entry render test
- a build test proving missing optional fields do not break the site
- a route-level smoke test if the frontend test setup supports it

## Open Implementation Choice

During planning, decide whether the frontend reads Markdown directly at build time or reads a generated JSON snapshot.

Default recommendation: generate a small typed JSON snapshot during build, because the existing repo already uses build-time data preparation patterns.
