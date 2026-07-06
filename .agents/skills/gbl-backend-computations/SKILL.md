---
name: gbl-backend-computations
description: Implement the backend of a GBL platform game - the six-module Services contract (Actions, Period, PeriodResult, Segment, SegmentResult, GameFacts), facts types with yup schemas, and seed data. Use when writing or changing game logic in apps/<game>/src/services.
---

# GBL Backend Computations

A game's backend is one `Services` object with six modules of mostly-pure functions; the platform calls them at fixed lifecycle points and owns all persistence. Contract: `packages/platform/src/types.ts:Services`. Reference: `apps/demo-game/src/services/`. Concepts: [docs/developing-a-game.md](../../../docs/developing-a-game.md), lifecycle timing: [docs/game-lifecycle.md](../../../docs/game-lifecycle.md).

## Module cheat sheet

Implement all six files + a barrel `index.ts` (`export * as Actions from './ActionsReducer'` etc.):

| File                      | Implement                    | Called at                                                       | Your job                                                                             |
| ------------------------- | ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `PeriodService.ts`        | `initialize`, `consolidate`  | Admin adds period; last segment closes                          | Build period facts from admin input; roll up facts at period end                     |
| `SegmentService.ts`       | `initialize`                 | Admin adds segment (**authoring time, not activation**)         | Precompute environment: seeded randomness, events, returns                           |
| `PeriodResultService.ts`  | `initialize`, `start`, `end` | First period start; every period start; CONSOLIDATION → RESULTS | Seed initial player state; carry state across periods; compute period outcome + KPIs |
| `SegmentResultService.ts` | `initialize`, `start`, `end` | First segment; every segment start; segment close               | Carry state into segment; `end` = **apply decisions + environment → outcomes**       |
| `ActionsReducer.ts`       | `apply` + `ActionTypes` enum | Every `performAction` while RUNNING                             | Validate player input, write it into the working `SEGMENT_END` facts                 |
| `GameFactsService.ts`     | `update`                     | Never (contract slot, currently unwired)                        | Stub it                                                                              |

Every hook: `(facts, payload) => OutputFacts`. Payloads carry what you need (`gameFacts`, `periodFacts`, `segmentFacts`, `playerRole`, indices; `PeriodResult.end` additionally gets `segmentEndResults`, `otherPlayersSegmentEndResults`, `consolidationDecisions`, XP/level). Exact payload types: `packages/platform/src/types.ts`.

> [!WARNING]
> **`PeriodResult.end`'s result arrays span ALL periods, not just the one being closed.** `segmentEndResults` / `otherPlayersSegmentEndResults` contain every `SEGMENT_END` row of the game (loaded via `game.results`, ordered by period). Filter by `payload.periodIx` before any cross-player computation, or your market/comparison math silently mixes in stale rows from earlier periods. The rows carry `playerId` but no player relation — store ids in your result facts and resolve display names client-side (the player `result` query exposes a token-free `currentGame.players` list; see `PlayService.ts:getPlayerResult`).

> [!NOTE]
> **`isDirty === false` makes `performAction` return `null`.** If a player submits exactly the current/default decision, the reducer reports no change, the platform persists nothing, and the mutation result is `null` — indistinguishable from failure on the client. Pick defaults so this is harmless, and don't treat a `null` `performAction` result as an error in the UI.

## Idioms (follow the reference implementation)

- **Transform with immer:** `return produce(basefacts, draft => { ... })`. Never mutate inputs.
- **Asymmetric Role Resolution:** Check `playerRole` in `Actions.apply` if inputs are role-specific. Combine roles in `SegmentResultService.end` or `PeriodResultService.end` using `otherPlayersSegmentEndResults` (e.g., matching Buyer bids with Seller asks as in `derivatives-game`).
- **Deterministic Randomness:** Never use `Math.random()`. Use seeded helpers (`diceRoll`, `computeScenarioOutcome` from `@gbl-uzh/platform/dist/lib/util`) with a seed derived from period facts and segment index (e.g., `seed + segmentIndex`).
- **`Actions.apply` returns `{ result, isDirty }`:** the platform persists only when `isDirty` is true. Compute `isDirty` by comparing against the incoming state. (Marked `TODO` for platform-side removal in `packages/platform/src/types.ts` — check before relying on it long-term.)
- **Reject invalid player input:** throw a plain `Error` (e.g. when the allocation does not sum to 100) — mirror the same constraints in the frontend form's yup schema.
- **Side channels in any hook's return:** `events` (drive achievements), `notifications`/`globalNotification` (client toasts), `actions` (extra audit rows), `updatedPeriodFacts`/`updatedSegmentFacts` (from the action reducer).
- **Escape hatch only when facts blobs are not enough:** optional `updateDBAfterInitialize` / `updateDBBeforeActivation` / `updateDBAfterEnd` / `updateDBAfterApply` receive the open Prisma transaction (use with tables you added in `prisma/schema/specific.prisma`).

> [!WARNING]
> **Never use `@prisma/client` enums in code that reaches the frontend.** Next.js stubs backend-only imports for the client bundle, so `DB.GameStatus.RESULTS` evaluates to `undefined` at runtime and crashes the page. In shared utilities imported by both server and client (like `packages/platform/src/lib/util.ts`), use string literals (`'RESULTS'`, `'PAUSED'`, etc.) or the GraphQL-generated enum from `src/graphql/generated/ops.ts`. Keep Prisma imports as `import type` when the file is consumed by frontend code.

## Facts types + validation

Define types and yup schemas for `GameFacts`, `PeriodFacts`, `PeriodSegmentFacts`, `PlayerFacts` in `src/types/` (copy the demo game's file layout). The schemas gate admin inputs at the API boundary — the DB accepts any JSON, so schemas are the only validation.

> [!TIP]
> **Create a safe `parseFacts<T>()` helper early.** The `facts` column is `JsonValue` — it may be `null`, a raw object, or a double-stringified JSON string. Wrap every facts read in a helper like:
> ```ts
> function parseFacts<T>(raw: unknown, fallback: T): T {
>   if (!raw) return fallback;
>   try { return typeof raw === 'string' ? JSON.parse(raw) : raw as T; }
>   catch { return fallback; }
> }
> ```
> Use it in admin reports, cockpit views, and result services. Without it, uninitialised periods/segments will crash the UI with `JSON.parse(null)`.

## Seed

`prisma/seed.ts` MUST seed the `PlayerLevel` ladder (players start at level index 0). Seed `StoryElement` / `LearningElement` rows for segment content, and `Event` + `Achievement` rows if achievements should fire (no seeds → the XP engine stays dormant).

## Verify

1. `pnpm --filter @gbl-uzh/<game> run check` — keep the package's lint + `check:ts` green.
2. Run the app locally and click through one full period as admin + one player ([docs/developing-a-game.md](../../../docs/developing-a-game.md) → local dev). Check computed numbers at each `SEGMENT_END` / `PERIOD_END` against a hand calculation.
3. Adapt `playwright/tests/demo-game-flow.spec.ts` for automated lifecycle coverage.
