# SuperHaojun Env Handoff

## Purpose

This document tracks the local configuration files and secrets that are intentionally absent from git but will be needed when `SuperHaojun` is integrated into `personal-web`.

Use it as an operator checklist before submodule wiring starts.

## Current Sources

- External runtime repo: [kelvinLLL/SuperHaojun](https://github.com/kelvinLLL/SuperHaojun)
- External handoff doc: [docs/website-agent-handoff.md](https://github.com/kelvinLLL/SuperHaojun/blob/main/docs/website-agent-handoff.md)
- Current website feature doc: [docs/features/agent-harness-integration.md](/Users/haojunliu/Easy/NapPlace/personal-web/docs/features/agent-harness-integration.md)

## Current Integration Assumption

- `SuperHaojun` remains the canonical agent runtime.
- `personal-web` will integrate it as a git submodule at `apps/superhaojun` instead of copying runtime code into this repo.
- The website will add a thin adapter layer for auth, request shaping, context injection, and streaming.
- Website actions should be exposed to the runtime as tools or skill-backed actions.

## Observed Local Source State

From the current local `SuperHaojun` working repo provided for inspection:

- a populated `.env` file already exists locally
- `models.yaml` is present and points at OpenRouter by default
- `docs/website-agent-handoff.md` is present and matches the adapter-around-runtime integration model
- there is no project-local `.haojun/` directory yet, so hook rules and MCP configs do not need to be copied for the first integration slice

## Minimum Bootable Secret Set

These are the smallest secrets needed for the current integrated website path to boot.

| File | Repo | Needed now | Required values |
|---|---|---|---|
| `backend/.env` | `personal-web` | yes | `ADMIN_PASSWORD`, `JWT_SECRET`, `TAVILY_API_KEY`, `OPENROUTER_API_KEY` |
| `.env` | `SuperHaojun` submodule root | no for integrated website mode | `OPENROUTER_API_KEY` |

Notes:

- In integrated website mode, the mounted runtime is built from the backend server process, so it resolves `models.yaml` and `.env` from `personal-web/backend` by default.
- `apps/superhaojun/.env` only becomes required if you want to run the submodule directly as its own app or CLI outside the website integration path.
- The same real key may still be reused in both places if you intentionally keep a standalone `SuperHaojun` workflow alongside the website.

## Missing Local Files

These files are not expected to be committed and should be handed in locally.

| File | Repo | Status | Purpose | Notes |
|---|---|---|---|---|
| `backend/.env` | `personal-web` | gitignored | backend secrets and model-provider credentials | A checked-in example already exists at `backend/.env.example`. |
| `.env` | `SuperHaojun` | gitignored | model-provider credentials for standalone harness execution | Not required for the current website-integrated runtime path. A checked-in example already exists at `.env.example`. |
| `.haojun/hooks.json` | `SuperHaojun` | local/generated | optional persistent hook rules | Not required for first website integration. |
| `.haojun/mcp.json` | `SuperHaojun` | local | optional project-level MCP server config | Not required for the current skill-first plan. |
| `~/.haojun/mcp.json` | user home | local | optional user-level MCP server config | Not required for the current skill-first plan. |
| `~/.haojun/models.yaml` | user home | local | optional global model override | Only needed if you do not want to rely on repo-local `models.yaml`. |

## Secret Inventory

### `personal-web/backend/.env`

Known variables from checked-in code and examples:

| Variable | Required | Why it exists |
|---|---|---|
| `ADMIN_PASSWORD` | yes | protects admin-only routes and workflow execution paths |
| `JWT_SECRET` | yes | signs website auth tokens |
| `TAVILY_API_KEY` | yes | powers the ideas discovery workflow |
| `OPENROUTER_API_KEY` | yes with current `backend/models.yaml` | resolves the checked-in default model provider |

Possible future additions:

| Variable | When it becomes needed |
|---|---|
| `OPENAI_API_KEY` | if `backend/models.yaml` adds an OpenAI provider |
| `ANTHROPIC_API_KEY` | if `backend/models.yaml` adds an Anthropic provider |
| `DEEPSEEK_API_KEY` | if `backend/models.yaml` adds a DeepSeek provider |

### `SuperHaojun/.env`

Known variables from checked-in code and examples:

| Variable | Required | Why it exists |
|---|---|---|
| `OPENROUTER_API_KEY` | yes with current `models.yaml` | resolves the default checked-in provider and model profiles |
| `OPENAI_API_KEY` | optional | available if the harness switches to an OpenAI provider |
| `ANTHROPIC_API_KEY` | optional | available if the harness switches to an Anthropic provider |
| `DEEPSEEK_API_KEY` | optional | available if the harness switches to a DeepSeek provider |

Fallback-only variables if `models.yaml` is absent:

| Variable | Default | Notes |
|---|---|---|
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | only used by the single-model fallback path |
| `MODEL_ID` | `gpt-4o` | only used by the single-model fallback path |
| `MODEL_PROVIDER` | `openai` | only used by the single-model fallback path |

When this file matters:

- required when you run `apps/superhaojun` directly via `uv run superhaojun`, `uv run superhaojun-tui`, or `uv run superhaojun-web`
- not required for the current `personal-web` integration path, where the mounted runtime is created from the backend server process and therefore resolves `backend/models.yaml` plus `backend/.env`

### Process Environment Only

These do not need a dedicated `.env` file but may be useful during local development:

| Variable | Repo | Default | Why it exists |
|---|---|---|---|
| `SUPERHAOJUN_PORT` | `SuperHaojun` | `8765` | overrides the harness WebUI/backend port |
| `VITE_BACKEND_URL` | `personal-web/frontend` | empty in production | points the SPA dev server at a non-default backend target |
| `VITE_BOOK_READER_URL` | `personal-web/frontend` | local default from dev scripts | points the SPA dev server at a non-default legacy reader target |
| `SITE_URL` | `apps/daily-nuance` | `http://localhost:3000` | optional Docusaurus site URL override |
| `BASE_URL` | `apps/daily-nuance` | `/` | optional Docusaurus base path override |

## Tracked Config That Must Be Verified

These files are committed, but they still need review during integration because they decide how the local secrets are consumed.

| File | Repo | Why it matters |
|---|---|---|
| `backend/models.yaml` | `personal-web` | maps website backend model profiles onto `${ENV_VAR}` credentials |
| `models.yaml` | `SuperHaojun` | maps harness model profiles onto `${ENV_VAR}` credentials |
| `backend/.env.example` | `personal-web` | seed reference for website backend secrets |
| `.env.example` | `SuperHaojun` | seed reference for harness secrets |

## Recommended Handoff Order

1. Fill `personal-web/backend/.env` with the website secrets.
2. Mount `SuperHaojun` into `apps/superhaojun`.
3. Verify `backend/models.yaml` still points at the intended provider keys for the integrated website runtime.
4. Only create `apps/superhaojun/.env` if you also plan to run the submodule directly outside the website integration path.
5. For production, deploy `personal-web` itself and treat `apps/superhaojun` as a submodule dependency instead of deploying the `SuperHaojun` repo separately.

## Not Required Yet

Do not spend time handing these over until the integration actually needs them:

- `SuperHaojun` hook rules in `.haojun/hooks.json`
- `SuperHaojun` MCP server configs in `.haojun/mcp.json` or `~/.haojun/mcp.json`
- global `~/.haojun/models.yaml` overrides
- extra provider keys that are not referenced by either repo's active `models.yaml`

## Next Update Trigger

Update this document when any of these happen:

- the submodule path is finalized
- the website adapter introduces new secrets
- the skill-first contract layer requires new site-local config
- either repo changes its default provider or model-profile structure
