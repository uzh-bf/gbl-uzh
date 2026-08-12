---
status: accepted
---

# Standardize game admin authentication

All in-repository games use the platform's shared admin OIDC resolver so local mock selection and production fail-closed behavior cannot drift between copied applications. This supersedes ADR-0001's temporary rollout boundary, while retaining its decision that production defaults to real `AUTH0_*` credentials and rejects mock mode.

## Considered Options

- Keep fake `AUTH0_*` aliases for Central Bank and Rate Wars: rejected because aliases hide a second authentication contract and can outlive their migration purpose.
- Keep native mock startup demo-game-only: rejected because the same committed `.env.development` defaults and a game-parameterized `setup:host` cover every game, and Prisma provisions each game's database on push.

## Consequences

Starter, devrouter, CI, and native host mode use `GBL_AUTH_MODE=mock` with `GBL_MOCK_OIDC_*` for every game; select the native game with `GBL_GAME_TARGET`. A native run may use a real tenant with explicit `GBL_AUTH_MODE=auth0`; production uses real `AUTH0_*` values and cannot select mock mode.
