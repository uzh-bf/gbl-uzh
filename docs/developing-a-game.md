---
type: Development Guide
title: Developing a Game
description: How to build a game: scaffolding by copying the demo game, the six-module Services contract, frontend routes, and verification.
tags:
  - services
  - backend
  - frontend
  - scaffolding
timestamp: "2026-08-12T00:00:00Z"
---

# Developing a Game

How to build a new game on the platform. Read [game-model.md](game-model.md) and [game-lifecycle.md](game-lifecycle.md) first — this page assumes their vocabulary. For mechanical and didactical patterns (e.g. formative feedback, roles, seeded randomness), see [game-patterns.md](game-patterns.md). Related skills: `gbl-game-design` (design), `gbl-new-game-app` (scaffolding), `gbl-backend-computations` (backend), `gbl-frontend-game-ui` (frontend).

## 1. Game Design (before you code)

Before writing any code or scaffolding an app, use the `gbl-game-design` skill to map out the game. The game development process must explicitly include:

- **Overall narrative and storyline**: establishing the premise and the narrative arc across periods (e.g. baseline, crisis, recovery).
- **Welcome page customization**: designing the `/play/welcome` page where the player first lands to read the introductory story and customize their identity (team name, avatar).
- **Decision and mechanics design**: grounding the gameplay in theory. Ensure the information needed to deduce a sound decision (forecasts, predictions, probabilities) is surfaced to the player, so success is based on applying theory, not just luck.
- **Content overlays**: creating learning elements (quizzes/reflections) and story elements (narrative popups) that support the game's mechanics and story.
- **Two chart layers**: planning tactical charts for the `PAUSED` screen (relevant for immediate feedback during play) and historical/comparative charts for the `RESULTS` screen (between periods) to allow the game master to draw didactical conclusions in class.

## Authentication and local development

All in-repo games use the shared `resolveAdminOidcConfig()` resolver
(`packages/platform/src/lib/auth.ts:resolveAdminOidcConfig`). The starter and
devrouter containers, plus CI, use mock OIDC through `GBL_AUTH_MODE=mock` and
`GBL_MOCK_OIDC_*`. Native host mock startup is unsupported for example packages.

Native host real-tenant opt-in requires explicit `GBL_AUTH_MODE=auth0` with real
`AUTH0_*` values in an ignored `.env.local`. Production defaults to real
`AUTH0_*` and forbids mock mode. If the environment misbehaves, use the
`gbl-environment-doctor` skill.

## 2. Scaffolding a new game app

There is no generator. The supported path is copying the reference game inside a monorepo clone/fork:

1. Copy `apps/demo-game` to `apps/<your-game>`; set `name` in its `package.json` (keep `@gbl-uzh/platform` and `@gbl-uzh/ui` as `workspace:*`).
2. Keep the Prisma setup as-is: `prisma/copy.ts` copies the platform schema to `prisma/schema/platform.prisma` on every build/dev run (never edit that file); `prisma/schema/specific.prisma` is yours for game-specific tables (the demo game's is an unused stub).
3. Replace the game logic: `src/services/` (computations, below), `src/types/` (facts shapes + yup schemas), `prisma/seed.ts` (levels/content), and the pages under `src/pages/`.
4. The workspace glob `apps/*` picks the package up automatically; run from the repo root with turbo or from the app directory.
5. Local dev environment: the **starter** config (`.devcontainer/starter/`, published localhost ports) and the **devrouter** config (`.devcontainer/README.md`, namespaced maintainer routing) select `demo`, `central-bank`, or `rate-wars` through `GBL_GAME_TARGET`. Both use the shared mock OIDC contract described above, and so does native host mode — it selects the same games with an argument to `pnpm bootstrap` / `pnpm dev`, or with `GBL_GAME_TARGET`.

Demo-game's standalone Nexus and GraphQL scripts run before Next.js can load environment files. Its Prisma bootstrap loads `.env.<mode>.local`, `.env.local`, `.env.<mode>`, and `.env` in Next's precedence order before authentication is resolved (`apps/demo-game/src/lib/prisma.ts:default`). Existing process or container variables still take priority.

> **WARNING:** Decontaminate the copy. `cp -R apps/demo-game apps/<your-game>` also copies the demo game's domain logic, and the build will not fail on residue you leave behind. After step 3, hunt down demo-game leftovers: `.env.production` URLs still pointing at `demo-game.stg.env.bf-app.ch`, the `src/pages/index.tsx` trading showcase, dead `src/lib/analysis.ts` portfolio code, demo time constants (`MONTHS`/`NUM_MONTHS`), and the `GameFacts.myInt` stub. The full hit-list and a "definition of done" are in the `gbl-new-game-app` skill. Grep your `src/` for `assetsWithReturns`, `spotPrice`, `bank`/`bonds`/`stocks` — any hit is residue.

### Using the UI package outside this monorepo

Inside this repository, keep `@gbl-uzh/ui` as `workspace:*`. External games can install it after the one-time npm bootstrap, must provide its application-level peers, and need a `'use client'` boundary when App Router modules import the hook-based bundle. The canonical install, CSS, compatibility, maturity, and release guidance is in [UI Building Blocks](ui-components.md#distribution-and-installation).

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

The `services` object and yup fact schemas are passed to
`createPlatformRouter`, which exposes the platform queries, mutations, and
subscriptions. The game hosts that router at `src/pages/api/trpc/[trpc].ts` and
exports its `AppRouter` type for the Pages Router client. See
[API Layer and Realtime](api-layer.md); the reference wiring is
`apps/demo-game/src/server/trpc/router.ts`.

## Frontend: built per game

There is no generic frontend — each game builds its own Next.js pages (Pages Router in the reference game), reusing components from [`@gbl-uzh/ui and the design system`](ui-components.md). The demo game's route set is the template:

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

> [!WARNING]
>
> **Prisma enum trap:** `@prisma/client` exports runtime enum objects
> (`GameStatus`, etc.) that Next.js can strip from client bundles. Code like
> `DB.GameStatus.RESULTS` can be `undefined` in the browser. In cockpit switches
> and shared frontend utilities, compare the router's inferred status value to
> string literals (`'RUNNING'`, `'PAUSED'`, etc.). Use `import type` for Prisma
> and `AppRouter` imports in browser-reachable files.

Your game-specific work is almost entirely: the decision form (validate with yup: same constraints as your `Actions.apply`), the results/report visualizations (the demo game uses recharts), and the admin authoring forms for your period/segment facts.

## Verification loop

- Run the app locally (devcontainer flow above) and click through the full lifecycle as admin + one player — the fastest end-to-end check.
- `playwright/tests/demo-game-flow.spec.ts` shows how to automate exactly that loop (admin auth setup, multi-player contexts, status assertions via `data-game-status`); adapt it for your game.
- Keep the copied package's `check` script green (`pnpm run check` = lint + `check:ts`; there is no `typecheck` script); the facts types are your main defense against silent data corruption.
- Ready to share a URL? See [deploying-a-game.md](deploying-a-game.md) for the easy Vercel + Neon staging path (the `gbl-deploy-staging` skill drives it from the CLI).
