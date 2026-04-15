# Insight 04 — Start With Thin Vertical Slices, Then Harden The Contracts

## Core Rule

Thin vertical slices are good early architecture, but once multiple surfaces depend on them, their contracts must be tightened.

## What The Current Codebase Already Does Well

- the stack is intentionally simple
- domain models are typed on both frontend and backend
- there are tests in root scripts, frontend store/components, and backend API/service layers
- JSON persistence keeps early iteration cheap
- workflow streaming was built as a vertical slice instead of a giant platform

These are all good early-stage choices.

## Methodology Lens

- `iterative delivery`
  - build the smallest end-to-end slice that proves value
- `YAGNI`
  - do not over-platform too early
- `contract-driven hardening`
  - once a slice becomes shared, make its interfaces explicit and testable

## How This Lens Exposed Problems Here

The repo is strong at "get a working slice standing up quickly." The current weaknesses appear where those slices start touching each other:

- dev proxy rules vs actual child app ports
- frontend query params vs backend route params
- auth storage vs API token access
- visual controls vs actual data state

So the problem is not "the codebase is too simple." The problem is "the slices are ready for contract hardening."

## Guidance For Future Work

- keep thin slices for new capabilities
- once a capability is reused across surfaces, add:
- one shared contract definition
- one interaction or API test proving the contract
- one clear ownership path for state and auth

## Simple Example

Good first slice:

- `ideas.json` plus a simple list page proves the backlog concept fast

Needed hardening later:

- shared filter/query contract
- freshness model
- auth rule
- publish/update workflow
- tests that protect the user-visible promises

## Design Smell To Watch For

"It worked when it was one page, so we can keep extending it the same way."

That is usually the moment to stop and harden the contract before scaling further.
