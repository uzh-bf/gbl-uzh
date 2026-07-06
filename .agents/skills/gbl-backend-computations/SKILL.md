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

## Idioms (follow the reference implementation)

- Transform with immer: `return produce(basefacts, draft => { ... })`. Never mutate inputs.
- `Actions.apply` returns `{ result, isDirty }` — the platform persists only when `isDirty` is true. Compute `isDirty` by comparing against the incoming state. (Marked `TODO` for platform-side removal in `packages/platform/src/types.ts` — check before relying on it long-term.)
- Reject invalid player input by throwing a plain `Error` (e.g. when the allocation does not sum to 100) — mirror the same constraints in the frontend form's yup schema.
- Deterministic randomness only: seeded helpers `diceRoll`, `computeScenarioOutcome` from `@gbl-uzh/platform/dist/lib/util`; derive the seed from period facts + segment index.
- Side channels in any hook's return: `events` (drive achievements), `notifications`/`globalNotification` (client toasts), `actions` (extra audit rows), `updatedPeriodFacts`/`updatedSegmentFacts` (from the action reducer).
- Escape hatch only when facts blobs are not enough: optional `updateDBAfterInitialize` / `updateDBBeforeActivation` / `updateDBAfterEnd` / `updateDBAfterApply` receive the open Prisma transaction (use with tables you added in `prisma/schema/specific.prisma`).

> [!WARNING]
> **Never use `@prisma/client` enums in code that reaches the frontend.** Next.js stubs backend-only imports for the client bundle, so `DB.GameStatus.RESULTS` evaluates to `undefined` at runtime and crashes the page. In shared utilities imported by both server and client (like `packages/platform/src/lib/util.ts`), use string literals (`'RESULTS'`, `'PAUSED'`, etc.) or the GraphQL-generated enum from `src/graphql/generated/ops.ts`. Keep Prisma imports as `import type` when the file is consumed by frontend code.

## Facts types + validation

Define types and yup schemas for `GameFacts`, `PeriodFacts`, `PeriodSegmentFacts`, `PlayerFacts` in `src/types/` (copy the demo game's file layout). The schemas gate admin inputs at the API boundary — the DB accepts any JSON, so schemas are the only validation.

> [!WARNING]
> **Server-computed segment facts must be `.optional()` in the schema.** The admin "Add segment" action submits `{}` as the initial facts; `SegmentService.initialize` fills the computed fields (e.g. `shock`, `roll`) afterwards. If your `PeriodSegmentFacts` schema marks those fields `.required()`, `schema.validateSync({})` throws and the mutation silently aborts — the segment never appears in the admin UI (no error surfaces). Mark server-filled fields `.optional()`/`.nullable()`; reserve `.required()` for facts the admin actually provides. (This is the same trap the `gbl-playwright-e2e` skill warns about from the test side.)

> [!TIP]
> **Create a safe `parseFacts<T>()` helper early.** The `facts` column is `JsonValue` — it may be `null`, a raw object, or a double-stringified JSON string. Wrap every facts read in a helper like:
> ```ts
> function parseFacts<T>(raw: unknown, fallback: T): T {
>   if (!raw) return fallback;
>   try { return typeof raw === 'string' ? JSON.parse(raw) : raw as T; }
>   catch { return fallback; }
> }
> ```
> Use it in admin reports, cockpit views, and result services. Without it, calling `JSON.parse` on a value that is already a parsed object throws `"[object Object]" is not valid JSON`, and a `null`/`undefined` facts value dereferences downstream and crashes the view.

## Seed

`prisma/seed.ts` MUST seed the `PlayerLevel` ladder (players start at level index 0). Seed `StoryElement` / `LearningElement` rows for segment content, and `Event` + `Achievement` rows if achievements should fire (no seeds → the XP engine stays dormant).

## Verify

1. `pnpm --filter @gbl-uzh/<game> run check` — keep the package's lint + `check:ts` green.
2. Run the app locally and click through one full period as admin + one player ([docs/developing-a-game.md](../../../docs/developing-a-game.md) → local dev). Check computed numbers at each `SEGMENT_END` / `PERIOD_END` against a hand calculation.
3. Adapt `playwright/tests/demo-game-flow.spec.ts` for automated lifecycle coverage.
