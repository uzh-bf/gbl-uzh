# XState v5 Integration: GBL Platform Game Lifecycle

## TL;DR / Recommendation

**The switch blocks are already a state machine.** `activateNextPeriod` (GameService.ts:405) and `activateNextSegment` (GameService.ts:855) together encode a 7-state machine with 2 event types. The question is whether XState is the right tool to make it explicit.

**The honest call: XState is warranted, but only after prerequisite fixes, and with a narrower scope than the design originally proposed.**

Three critiques are valid and change the calculus:

1. **A typed transition table is a legitimate lighter alternative** for guard centralisation alone. It requires zero new dependencies, zero migration, and covers 80% of the stated value. If the team's only goal is fixing the `currentSegmentIx === 0` bug and removing `getButton()`'s 7-case switch, do the transition table first (`packages/platform/src/services/GameTransitions.ts`, ~40 lines) and stop.

2. **XState is warranted if—and only if—the team adopts the inspector/Stately workflow** as a deliberate development practice. The snapshot persistence and `snapshot.can()` button logic are genuinely better than the current code, but the marginal benefit over the transition table only materialises when developers actively use the visual tooling.

3. **Two bugs are prerequisites, not follow-ups.** `performActionWithRetry` is doubly broken (see §Risks) and the OCC gap allows duplicate `PlayerResult` rows. Both must be fixed before Slice 1 of XState adoption, because adding `WHERE version = $expected` to `game.update` (the correct OCC fix) will produce P2034 errors, and P2034 errors are silently discarded today.

**If proceeding with XState: the integration is sound in architecture but the original design had eight concrete correctness issues addressed below. Read §Least-Change Integration before writing any code.**

---

## How GBL Game State Works Today, Rendered as a State Machine

The implicit machine lives across two functions. `Game.status` (schema.prisma:90) is the canonical state node. `Game.activePeriodIx` (schema.prisma:103) and `Period.activeSegmentIx` (schema.prisma:128) are context counters, not nested states.

### State/Event/Transition Table

| From State | Event | Guard (file:line) | To State | Primary Side-Effects |
|---|---|---|---|---|
| `SCHEDULED` | `ACTIVATE_NEXT_PERIOD` | none | `PREPARATION` | `computePeriodStartResults` (init path); version++ |
| `PREPARATION` | `ACTIVATE_NEXT_SEGMENT` | `activePeriod.segments.length > 0` (GameService.ts:883) | `RUNNING` | `computeSegmentStartResults`; activeSegmentIx=0; version++ |
| `RUNNING` | `ACTIVATE_NEXT_SEGMENT` | `activeSegment.nextSegment EXISTS` (GameService.ts:998) | `PAUSED` | `computeSegmentEndResults`; `updateDBBeforeActivation`; version++ |
| `PAUSED` | `ACTIVATE_NEXT_SEGMENT` | `activePeriod.segments.length > 0` (GameService.ts:883) | `RUNNING` | `computeSegmentStartResults` (next seg); activeSegmentIx++; version++ |
| `RUNNING` | `ACTIVATE_NEXT_PERIOD` | `activeSegment EXISTS AND currentSegmentIx !== undefined`* (GameService.ts:486) | `CONSOLIDATION` | `computeSegmentEndResults`; `Period.consolidate`; version++ |
| `CONSOLIDATION` | `ACTIVATE_NEXT_PERIOD` | `!game.activePeriod?.activeSegment` (GameService.ts:602) | `RESULTS` | `computePeriodEndResults`; activePeriodIx → nextPeriodIx; version++ |
| `RESULTS` | `ACTIVATE_NEXT_PERIOD` | `nextPeriod EXISTS` (GameService.ts:733) | `PREPARATION` | `computePeriodStartResults` (carry-forward path); version++ |
| `RESULTS` | `ACTIVATE_NEXT_PERIOD` | last period (GameService.ts:738–759, currently dead code) | `COMPLETED` | — |
| `RUNNING` | `ACTIVATE_NEXT_SEGMENT` | `activeSegment.nextSegment IS NULL` (GameService.ts:998) | (no-op, return null) | — |
| any other | `ACTIVATE_NEXT_SEGMENT` | — | (no-op, warn) | — |

*Known bug: `!currentSegmentIx` at GameService.ts:486 is falsy when `currentSegmentIx === 0`, blocking consolidation at the first segment. Should be `currentSegmentIx === undefined || currentSegmentIx === null`.

**Important correction from critique:** The CONSOLIDATION→RESULTS transition already advances `activePeriodIx` to `nextPeriodIx` (GameService.ts:635, 653–658). The subsequent RESULTS→PREPARATION transition does NOT advance it again (GameService.ts:787 — no `activePeriodIx` write). This has a critical implication for the machine model (see §Proposed XState Model, `advancePeriod` note).

**Additional pre-existing bug (critique-confirmed):** `computePeriodEndResults` at GameService.ts:604–620 returns a `promises` array (achievement processing via `EventService.receiveEvents`) that is awaited at line 620 — **before** the `$transaction` at line 663. Achievement side-effects commit even if the subsequent game-state transaction rolls back. This is an existing bug; the XState migration must fix it by moving `await Promise.all(promises)` to after the `$transaction` resolves. The original design incorrectly listed this component as "Change? None."

