# Plan — wire COMPLETED via a FINISH_GAME action

Date: 2026-06-14. Status: NOT STARTED (design for the deferred COMPLETED piece).
Builds on: the XState cutover (commit `1d973f5`) and
[2026-06-14-xstate-game-state-investigation.md](2026-06-14-xstate-game-state-investigation.md).
Key prerequisite knowledge: `activePeriodIx` is advanced **early** (at
CONSOLIDATION → RESULTS) — see `packages/platform/src/machines/README.md` and the
`gbl-active-period-index-early-advance` memory.

## Problem

`COMPLETED` exists in the `GameStatus` enum and as a `final` state in
`gameMachine.ts`, but is unreachable. Two coupled issues:

1. **Last-period crash.** `activateNextPeriod` CONSOLIDATION → RESLTS
   (`GameService.ts` ~654/675) always sets `activePeriodIx = currentPeriodIx + 1`
   and `connect`s the period at that index. For the final period that index is
   `totalPeriods`, which does not exist → Prisma throws on `connect`.
2. **Index ambiguity.** Because the index advances early, `RESULTS` with
   `activePeriodIx = k+1` means "period k just finished, period k+1 is queued."
   There is no clean signal for "the final period just finished," so the machine
   cannot tell RESULTS-of-an-intermediate-period from RESULTS-of-the-last-period.

## Design (recommended)

Use `activePeriodIx === totalPeriods` as the unambiguous "no more periods" marker,
and add a distinct `FINISH_GAME` admin action that transitions `RESULTS → COMPLETED`.

### Lifecycle after the change

- Intermediate period k (`k+1 < totalPeriods`): CONSOLIDATION → RESULTS as today
  (advance `activePeriodIx = k+1`, connect period k+1). RESULTS → PREPARATION via
  `ACTIVATE_NEXT_PERIOD` (guard `activePeriodIx < totalPeriods`, already in place).
- Final period (`k+1 === totalPeriods`): CONSOLIDATION → RESULTS still computes the
  period results and advances `activePeriodIx = totalPeriods`, but **skips the
  `activePeriod` connect** (no period to connect → no crash). At this final RESULTS,
  `ACTIVATE_NEXT_PERIOD` is invalid (`totalPeriods < totalPeriods` is false) and
  `FINISH_GAME` is valid (`activePeriodIx >= totalPeriods`). It goes to COMPLETED.

### Machine / table

- `GameEvent` gains `'FINISH_GAME'`; add it to `GAME_EVENTS`.
- `GAME_TRANSITIONS[RESULTS].FINISH_GAME = { to: COMPLETED, guard: ctx => ctx.activePeriodIx >= ctx.totalPeriods }`.
- `gameMachine.ts`: add `FINISH_GAME` to the event union, a `noNextPeriod` guard
  (`activePeriodIx >= totalPeriods`), and a `RESULTS` → `COMPLETED` transition.
  (Equivalence test stays green automatically — it iterates `GAME_EVENTS`.)
- `buildTransitionContext` unchanged (uses `activePeriodIx` + `totalPeriods`).

### Service

- `GameService.activateNextPeriod`, CONSOLIDATION case: compute
  `const isLastPeriod = nextPeriodIx >= game.periods.length`. Build `gameData`
  without the `activePeriod.connect` when `isLastPeriod` (still set
  `status: targetStatus`, `activePeriodIx: nextPeriodIx`). This is the crash fix.
- New `GameService.finishGame({ gameId }, ctx, { services })`:
  - load the game (status + periods for context),
  - `const targetStatus = GameTransitions.nextStatus(game.status, 'FINISH_GAME', ctx)`;
    `if (!targetStatus) return null`,
  - `$transaction` (or single update) `game.update({ where: { id, status: game.status }, data: { status: targetStatus, version: { increment: 1 } } })` (OCC guard, consistent with the other transitions),
  - publish a realtime event after commit (see decision 2),
  - return the updated game.

### API

- `Mutation.ts`: add `finishGame(gameId: Int!): Game` resolver calling
  `GameService.finishGame` (mirror `activateNextPeriod`).
- `packages/platform/public/ops/MFinishGame.graphql`: the client mutation
  operation (mirror `MActivateNextPeriod.graphql`), built to `dist/ops` and picked
  up by the demo-game codegen (`build:graphql`).

### Admin UI (`apps/demo-game/src/pages/admin/games/[id].tsx`)

- `useMutation(FinishGameDocument)` (after codegen regenerates it).
- RESULTS case of `getButton`: if `(game.activePeriodIx ?? 0) >= game.periods.length`
  render a **"Finish Game"** button (→ `finishGame`); else the existing "Next
  Period" button. This mirrors the server guard.
- Add the completion event type to `RELEVANT_EVENT_TYPES` (SSE refetch) if a new
  type is introduced (decision 2).

### GameMachineService

- Extend `GameLifecycleState` with `canFinishGame: boolean` and include
  `FINISH_GAME` in `availableEvents`. Update `GameMachineService.test.ts`
  expectations (final RESULTS at `activePeriodIx === periodCount` → `canFinishGame:
  true`, `availableEvents: ['FINISH_GAME']`).

## Open decisions (resolve before/while implementing)

1. **Index vs relation at final RESULTS.** Recommended approach leaves
   `activePeriodIx = totalPeriods` while the `activePeriod` relation still points at
   the last period (N-1). This is intentional (ix is the marker) but technically
   inconsistent. Alternative: also `disconnect` activePeriod. **Recommendation:**
   keep the relation (so the final RESULTS can display the last period's results);
   document the ix-as-marker invariant.
2. **Completion event.** Reuse `GAME_STATE_UPDATED`, or add
   `GAME_COMPLETED` to `BaseGlobalNotificationType` (`types.ts`). **Recommendation:**
   add `GAME_COMPLETED` for clarity (admin/players can react specifically); add it
   to the admin SSE `RELEVANT_EVENT_TYPES`.
3. **Final results display.** Verify the RESULTS view shows the last period's
   results when `activePeriod` = N-1 and ix = N (intermediate RESULTS shows the
   just-finished period via `previousPeriod`). May need a small query/UI tweak.
4. **Finish early?** Whether FINISH_GAME is allowed from non-final states (abort a
   game). **Recommendation:** out of scope for v1 — only RESULTS-with-no-next.
5. **Aggregate/leaderboard at COMPLETED.** Whether to compute any final aggregate.
   **Recommendation:** v1 = status flip + event only; period results already
   computed at consolidation.

## Slices

- **F1 (platform, no API):** add FINISH_GAME to table + machine + `noNextPeriod`
  guard; CONSOLIDATION last-period no-connect crash fix. Tests: machine matrix
  (auto), a "last period consolidates without connecting a missing period" unit
  test, and a "RESULTS at ix==totalPeriods → FINISH_GAME valid, ANP invalid" test.
- **F2 (service + API):** `GameService.finishGame`; `finishGame` mutation;
  `MFinishGame.graphql`; regenerate codegen; extend `GameMachineService`
  (`canFinishGame`) + tests.
- **F3 (admin UI):** "Finish Game" button in the RESULTS case; wire the mutation;
  publish + subscribe the completion event.
- **F4 (polish):** final-results display verification; `GAME_COMPLETED` event type
  (if chosen); end-to-end check (browser) of a full multi-period game to COMPLETED.

## Verification per slice

- F1/F2: `tsc` clean + `pnpm run test` green (platform).
- F3/F4: build demo-game; run a real multi-period game locally; confirm the last
  period consolidates, shows results, and "Finish Game" → COMPLETED with no crash;
  capture screenshots for the PR.

## Progress

(none yet)
