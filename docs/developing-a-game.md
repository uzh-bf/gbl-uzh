---
type: Development Guide
title: Developing a Game
description: How to build a game: scaffolding by copying the demo game, the six-module Services contract, frontend routes, and verification.
tags:
  - services
  - backend
  - frontend
  - scaffolding
timestamp: '2026-07-04T00:00:00Z'
---

# Developing a Game

How to build a new game on the platform. Read [game-model.md](game-model.md) and [game-lifecycle.md](game-lifecycle.md) first — this page assumes their vocabulary. Related skills: `gbl-new-game-app` (scaffolding), `gbl-backend-computations` (backend), `gbl-frontend-game-ui` (frontend).

## Scaffolding a new game app

There is no generator. The supported path is copying the reference game inside a monorepo clone/fork:

1. Copy `apps/demo-game` to `apps/<your-game>`; set `name` in its `package.json` (keep `@gbl-uzh/platform` and `@gbl-uzh/ui` as `workspace:*`).
2. Keep the Prisma setup as-is: `prisma/copy.ts` copies the platform schema to `prisma/schema/platform.prisma` on every build/dev run (never edit that file); `prisma/schema/specific.prisma` is yours for game-specific tables (the demo game's is an unused stub).
3. Replace the game logic: `src/services/` (computations, below), `src/types/` (facts shapes + yup schemas), `prisma/seed.ts` (levels/content), and the pages under `src/pages/`.
4. The workspace glob `apps/*` picks the package up automatically; run from the repo root with turbo or from the app directory.
5. Local dev environment: two devcontainer configurations, both with Postgres + a mock OIDC server replacing Auth0 (one-click admin login as a fixed dev admin — no real Auth0 tenant needed). The **starter** config (`.devcontainer/starter/`, published localhost ports, zero host tooling; walkthrough in [getting-started](getting-started.md)) and the **devrouter** config (`.devcontainer/README.md`, multi-project routing for maintainers). If the environment misbehaves, use the `gbl-environment-doctor` skill. Outside a devcontainer you need real OIDC credentials via `.env.local.template`.

## Backend: the `Services` contract

A game's entire backend is one object with six modules, passed into the platform's API wiring. Contract: `packages/platform/src/types.ts:Services`. Reference implementation: `apps/demo-game/src/services/` (a barrel re-exporting six files).

```ts
// apps/<game>/src/services/index.ts
export * as Actions from "./ActionsReducer";
export * as GameFacts from "./GameFactsService";
export * as Period from "./PeriodService";
export * as PeriodResult from "./PeriodResultService";
export * as Segment from "./SegmentService";
export * as SegmentResult from "./SegmentResultService";
```

Each hook is a mostly-pure function `(facts, payload) => OutputFacts` — it receives the current facts plus a payload the platform assembled from the DB, and returns new facts (plus optional side-channel outputs). The platform owns all persistence and transactions around it.

| Module          | Hooks                        | Called when ([lifecycle](game-lifecycle.md))                 | Typical job                                                                                        |
| --------------- | ---------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `Period`        | `initialize`, `consolidate`  | Admin adds a period; period is consolidated                  | Derive period facts from admin input; roll up period facts at the end                              |
| `Segment`       | `initialize`                 | Admin adds a segment                                         | Precompute the segment's environment (randomness, events) — at authoring time, not activation      |
| `PeriodResult`  | `initialize`, `start`, `end` | First period start; each period start; period → RESULTS      | Seed a new player's state; carry state across periods; compute the period outcome per player       |
| `SegmentResult` | `initialize`, `start`, `end` | First segment of a period; each segment start; segment close | Carry player state into a segment; **apply decisions + segment facts to produce outcomes** (`end`) |
| `Actions`       | `apply` + `ActionTypes`      | Every `performAction` while RUNNING                          | Validate and store player input into the working `SEGMENT_END` result facts                        |
| `GameFacts`     | `update`                     | **Currently never** — defined in the contract but unwired    | Reserved for global game-facts updates; implement as a stub                                        |

Conventions from the reference implementation:

- **Immer** for fact transforms: wrap the output in `produce(basefacts, draft => { ... })`; never mutate inputs.
- **`Actions.apply`** returns `{ result, isDirty }`; the platform persists `result` only when `isDirty` is true. Throw a plain `Error` for invalid input (e.g. allocation not summing to 100) — the platform surfaces it.
- **Deterministic randomness**: `@gbl-uzh/platform/dist/lib/util` exports seeded helpers (`diceRoll`, `computeScenarioOutcome`, Mersenne-Twister based). Seed from period facts (e.g. `scenario.seed` + segment index) so re-created segments reproduce identically.
- **Side channels** in any hook's return: `actions` (extra audit-log rows), `events` (feed the achievement engine), `notifications`/`globalNotification` (push to clients), `updatedPeriodFacts`/`updatedSegmentFacts` (patch parent facts from an action).
- **Escape hatches**: optional `updateDBAfterInitialize` / `updateDBBeforeActivation` / `updateDBAfterEnd` / `updateDBAfterApply` hooks receive the open Prisma transaction for game-specific writes (e.g. into your `specific.prisma` tables). Prefer pure facts transforms; use hooks only when you must persist outside the facts blobs.

### Facts types and validation

Define TypeScript types + yup schemas for `GameFacts`, `PeriodFacts`, `PeriodSegmentFacts`, `PlayerFacts` (demo game: `apps/demo-game/src/types/`). The yup schemas are handed to the platform's API wiring so admin inputs (e.g. "add period" parameters) are validated before your hooks run. The DB does not validate facts — your schemas are the only gate.

### Seed data

`prisma/seed.ts` must provide at minimum the `PlayerLevel` ladder (players are created at level index 0). Optionally: `StoryElement` and `LearningElement` rows (selectable in the admin's add-segment dialog) and `Event` + `Achievement` rows if you want the XP/achievement engine to do anything (the demo game seeds none, so it is dormant there).

### Wiring it together

The `services` object, yup schemas, and facts input types are passed into the platform's API builder, which exposes all queries/mutations/subscriptions. What that builder looks like depends on the transport — GraphQL today, tRPC after the migration. See [api-layer.md](api-layer.md); reference: `apps/demo-game/src/graphql/index.ts` (`generateBaseMutations({ services, schemas, inputTypes })`).

## Frontend: built per game

There is no generic frontend — each game builds its own Next.js pages (Pages Router in the reference game), reusing components from [`@gbl-uzh/ui` and the design system](ui-components.md). The demo game's route set is the template:

| Route                 | Purpose                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/join/[token]`       | Player entry: calls the team-login mutation, redirects to the welcome page. Pure boilerplate — copy as-is.                                          |
| `/play/welcome`       | One-time team setup (name, avatar); writes `Player.facts`.                                                                                          |
| `/play/cockpit`       | **The** player screen: one layout + a body that switches on `game.status`. Game-specific.                                                           |
| `/admin/login`        | Admin OIDC sign-in. Boilerplate.                                                                                                                    |
| `/admin/games`        | Game list + create form. Near-boilerplate.                                                                                                          |
| `/admin/games/[id]`   | Facilitator control panel: period/segment authoring forms (game-specific fields!), the advance button, player list with join links, countdown form. |
| `/admin/reports/[id]` | Cross-period analytics dashboard. Game-specific charts.                                                                                             |

The cockpit pattern (from `apps/demo-game/src/pages/play/cockpit.tsx`):

1. A `GameLayout` wrapper fetches **one aggregate query** (player result + previous results + current game with active period/segment + attached content + self).
2. It subscribes to global events and, on `PERIOD_ACTIVATED` / `SEGMENT_ACTIVATED` / `COUNTDOWN_UPDATED`, **refetches that query** — events are a poke, never a data source.
3. The layout renders the shared chrome: nav, player display, Ready toggle, countdown widget, learning-element sidebar, blocking story-element popups.
4. The page body is a `switch (game.status)`: decision form under `RUNNING`, read-only results under `PAUSED`/`CONSOLIDATION`, period report under `RESULTS`, placeholders otherwise ([game-lifecycle.md](game-lifecycle.md) lists the expected view per status).

Your game-specific work is almost entirely: the decision form (validate with yup: same constraints as your `Actions.apply`), the results/report visualizations (the demo game uses recharts), and the admin authoring forms for your period/segment facts.

## Verification loop

- Run the app locally (devcontainer flow above) and click through the full lifecycle as admin + one player — the fastest end-to-end check.
- `playwright/tests/demo-game-flow.spec.ts` shows how to automate exactly that loop (admin auth setup, multi-player contexts, status assertions via `data-game-status`); adapt it for your game.
- Keep the copied package's `check` script green (`pnpm run check` = lint + `check:ts`; there is no `typecheck` script); the facts types are your main defense against silent data corruption.