### Where the Implicit Machine Lives

```
activateNextPeriod (GameService.ts:334–848)
  └── switch(game.status) at line 405
        case SCHEDULED      → lines 414–479
        case RUNNING        → lines 485–596
        case CONSOLIDATION  → lines 601–725
        case RESULTS        → lines 731–819

activateNextSegment (GameService.ts:855–1114)
  └── switch(game.status) at line 899
        case PREPARATION|PAUSED → lines 902–991
        case RUNNING            → lines 996–1086
        default                 → lines 1089–1093
```

---

## Proposed XState v5 Model

### Architecture Decisions

**One flat machine with context counters.** Segment sub-states (PREPARATION→RUNNING→PAUSED) share the same enum values as the outer lifecycle. Hierarchical states would require forking `GameStatus` or maintaining parallel representations.

**Player actions stay outside the machine.** `PlayService.performAction` uses Serializable-isolation transactions per player (PlayService.ts:196). Modeling player decisions as machine events would create N-players fan-out and conflict with the Serializable boundary. The `ActionsReducer.apply` signature already mirrors a reducer pattern. Leave it entirely as-is.

**Context carries only what guards actually need.** Four guard-relevant fields: `activePeriodIx`, `totalPeriods` (for last-period detection), `totalSegmentsInActivePeriod` (for `hasSegments`), and `hasNextSegment` (for RUNNING→PAUSED). The last two must be re-populated on every hydration from the current DB join result — they are not stable across transitions.

**`activePeriodIx` increments only once per period cycle.** Because CONSOLIDATION→RESULTS already advances `activePeriodIx` in the DB (GameService.ts:653–658), the machine's RESULTS→PREPARATION transition must NOT call `advancePeriod`. The machine context is resynchronised from the DB at hydration time, not accumulated through machine actions alone.

### Machine Definition

```typescript
// packages/platform/src/machines/gameMachine.ts

import { setup, assign } from 'xstate';

export interface GameMachineContext {
  gameId: number;
  activePeriodIx: number;
  totalPeriods: number;
  totalSegmentsInActivePeriod: number; // from game.activePeriod.segments.length
  hasNextSegment: boolean;             // from game.activePeriod.activeSegment.nextSegmentId != null
  // NOTE: version intentionally omitted — unreliable under concurrent writes (see §Risks)
}

export type GameMachineEvent =
  | { type: 'ACTIVATE_NEXT_PERIOD' }
  | { type: 'ACTIVATE_NEXT_SEGMENT' }
  | { type: 'FINISH_GAME' };

export const gameMachine = setup({
  types: {
    context: {} as GameMachineContext,
    events: {} as GameMachineEvent,
    input: {} as GameMachineContext,
  },

  guards: {
    // Mirrors: activePeriod.segments.length > 0 (GameService.ts:883)
    hasSegments: ({ context }) => context.totalSegmentsInActivePeriod > 0,

    // Mirrors: activeSegment.nextSegment EXISTS (GameService.ts:998)
    // Must be refreshed on every hydration; stale after segment advance
    hasNextSegment: ({ context }) => context.hasNextSegment,

    // Mirrors: nextPeriod EXISTS (GameService.ts:733)
    hasNextPeriod: ({ context }) => context.activePeriodIx < context.totalPeriods - 1,

    // For RUNNING→CONSOLIDATION (fixed version of GameService.ts:486)
    // Actual guard is "activeSegment exists" — encoded as totalSegmentsInActivePeriod > 0
    // which is always true if we reached RUNNING, but kept explicit for clarity
    canConsolidate: ({ context }) => context.totalSegmentsInActivePeriod > 0,
  },

  actions: {
    // Only used for SCHEDULED→PREPARATION and PAUSED→RUNNING (where DB also advances index)
    // NOT used for RESULTS→PREPARATION (DB already advanced in CONSOLIDATION→RESULTS)
    advancePeriod: assign({
      activePeriodIx: ({ context }) => context.activePeriodIx + 1,
    }),
  },

}).createMachine({
  id: 'gameMachine',
  context: ({ input }) => ({ ...input }),
  initial: 'SCHEDULED',

  states: {
    SCHEDULED: {
      on: {
        ACTIVATE_NEXT_PERIOD: {
          target: 'PREPARATION',
          actions: ['advancePeriod'],
        },
      },
    },

    PREPARATION: {
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: 'RUNNING',
          guard: 'hasSegments',
        },
      },
    },

    RUNNING: {
      on: {
        ACTIVATE_NEXT_SEGMENT: [
          {
            guard: 'hasNextSegment',
            target: 'PAUSED',
          },
          // No second branch: if no next segment, caller must use ACTIVATE_NEXT_PERIOD
        ],
        ACTIVATE_NEXT_PERIOD: {
          target: 'CONSOLIDATION',
          guard: 'canConsolidate',
        },
      },
    },

    PAUSED: {
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: 'RUNNING',
          guard: 'hasSegments',
        },
      },
    },

    CONSOLIDATION: {
      on: {
        ACTIVATE_NEXT_PERIOD: {
          target: 'RESULTS',
          // activePeriodIx advances in DB here (GameService.ts:653)
          // No advancePeriod action — machine context resync happens at next hydration
        },
      },
    },

    RESULTS: {
      on: {
        ACTIVATE_NEXT_PERIOD: [
          {
            guard: 'hasNextPeriod',
            target: 'PREPARATION',
            // No advancePeriod — DB already advanced in CONSOLIDATION→RESULTS
          },
          {
            // Last period: fixes the dead-state bug
            target: 'COMPLETED',
          },
        ],
        FINISH_GAME: {
          target: 'COMPLETED',
        },
      },
    },

    COMPLETED: {
      type: 'final',
    },
  },
});
```

