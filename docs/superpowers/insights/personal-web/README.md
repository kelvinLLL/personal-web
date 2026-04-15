# Personal Web Insight Library

This is the dedicated documentation library for ongoing architecture review, issue triage, and product-development guidance for `personal-web`.

## Purpose

- Keep a living record of the codebase's confirmed problems
- Turn current strengths into reusable development principles
- Explain which methodology lens exposed each weakness
- Give future work a stable place to accumulate insight instead of scattering notes across chats

## Structure

- `issues/`: concrete problem ledgers, ordered by severity and actionability
- `insights/`: reusable design and architecture guidance derived from this project

## How To Use This Library

1. Add new confirmed product or architecture problems to the latest issue ledger.
2. If a problem reveals a reusable lesson, either update an existing insight or add a new one.
3. Keep examples short and concrete so future contributors can apply the guidance quickly.
4. Prefer updating the existing documents over creating one-off scratch notes.

## Current Documents

- [Issue Ledger — 2026-04-10](./issues/2026-04-10-issue-ledger.md)
- [Insight Index](./insights/README.md)

## Current Review Scope

The first pass in this library focuses on:

- deployment and delivery-surface alignment
- frontend interaction truthfulness
- ideas workflow usability and live data freshness
- when thin slices are good enough and when they need hardening

## Working Assumption

For now, this library lives inside the main repo under `docs/superpowers/insights/` rather than as a separate Git repository. If we later want independent versioning or publishing, this subtree can be split out cleanly.
