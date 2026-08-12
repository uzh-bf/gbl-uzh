---
status: accepted
---

# Standardize game admin authentication

All in-repository games use the platform's shared admin OIDC resolver so local mock selection and production fail-closed behavior cannot drift between copied applications. This supersedes ADR-0001's temporary rollout boundary, while retaining its decision that production defaults to real `AUTH0_*` credentials and rejects mock mode.

## Considered Options

- Keep fake `AUTH0_*` aliases for Central Bank and Rate Wars: rejected because aliases hide a second authentication contract and can outlive their migration purpose.
- Add native mock startup for every example: rejected because PR #185 provides native infrastructure and setup only for demo-game.

## Consequences

Starter, devrouter, and CI use `GBL_AUTH_MODE=mock` with `GBL_MOCK_OIDC_*` for every game. Native mock startup remains demo-game-only. A manual native example may use a real tenant with explicit `GBL_AUTH_MODE=auth0`; production uses real `AUTH0_*` values and cannot select mock mode.