**Correction from critique applied:** `gameMachineGuards.isLastPeriod` reference removed. The RESULTS branches now use the registered `hasNextPeriod` guard string reference and an unguarded fallthrough, which is the correct XState v5 pattern.

**What this machine does NOT do:**
- Call any `compute*` function
- Write to Prisma
- Model player actions
- Replace the `GameStatus` enum (DB column stays canonical)
- Carry `version` in context (unreliable under concurrent writes — removed)

---

## Least-Change Integration

### Prerequisites (Must Be Done First)

**Fix 1: `performActionWithRetry` retry loop (PlayService.ts:229–238)**

The bug is doubly broken: `error.isPrismaError` is not a Prisma error property (Prisma throws `PrismaClientKnownRequestError` with `.code`, not `.isPrismaError`), and `throw error` is unconditional outside the `else` branch. The condition never matches, and even if it did, always rethrows. Fix:

```typescript
} catch (error: unknown) {
  if (
    error instanceof DB.Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2025' || error.code === 'P2034')
  ) {
    retries++
    await new Promise((res) => setTimeout(res, 50 + Math.random() * 50))
    // fall through to retry — do NOT rethrow here
  } else {
    throw error
  }
}
```

This is a prerequisite because adding OCC (`WHERE version = $expected`) will produce P2034 errors, which are currently silently discarded.

**Fix 2: OCC guard on `game.update` (both functions, all cases)**

Add to every `game.update` call in `activateNextPeriod` and `activateNextSegment`:

```typescript
ctx.prisma.game.update({
  where: {
    id: game.id,
    version: game.version,  // OCC guard
  },
  data: { ... },
})
```

Prisma P2025 (record not found because version changed) is the correct signal. Retry at the GraphQL mutation level. Without this, two concurrent admin calls produce duplicate `PERIOD_START` `PlayerResult` rows — the second call's `game.update` succeeds (no unique constraint on `game.status`), but the `PlayerResult.createMany` fails on the `@@unique([periodIx, segmentIx, playerId, type])` constraint (schema.prisma:281) with a P2002. Currently this surfaces as an opaque error; with OCC it becomes a clean retry.

**Fix 3: `computePeriodEndResults` promises ordering (GameService.ts:604–663)**

Move `await Promise.all(promises)` to after the `$transaction` resolves:

```typescript
// Before: promises awaited at line 620, BEFORE $transaction at line 663
// After:
const txResult = await ctx.prisma.$transaction([ ... ])
await Promise.all(promises) // achievement side-effects only after game state committed
```

### The Hydration Helper

```typescript
// packages/platform/src/services/GameMachineService.ts

import { createActor, getNextSnapshot } from 'xstate';
import { gameMachine, GameMachineContext } from '../machines/gameMachine';

type MachineActor = ReturnType<typeof createActor<typeof gameMachine>>;

/**
 * Build context from a DB game row. Called at every hydration.
 * hasNextSegment and totalSegmentsInActivePeriod must always reflect
 * the current DB join result — they go stale across segment transitions.
 */
function buildContext(game: {
  id: number;
  activePeriodIx: number;
  periods?: { id: number }[];
  activePeriod?: {
    segments: { id: number }[];
    activeSegment?: { nextSegmentId: number | null } | null;
  } | null;
}): GameMachineContext {
  return {
    gameId: game.id,
    activePeriodIx: game.activePeriodIx,
    totalPeriods: game.periods?.length ?? 0,
    totalSegmentsInActivePeriod: game.activePeriod?.segments.length ?? 0,
    hasNextSegment: game.activePeriod?.activeSegment?.nextSegmentId != null,
  };
}

/**
 * Restore or bootstrap a machine actor from a DB row.
 * If machineSnapshot exists, restore from it but override context from DB
 * (context in snapshot may be stale for hasNextSegment/totalSegments fields).
 */
export function hydrateActor(game: Parameters<typeof buildContext>[0] & {
  status: string;
  machineSnapshot: unknown;
}): MachineActor {
  const context = buildContext(game);

  if (game.machineSnapshot) {
    // Restore state value from snapshot; override context from live DB data
    const snap = game.machineSnapshot as any;
    const restoredSnapshot = {
      ...snap,
      context, // always use fresh context from DB join
    };
    const actor = createActor(gameMachine, { snapshot: restoredSnapshot });
    actor.start();
    return actor;
  }

  // Bootstrap path for existing games without a snapshot.
  // Use event-replay via getNextSnapshot to reach correct state.
  // See migration script below for the sequence map.
  const actor = createActor(gameMachine, { input: context });
  actor.start();
  return actor;
}

export function captureSnapshot(actor: MachineActor): unknown {
  const snapshot = actor.getPersistedSnapshot();
  actor.stop();
  return snapshot;
}
```

