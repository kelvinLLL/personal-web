status: in_progress
entrypoints:
  - backend/config.py
  - backend/models.yaml
  - backend/routers/auth.py
  - backend/routers/models.py
  - backend/routers/proxy.py
  - backend/services/auth.py
  - backend/services/ai.py
  - backend/tests/test_api.py
  - backend/tests/test_models.py
  - frontend/src/pages/Settings.tsx
  - frontend/src/store/aiConfigStore.ts
  - frontend/src/lib/aiClient.ts
  - frontend/src/lib/apiClient.ts
hard_constraints:
  - Follow docs/development-rules.md.
  - Keep the current admin-password gate for server-side model access unless the user explicitly re-scopes auth.
  - Keep visitor-provided API keys browser-local only; do not persist third-party secrets to the backend in this slice.
  - Keep the frontend copy explicit about whether a setting changes the shared server model pool or only the current browser session.
design_notes:
  - The current product has two distinct AI paths: admin-authenticated server proxying and visitor-local direct provider calls.
  - Admin auth currently governs login, server model switching, model registry reload, and server-side `/api/proxy/chat` access.
  - Visitor AI configuration currently behaves like a browser-local provider profile rather than a true server-side model registration flow.
  - This slice should validate the existing chain end to end, then reduce ambiguity by making the two paths clearer in both UI and tests.
  - Expanding the OpenRouter model pool should favor currently documented models and preserve a sensible default for website workflows.
last_updated: 2026-04-17
---

# Model Service Settings

## Goal

Keep the website's AI settings usable and understandable while preserving the lightweight current auth model:

- admin password unlocks shared server-side model features
- visitors can still bring their own provider credentials locally

## Scope

In scope:

- validate admin-password login and protected model-service routes
- validate the Settings page flow for visitor-local AI configuration
- clarify the product boundary between shared server models and browser-local provider settings
- expand the shipped OpenRouter model catalog with more currently supported options

Out of scope:

- replacing the admin-password auth model
- persisting user-supplied third-party API keys on the backend
- building a multi-user hosted provider registry

## File Structure

- `docs/features/model-service-settings.md`
  - living feature doc for admin gating, model catalog, and visitor AI settings
- `backend/config.py`
  - settings and YAML-backed model registry loader
- `backend/models.yaml`
  - server-side provider and model catalog
- `backend/routers/auth.py`
  - admin password login endpoint
- `backend/routers/models.py`
  - public model listing plus admin-only active-model switching and reload
- `backend/routers/proxy.py`
  - admin-only server-side chat proxy
- `backend/services/auth.py`
  - password verification and JWT creation/verification
- `backend/services/ai.py`
  - runtime model resolution and provider proxy execution
- `backend/tests/test_api.py`
  - API-level auth and protected route coverage
- `backend/tests/test_models.py`
  - model listing and switching coverage
- `frontend/src/pages/Settings.tsx`
  - admin login UI, server model switching UI, and visitor-local provider configuration
- `frontend/src/store/aiConfigStore.ts`
  - persisted browser-local visitor config and admin session state
- `frontend/src/lib/aiClient.ts`
  - chooses between admin-authenticated server proxy and browser-local direct provider calls
- `frontend/src/lib/apiClient.ts`
  - shared frontend API helper for backend requests

## Current Design

The feature currently exposes two different AI access modes:

1. `Admin / shared server mode`

- the user submits the admin password to `/api/auth/login`
- the backend validates the password against `ADMIN_PASSWORD`
- a JWT unlocks:
  - `/api/models/active`
  - `/api/models/reload`
  - `/api/proxy/chat`
- the actual server model pool comes from `backend/models.yaml`

2. `Visitor / local provider mode`

- the user enters `baseURL`, `apiKey`, and `model` in Settings
- the values are stored in the browser via Zustand persistence
- chat requests then bypass the backend model registry and call the configured provider directly from the browser

This means the current visitor flow is not truly "register a new model in the website backend". It is a local browser profile that lets one visitor use their own provider credentials.

The implemented Settings UI now makes that split explicit:

- `Server Models`
  - shared backend-backed model pool from `backend/models.yaml`
  - switching affects the server proxy only
- `Local Provider Configuration`
  - direct browser-to-provider configuration
  - stored in the current browser only
  - does not register a new shared server model

The current server-side model pool is larger than the original three-model seed and now includes additional verified OpenRouter options such as:

- `gpt-oss-20b`
- `gpt-oss-120b`
- `gemma-4-31b`
- `trinity-large-preview`
- `kimi-k2`
- `qwen3-coder-next`
- `qwen3-max`

Runtime note:

- editing `backend/models.yaml` does not automatically rebuild the already-loaded in-memory registry for a running backend process
- the designed runtime action for that is admin-only `POST /api/models/reload`
- the Settings page `Reload` control is therefore part of the intended live-ops path, not a redundant button

## Known Gaps Before This Slice

- the Settings UI does not clearly emphasize the difference between shared server models and browser-local direct provider configuration
- the visitor connection test only returns success/failure and does not provide much diagnosis
- the current shipped OpenRouter server model catalog is too small for practical experimentation
- the end-to-end behavior of the two settings paths needs direct verification, not only partial unit coverage

## Verification

Focused verification now covers:

- backend auth and model routes through `backend/tests/test_api.py` and `backend/tests/test_models.py`
- frontend AI-path selection through `frontend/src/lib/__tests__/aiClient.test.ts`
- Settings copy and boundary clarity through `frontend/src/pages/__tests__/Settings.test.tsx`

Manual real-browser verification also confirmed:

- admin login succeeds and enables server model switching
- Settings `Switch` updates the backend active model
- Settings `Reload` exposes new `models.yaml` entries at runtime
- visitor-local OpenRouter configuration can pass `Test Connection` directly from the browser

## Change Notes

- 2026-04-17: Created the living feature doc and captured the existing split between admin-gated server models and browser-local visitor provider settings before implementation work.
- 2026-04-17: Clarified the Settings UI boundary between shared server models and browser-local provider configuration, added focused frontend tests, and expanded the shipped OpenRouter model catalog.
- 2026-04-17: Verified the admin login, server model switching, runtime model reload, and visitor-local OpenRouter connection flow in the real Settings page.
