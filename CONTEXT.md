# Context glossary

Shared vocabulary for the GBL platform. Domain nouns first, then the
architecture vocabulary the lifecycle code is structured around.

## Domain

- **Game** — a played instance. Carries a `GameStatus` and an `activePeriodIx`.
- **GameStatus** — lifecycle state: `SCHEDULED → PREPARATION → RUNNING ⇄ PAUSED
  → CONSOLIDATION → RESULTS → (PREPARATION | COMPLETED)`.
- **Period** — one round of a game. **PeriodSegment** — a sub-step of a period.
- **activePeriodIx** — index of the active period. Advanced *early* at
  `CONSOLIDATION → RESULTS`; for the final period it reaches `totalPeriods`
  without connecting a next period, so `activePeriodIx >= totalPeriods` is the
  "no more periods" marker that gates `FINISH_GAME → COMPLETED`.

## Architecture

- **XState lifecycle authority** — `gameMachine` (`machines/gameMachine.ts`) is
  the single source of truth for which lifecycle event is valid in which state,
  the guard on each transition, and the resulting target state.
  `GameMachineService` rebuilds an XState snapshot from the persisted game row
  (`game.status` plus derived guard context) and exposes the small server/admin
  API: `nextStatus`, `canTransition`, `availableEvents`, and
  `getGameLifecycleState`. Lifecycle methods *ask the machine* for the target;
  they never hard-code status.

- **Lifecycle insight** — `getGameLifecycleInsights` derives tags, phase metadata,
  terminal status, available events, and next target statuses from the same
  XState snapshot used for enforcement. Use it when UI or diagnostics need to
  ask "what can happen next?" without duplicating lifecycle rules.

- **Result descriptor** — the plain, Prisma-free output of a result computation.
  The `compute*` cores in `GameService` decide *what* results/actions/events
  follow a transition using injected domain `services`; they return descriptors,
  not database writes.
  - **ActionDescriptor** — `{ type, facts, playerId, periodIx, segment? }`. A
    thin call-site mapper turns it into a `playerAction.create` inside the
    transaction.
  - **EventDescriptor** — `{ playerId, events, periodIx, gameId,
    achievementKeys, experience, levelIx }`. A thin call-site mapper turns it
    into a post-commit `EventService.receiveEvents` thunk.
  Keeping descriptors plain is what makes result computation unit-testable with
  a fake `services` and no Prisma.

- **Visibility filter** — `filterVisiblePeriods` (`services/PlayService.ts`):
  the pure rule for what a player may see at their current period/segment.
  Filters periods `≤ activePeriodIx` and active-period segments
  `≤ activeSegmentIx`, and resolves the result type (`PERIOD_START` when
  `activePeriodIx === 0 && activeSegmentIx === -1`, else `SEGMENT_END`). The
  `-1` "before the first segment" sentinel lives here, in one place.