**Note on context override:** The snapshot's persisted context is overridden with fresh DB data on every hydration. This solves the `hasNextSegment` staleness problem identified in the critique: storing `hasNextSegment` in the snapshot is meaningless because it changes whenever the active segment changes. Always derive it from the DB join at hydration time.

### The Integration Points

**Pattern: 4-line preamble, then existing switch body unchanged except one field on `game.update`.**

The preamble must be placed correctly depending on transaction form:

- **Batch `$transaction([...])` cases** (SCHEDULED→PREPARATION, RESULTS→PREPARATION, CONSOLIDATION→RESULTS): preamble runs before the switch; `machineSnapshot` is a field on the `game.update` object inside the array.
- **Interactive `$transaction(async tx => {...})` cases** (RUNNING→CONSOLIDATION at GameService.ts:488, RUNNING→PAUSED at GameService.ts:1002): the actor send and snapshot capture must happen **inside the transaction callback**, after the `tx.game.findUnique` re-read at GameService.ts:498–509/1013–1024, so that the snapshot write is atomic with the status write. **This was the most critical correctness issue in the original design.**

#### SCHEDULED→PREPARATION (batch transaction case)

```typescript
// activateNextPeriod, before existing switch (GameService.ts:405)

const actor = hydrateActor(game); // game already loaded above
if (!actor.getSnapshot().can({ type: 'ACTIVATE_NEXT_PERIOD' })) {
  actor.stop();
  return null;
}
actor.send({ type: 'ACTIVATE_NEXT_PERIOD' });
const machineSnapshot = captureSnapshot(actor);

// ---- switch body: UNCHANGED ----
switch (game.status) {
  case GameStatus.SCHEDULED: {
    // computePeriodStartResults — IDENTICAL
    const { results, extras } = computePeriodStartResults({ ... });
    await ctx.prisma.$transaction([
      ctx.prisma.game.update({
        where: { id: game.id, version: game.version }, // OCC guard (prerequisite fix)
        data: {
          status: GameStatus.PREPARATION,
          activePeriodIx: nextPeriodIx,
          activePeriodId: firstPeriod.id,
          version: { increment: 1 },
          machineSnapshot,               // NEW: one extra field
        },
      }),
      // ... all other operations IDENTICAL ...
    ]);
    break;
  }
```

#### RUNNING→PAUSED (interactive transaction case — preamble inside tx callback)

```typescript
case GameStatus.RUNNING: {  // activateNextSegment
  await ctx.prisma.$transaction(async (tx) => {
    // existing: updateDBBeforeActivation
    await services.Segment.updateDBBeforeActivation({ tx, ... });

    // existing: re-read game with fresh data
    const gameLocal = await tx.game.findUnique({ where: { id: game.id }, include: { ... } });
    if (!gameLocal) return null;

    // NEW: hydrate and capture snapshot HERE (inside tx, using fresh gameLocal data)
    const actor = hydrateActor({ ...gameLocal, machineSnapshot: game.machineSnapshot });
    if (!actor.getSnapshot().can({ type: 'ACTIVATE_NEXT_SEGMENT' })) {
      actor.stop();
      return null;
    }
    actor.send({ type: 'ACTIVATE_NEXT_SEGMENT' });
    const machineSnapshot = captureSnapshot(actor);

    // existing: computeSegmentEndResults on gameLocal — IDENTICAL
    const { results, extras } = computeSegmentEndResults(gameLocal, ...);

    await tx.game.update({
      where: { id: game.id, version: game.version },
      data: {
        status: GameStatus.PAUSED,
        version: { increment: 1 },
        machineSnapshot,               // NEW: one extra field
      },
    });
    // ... all other tx operations IDENTICAL ...
  });
}
```

The same pattern applies to RUNNING→CONSOLIDATION (GameService.ts:488–596): preamble inside the interactive-tx callback after the re-read.

### What Does NOT Change

| Component | Change? | Reason |
|---|---|---|
| `computePeriodStartResults` (GameService.ts:1292) | No | Pure function; called as today |
| `computePeriodEndResults` (GameService.ts:1396) | No (except promises ordering — see prerequisite) | Async; called as today |
| `computeSegmentStartResults` (GameService.ts:1506) | No | Pure function; called as today |
| `computeSegmentEndResults` (GameService.ts:1646) | No | Pure function; called as today |
| `services.PeriodResult.*`, `services.SegmentResult.*` | No | Game-specific; untouched |
| `services.Period.consolidate` (GameService.ts:516) | No | Called in same switch case |
| `services.Segment.updateDBBeforeActivation` (GameService.ts:491, 1004) | No | Called in same switch case |
| `EventService.publishGlobalNotification` (GameService.ts:838, 1103) | No | Called after switch; unchanged |
| `Player.isReady` reset | No | Inside existing tx |
| `PlayService.performAction` | No | Entirely separate boundary |
| `Game.version` increment | No | Stays in existing `game.update` |
| `GameStatus` Prisma enum | No | DB column remains canonical |
| GraphQL mutation signatures | No | `activateNextPeriod`/`activateNextSegment` unchanged |
| per-game `services/index.ts` | No | DI bundle unchanged |

---

## Persistence

### Schema Change

```prisma
// packages/platform/public/schema.prisma

model Game {
  // ... all existing fields unchanged ...

  /// XState v5 persisted machine snapshot. Null until first admin transition
  /// after the XState migration. Context is overridden from DB at hydration —
  /// only the state value is trusted from the snapshot.
  machineSnapshot Json?
}
```

One line. One migration. Do not touch `Game.facts` — it is written by `toggleSwitch` (PlayService.ts:876–877) via a JSON spread and consumed as `gameFacts` by every compute hook (ActionsReducer.ts:25, PlayService.ts:82). Merging snapshot data into `facts` would corrupt every consumer.

### Migration Script (Existing Games)

The original design's synthetic-snapshot approach hardcoded XState internal fields (`xstate$$version`, `historyValue`, `children`). **This is wrong** — these are implementation details not part of the public API and have changed between XState v5 minor releases.

The correct approach is event-replay: create an actor in SCHEDULED and send synthetic events to reach each target state.

```typescript
// packages/platform/prisma/migrations/xxxx_add_machine_snapshot/migrate.ts

import { createActor } from 'xstate';
import { gameMachine } from '../../src/machines/gameMachine';
import { PrismaClient, GameStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Minimal event sequences to reach each DB status from SCHEDULED.
// These sequences must match the machine's valid transitions exactly.
const EVENT_SEQUENCES: Record<string, Array<{ type: string }>> = {
  [GameStatus.SCHEDULED]:     [],
  [GameStatus.PREPARATION]:   [{ type: 'ACTIVATE_NEXT_PERIOD' }],
  [GameStatus.RUNNING]:       [{ type: 'ACTIVATE_NEXT_PERIOD' }, { type: 'ACTIVATE_NEXT_SEGMENT' }],
  [GameStatus.PAUSED]:        [{ type: 'ACTIVATE_NEXT_PERIOD' }, { type: 'ACTIVATE_NEXT_SEGMENT' }, { type: 'ACTIVATE_NEXT_SEGMENT' }],
  [GameStatus.CONSOLIDATION]: [{ type: 'ACTIVATE_NEXT_PERIOD' }, { type: 'ACTIVATE_NEXT_SEGMENT' }, { type: 'ACTIVATE_NEXT_PERIOD' }],
  [GameStatus.RESULTS]:       [/* ... CONSOLIDATION sequence + ACTIVATE_NEXT_PERIOD */],
  [GameStatus.COMPLETED]:     [/* ... RESULTS sequence + ACTIVATE_NEXT_PERIOD or FINISH_GAME */],
};

async function migrate() {
  const games = await prisma.game.findMany({
    where: { machineSnapshot: null },
    include: {
      activePeriod: {
        include: {
          segments: { select: { id: true } },
          activeSegment: { select: { nextSegmentId: true } },
        },
      },
      periods: { select: { id: true } },
    },
  });

  for (const game of games) {
    const context = {
      gameId: game.id,
      activePeriodIx: game.activePeriodIx,
      totalPeriods: game.periods.length,
      totalSegmentsInActivePeriod: game.activePeriod?.segments.length ?? 0,
      hasNextSegment: game.activePeriod?.activeSegment?.nextSegmentId != null,
    };

    const actor = createActor(gameMachine, { input: context });
    actor.start();

    const sequence = EVENT_SEQUENCES[game.status] ?? [];
    for (const event of sequence) {
      actor.send(event as any);
    }

    // Validate we reached the correct state
    const value = actor.getSnapshot().value;
    if (value !== game.status) {
      console.error(`Game ${game.id}: expected ${game.status}, reached ${value}`);
      actor.stop();
      continue;
    }

    const snapshot = actor.getPersistedSnapshot();
    actor.stop();

    await prisma.game.update({
      where: { id: game.id },
      data: { machineSnapshot: snapshot as any },
    });

    console.log(`Migrated game ${game.id} (${game.status})`);
  }
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
```

**Caveat on PAUSED sequences:** The event sequence to reach PAUSED requires a `hasNextSegment: true` context for the RUNNING→PAUSED guard to pass. If a migrated game is currently in PAUSED state with `hasNextSegment: false` in reality (final segment was active), the sequence cannot be replayed and the migration must special-case this game. Add a validation step that logs and skips rather than writing an inconsistent snapshot.

### Interaction with Transactions

`machineSnapshot` is written as a field on the same `game.update` call that writes `status`. For batch transactions, this is atomic by construction. For interactive transactions, the snapshot capture and write happen inside the transaction callback (see §Least-Change Integration above). No separate write, no separate round-trip.

---

## Computations as Transitions

The compute functions stay in the switch body, called after `actor.send()`. They are not moved into XState entry actions. The reason is concrete: `computeSegmentEndResults` re-reads the game inside an interactive `$transaction` after `updateDBBeforeActivation` runs (GameService.ts:498–509, 1013–1024). XState actions cannot perform DB I/O, and moving to `fromPromise` actors would require restructuring all batch transactions to interactive form — a large change incompatible with the minimal-diff goal.

### Sequence per Transition

```
1. [NEW]       actor.send(event) — validates guard, machine transitions in memory
2. [NEW]       captureSnapshot(actor) — snapshot computed; actor stopped
3. [UNCHANGED] switch(game.status) — runs compute* with same arguments
4. [UNCHANGED] prisma.$transaction — writes all compute* results
   [NEW]         machineSnapshot written as field on game.update in same tx
5. [UNCHANGED] EventService.publishGlobalNotification (after switch)
```

For interactive-tx cases (RUNNING→PAUSED, RUNNING→CONSOLIDATION), steps 1–2 move inside the tx callback after the `tx.game.findUnique` re-read.

### Computation Mapping

| Computation | Call site | XState role | Change |
|---|---|---|---|
| `computePeriodStartResults` (GameService.ts:1292) | SCHEDULED, RESULTS cases | None; called in switch body after send() | None |
| `computeSegmentStartResults` (GameService.ts:1506) | PREPARATION, PAUSED cases | None | None |
| `computeSegmentEndResults` (GameService.ts:1646) | RUNNING cases (both mutations) | None | None |
| `computePeriodEndResults` (GameService.ts:1396) | CONSOLIDATION case | None; promises await moved post-tx | Move `Promise.all` |
| `services.Period.consolidate` (GameService.ts:516) | RUNNING→CONSOLIDATION | None | None |
| `services.Segment.updateDBBeforeActivation` (GameService.ts:491, 1004) | RUNNING→PAUSED, RUNNING→CONSOLIDATION | None; runs before snapshot capture in interactive-tx | None |
| `EventService.receiveEvents` (per-player) | Inside computePeriodEndResults | `promises` array awaited after $transaction (bug fix) | Move await |
| `EventService.publishGlobalNotification` (GameService.ts:838, 1103) | After switch | None | None |

---

## Insight / XState UI

**Honest layered assessment — dev-only vs production clearly labelled.**

### Layer 1: Stately Studio — Dev/Authoring Only

Paste `gameMachine` definition into stately.ai/editor to get the visual diagram. Export back to TypeScript if the diagram is edited. Zero runtime integration. Free tier. One-time setup per significant machine change. This is the primary developer insight tool.

### Layer 2: Dev Inspector in Admin Page — Dev Only, Never Production

```typescript
// apps/demo-game/src/components/GameMachineDebugPanel.tsx
// (browser-only component, never SSR)

import { createBrowserInspector } from '@statelyai/inspect';
import { createActor } from 'xstate';
import { gameMachine } from '@gbl-uzh/platform/machines/gameMachine';

export function GameMachineDebugPanel({ machineSnapshot }: { machineSnapshot: unknown }) {
  useEffect(() => {
    if (!machineSnapshot) return;
    const inspector = createBrowserInspector();
    // Re-hydrate a read-only replica from the persisted snapshot
    const actor = createActor(gameMachine, {
      snapshot: { ...(machineSnapshot as any), context: { ...reconstructContext } },
      inspect: inspector.inspect,
    });
    actor.start();
    // Inspector shows static diagram with current state highlighted
    // No events will fire from this replica — transitions happen server-side
    return () => actor.stop();
  }, [machineSnapshot]);
  return <div id="xstate-inspector" />;
}
```

Mount in the admin page behind `process.env.NODE_ENV === 'development'` with a Next.js dynamic import (`ssr: false`).

**What this actually gives you (corrected from original design):** A static diagram with the current state node highlighted. Not a "live event log" — the actor receives no events because all transitions happen server-side. The diagram updates only on page reload or when the admin page fetches a new `machineSnapshot`. This is still useful for debugging ("which state are we actually in?") but is not a real-time animation.

**Privacy note:** `createBrowserInspector` sends inspection data including machine context to stately.ai servers. `gameId` and player-count data leave your network. Use only in local dev, never in staging or production environments with real game data.

### Layer 3: Production Admin Button Logic — Production

Replace `getButton()` (admin/games/[id].tsx:175–273, 7 cases) with machine-derived booleans. This is the highest-value production layer.

```typescript
// apps/demo-game/src/pages/admin/games/[id].tsx

function useGameMachineSnapshot(machineSnapshot: unknown, game: GameData) {
  return useMemo(() => {
    if (!machineSnapshot) return null;
    // Build fresh context from Apollo cache data (same data, different source)
    const context = {
      gameId: game.id,
      activePeriodIx: game.activePeriodIx,
      totalPeriods: game.periods.length,
      totalSegmentsInActivePeriod: game.activePeriod?.segments.length ?? 0,
      hasNextSegment: game.activePeriod?.activeSegment?.nextSegmentId != null,
    };
    const actor = createActor(gameMachine, {
      snapshot: { ...(machineSnapshot as any), context }, // context always fresh
    });
    actor.start();
    const snapshot = actor.getSnapshot();
    actor.stop();
    return snapshot;
  }, [machineSnapshot, game]);
}

// In the component:
const machineState = useGameMachineSnapshot(game?.machineSnapshot, game);
const canActivateNextPeriod = machineState?.can({ type: 'ACTIVATE_NEXT_PERIOD' }) ?? false;
const canActivateNextSegment = machineState?.can({ type: 'ACTIVATE_NEXT_SEGMENT' }) ?? false;
```

**Correction on last-period case (from critique):** The RESULTS state has two branches: `hasNextPeriod → PREPARATION` and (unguarded) `→ COMPLETED`. `snapshot.can({ type: 'ACTIVATE_NEXT_PERIOD' })` returns `true` in RESULTS regardless of whether it is the last period (because the unguarded COMPLETED branch is always reachable). This means `canActivateNextPeriod` cannot distinguish "advance to next period" from "trigger game completion." Keep the existing `anotherPeriod` check in `getButton()` for the RESULTS case, or add a separate `isLastPeriod` computed value:

```typescript
const isLastPeriod = (game?.activePeriodIx ?? 0) >= (game?.periods.length ?? 0) - 1;
// Use this to label the button differently, not to disable it
```

The existing bug (`activePeriodIx > periods.length - 1` should be `>=`) is fixed as a 1-character change alongside this work.

### Layer 4: SSE Live Admin View — Production

**Correction on `buildGameRealtimeFacts` signature:** The actual signature (EventService.ts:40) is `buildGameRealtimeFacts(gameId: number, gameState: RealtimeGameState | null, extraFacts: Record<string, unknown> = {})` — not a single `game` object. Pass `machineSnapshot` via `extraFacts`:

```typescript
// packages/platform/src/services/EventService.ts
// Call site in GameService.ts:839:
EventService.buildGameRealtimeFacts(
  gameId,
  gameAfterUpdate,
  { machineSnapshot: gameAfterUpdate.machineSnapshot } // ADD: via extraFacts
)
```

The admin page subscribes to the same SSE channel as the cockpit (`cockpit.tsx:108`, `Subscription.ts:7`) and calls `useGameMachineSnapshot(event.machineSnapshot, ...)` on each event, eliminating the 15-second `pollInterval` (admin/games/[id].tsx:77).

### Realistic Summary

| Tool | Environment | What It Actually Provides | Cost |
|---|---|---|---|
| Stately Studio (paste machine config) | Dev/authoring | Visual diagram, guard validation | None (free tier) |
| `createBrowserInspector` | Dev only | Static diagram with current state highlighted; no live events | `@statelyai/inspect` devDep |
| `snapshot.can()` in admin button logic | Production | Reliable button enabling (with last-period caveat above) | Zero runtime cost |
| `machineSnapshot` in SSE payload | Production | Eliminates 15s admin polling lag | One field in `extraFacts` |

---

## Phased Rollout

### Slice 0: Prerequisites — ~1.5 days

Fix the three bugs that must precede XState adoption:

1. Fix `performActionWithRetry` (PlayService.ts:229–238): correct `isPrismaError` check, move `throw error` to `else` branch.
2. Add OCC guard (`WHERE version = $expected`) to all `game.update` calls in both functions.
3. Move `await Promise.all(promises)` to after the `$transaction` in `computePeriodEndResults` path (GameService.ts:620 → after line 663).

Commit as a separate PR. These are correct regardless of XState adoption.

### Slice 1: Typed Transition Table (Tracer Bullet) — ~0.5 days

Before committing to XState, extract the guard logic to a typed table:

```typescript
// packages/platform/src/services/GameTransitions.ts
const TRANSITIONS: Record<GameStatus, Partial<Record<EventType, { guard: (g: GameCtx) => boolean; to: GameStatus }>>> = {
  [GameStatus.SCHEDULED]: {
    ACTIVATE_NEXT_PERIOD: { guard: () => true, to: GameStatus.PREPARATION },
  },
  [GameStatus.RUNNING]: {
    ACTIVATE_NEXT_PERIOD: { guard: (g) => g.activePeriod?.activeSegmentIx !== undefined, to: GameStatus.CONSOLIDATION },
    ACTIVATE_NEXT_SEGMENT: { guard: (g) => g.activePeriod?.activeSegment?.nextSegmentId != null, to: GameStatus.PAUSED },
  },
  // ... etc
}
```

This is the "do-less alternative." Ship this, fix the `getButton()` bug, and evaluate whether the team needs the visual tooling. If yes, proceed to Slice 2. If no, stop.

### Slice 2: Machine Definition + Unit Tests + Shadow Run — ~1.5 days

1. Create `packages/platform/src/machines/gameMachine.ts`.
2. Add unit tests exercising all state transitions (pure, no DB, no Prisma).
3. Add shadow check in both functions (log divergences, do not gate execution):

```typescript
if (process.env.XSTATE_SHADOW === 'true') {
  const shadowActor = hydrateActor(game);
  const canProceed = shadowActor.getSnapshot().can({ type: eventType });
  const switchWillAllow = TRANSITIONS[game.status]?.[eventType]?.guard(game) ?? false;
  shadowActor.stop();
  // Bidirectional comparison — original design only checked one direction
  if (canProceed !== switchWillAllow) {
    logger.warn('[XState shadow] Divergence', { gameId: game.id, status: game.status, event: eventType, machine: canProceed, switch: switchWillAllow });
  }
}
```

**Deliverable:** Machine passes all transition tests. Shadow log shows zero divergences on staging across all game status values.

### Slice 3: Schema Migration + Snapshot Persistence — ~1 day

1. Add `machineSnapshot Json?` to `schema.prisma`. Run `pnpm prisma migrate dev`.
2. Run migration script (event-replay approach) against staging. Validate round-trips.
3. Add `hydrateActor`/`captureSnapshot` helpers in `GameMachineService.ts`.
4. Add 4-line preamble to both functions. For interactive-tx cases, move preamble inside tx callback after re-read.
5. Add `machineSnapshot` field to `game.update` in all cases.

**Deliverable:** Every admin transition writes a snapshot. Existing behavior identical. No frontend changes yet.

### Slice 4: Admin Button Logic + SSE — ~1.5 days

1. Add `useGameMachineSnapshot` hook to admin page.
2. Replace `getButton()` with machine-derived booleans (with last-period caveat).
3. Add `machineSnapshot` to SSE payload via `extraFacts`.
4. Subscribe admin page to SSE events; remove 15-second poll.

### Slice 5: Dev Inspector — ~0.5 days

Add `GameMachineDebugPanel` behind `NODE_ENV === 'development'`. Add `@statelyai/inspect` as devDependency.

### Slice 6: Bug Fixes via Machine — ~0.5 days (separate PR)

Fix `COMPLETED` dead state and the `currentSegmentIx === 0` guard bug. Add tests for the new RESULTS→COMPLETED path.

---

## Risks and Open Questions

### Risk Summary Table

| Issue | Severity | Status |
|---|---|---|
| `performActionWithRetry` doubly broken (isPrismaError + unconditional throw) | High | Fix in Slice 0 |
| OCC gap: concurrent admin calls produce duplicate PlayerResult rows | High | Fix in Slice 0 |
| `Promise.all(promises)` before `$transaction` in CONSOLIDATION path | High | Fix in Slice 0 |
| Interactive-tx snapshot write: preamble must be inside tx callback | High | Addressed in design above |
| Migration script synthetic-snapshot shape (original design) | High | Fixed: use event-replay |
| `hasSegments` guard trivially true (original design) | Medium | Fixed: use `totalSegmentsInActivePeriod` |
| `gameMachineGuards` undefined reference (original design) | High (won't compile) | Fixed: use guard string references |
| `activePeriodIx` diverges after full period cycle | Medium | Addressed: context always re-synced from DB at hydration |
| `hasNextSegment` stale in snapshot | Medium | Addressed: context always overridden from DB at hydration |
| `buildGameRealtimeFacts` wrong call signature | Medium | Fixed: use `extraFacts` parameter |
| XState snapshot serialisation stability | Low-Medium | Pin exact xstate version; validate round-trip in CI |
| Inspector leaks gameId/player data to Stately servers | Low-Medium | Dev-only; documented above |
| `snapshot.can()` returns true for both RESULTS branches | Low | Addressed: keep `isLastPeriod` check for button label |
| `fromPromise` actors break per-request send pattern | Low/Future | Document: do not add invoked actors without revisiting call pattern |

### Open Questions

1. **Typed transition table vs XState:** Is the team committing to the Stately visual workflow? If not, the transition table (Slice 1) is sufficient and Slices 2–5 are optional.

2. **`performAction` extension:** Should the machine ever be consulted by `performAction` to validate that the game is in RUNNING state before accepting player actions? Currently `performAction` reads `game.status` directly (PlayService.ts:82). Adding a machine check here is safe (read-only `hydrateActor` + `snapshot.can()`) but adds latency to every player action. Recommendation: read `game.status` directly as today; the machine is for lifecycle transitions only.

3. **`addGamePeriod`/`addPeriodSegment` mutations:** These pre-game setup mutations update `totalPeriods` and segment counts. The machine context is re-derived at hydration time from the DB, so these mutations do not interact with the machine. The `machineSnapshot` in the DB may have stale `totalPeriods` context but this is corrected on next hydration. No action needed.

4. **`fromPromise` actors in Phase 3:** The design proposes optionally lifting compute blocks into `fromPromise` actors for computation-duration visibility in the inspector. This changes the per-request create/send/stop pattern: `actor.send()` would become asynchronous and `getPersistedSnapshot()` called immediately after would capture pre-resolution state. **Do not add invoked actors without restructuring the call pattern to await actor completion.** Document this constraint in `GameMachineService.ts`.

### Effort Estimate

| Slice | Description | Effort |
|---|---|---|
| 0 | Prerequisite bug fixes (performAction, OCC, promises ordering) | 1.5 days |
| 1 | Typed transition table (decision gate) | 0.5 days |
| 2 | Machine definition + unit tests + shadow run | 1.5 days |
| 3 | Schema migration + snapshot persistence | 1 day |
| 4 | Admin button logic + SSE | 1.5 days |
| 5 | Dev inspector | 0.5 days |
| 6 | Bug fixes (COMPLETED dead state, segmentIx=0) | 0.5 days |
| **Total** | | **7 days** |

Slice 0 is not optional and is not XState work — it is overdue bug fixing. Slices 1–2 are the decision gate. Slices 3–6 are the full XState integration.