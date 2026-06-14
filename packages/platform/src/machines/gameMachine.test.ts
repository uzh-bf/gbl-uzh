import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createActor, type AnyStateMachine } from 'xstate'
import {
  GAME_EVENTS,
  GAME_TRANSITIONS,
  type GameEvent,
  type GameTransitionContext,
  nextStatus,
} from '../services/GameTransitions.js'
import { gameMachine } from './gameMachine.js'

const ALL_STATUSES = Object.values(DB.GameStatus)

/** Build a machine snapshot pinned to a given state value + guard context. */
function snapshotAt(value: DB.GameStatus, context: GameTransitionContext) {
  return (gameMachine as AnyStateMachine).resolveState({ value, context })
}

/** A small but representative grid of guard contexts. */
const CONTEXTS: GameTransitionContext[] = []
for (const segmentCount of [0, 2]) {
  for (const hasActiveSegment of [false, true]) {
    for (const hasNextSegment of [false, true]) {
      for (const [activePeriodIx, totalPeriods] of [
        [0, 2], // not the last period
        [1, 2], // entering the last period
        [2, 2], // past the last period (advanced early) -> FINISH_GAME territory
      ] as Array<[number, number]>) {
        CONTEXTS.push({
          activePeriodIx,
          totalPeriods,
          segmentCount,
          hasActiveSegment,
          hasNextSegment,
        })
      }
    }
  }
}

test('machine state nodes are exactly the GameStatus enum values', () => {
  const machineStates = Object.keys(
    (gameMachine as AnyStateMachine).config.states ?? {}
  ).sort()
  assert.deepEqual(machineStates, [...ALL_STATUSES].sort())
})

test('machine transitions match the GAME_TRANSITIONS table for every state/event/context', () => {
  for (const status of ALL_STATUSES) {
    for (const ctx of CONTEXTS) {
      const actor = createActor(gameMachine, { snapshot: snapshotAt(status, ctx) })
      actor.start()
      const snapshot = actor.getSnapshot()

      for (const event of GAME_EVENTS) {
        const expectedTarget = nextStatus(status, event, ctx) // target or null
        const machineCan = snapshot.can({ type: event })

        assert.equal(
          machineCan,
          expectedTarget !== null,
          `can(${event}) from ${status} with ctx ${JSON.stringify(ctx)}`
        )
      }
      actor.stop()
    }
  }
})

test('machine reaches the table target when a transition is allowed', () => {
  for (const status of ALL_STATUSES) {
    for (const ctx of CONTEXTS) {
      for (const event of GAME_EVENTS) {
        const expectedTarget = nextStatus(status, event, ctx)
        if (expectedTarget === null) continue

        const actor = createActor(gameMachine, {
          snapshot: snapshotAt(status, ctx),
        })
        actor.start()
        actor.send({ type: event })
        assert.equal(
          actor.getSnapshot().value,
          expectedTarget,
          `${status} --${event}--> expected ${expectedTarget} with ctx ${JSON.stringify(ctx)}`
        )
        actor.stop()
      }
    }
  }
})

test('the happy path walks the full lifecycle', () => {
  const ctx: GameTransitionContext = {
    activePeriodIx: 0,
    totalPeriods: 2,
    segmentCount: 2,
    hasActiveSegment: true,
    hasNextSegment: true,
  }
  const actor = createActor(gameMachine, {
    snapshot: snapshotAt(DB.GameStatus.SCHEDULED, ctx),
  })
  actor.start()

  assert.equal(actor.getSnapshot().value, DB.GameStatus.SCHEDULED)
  actor.send({ type: 'ACTIVATE_NEXT_PERIOD' })
  assert.equal(actor.getSnapshot().value, DB.GameStatus.PREPARATION)
  actor.send({ type: 'ACTIVATE_NEXT_SEGMENT' })
  assert.equal(actor.getSnapshot().value, DB.GameStatus.RUNNING)
  actor.send({ type: 'ACTIVATE_NEXT_SEGMENT' })
  assert.equal(actor.getSnapshot().value, DB.GameStatus.PAUSED)
  actor.send({ type: 'ACTIVATE_NEXT_SEGMENT' })
  assert.equal(actor.getSnapshot().value, DB.GameStatus.RUNNING)
  actor.send({ type: 'ACTIVATE_NEXT_PERIOD' })
  assert.equal(actor.getSnapshot().value, DB.GameStatus.CONSOLIDATION)
  actor.send({ type: 'ACTIVATE_NEXT_PERIOD' })
  assert.equal(actor.getSnapshot().value, DB.GameStatus.RESULTS)
  actor.stop()
})

test('a running first segment (segmentIx 0) can still be consolidated', () => {
  // Regression guard: the current switch uses `!currentSegmentIx`, which is
  // falsy at segmentIx 0 and wrongly blocks consolidation. The machine guard
  // only requires an active segment.
  const ctx: GameTransitionContext = {
    activePeriodIx: 0,
    totalPeriods: 1,
    segmentCount: 1,
    hasActiveSegment: true,
    hasNextSegment: false,
  }
  const actor = createActor(gameMachine, {
    snapshot: snapshotAt(DB.GameStatus.RUNNING, ctx),
  })
  actor.start()
  assert.equal(actor.getSnapshot().can({ type: 'ACTIVATE_NEXT_PERIOD' }), true)
  actor.stop()
})

test('FINISH_GAME completes the game only after the final period', () => {
  // intermediate RESULTS (next period still queued): FINISH_GAME invalid,
  // ACTIVATE_NEXT_PERIOD valid.
  const intermediate: GameTransitionContext = {
    activePeriodIx: 1,
    totalPeriods: 2,
    segmentCount: 2,
    hasActiveSegment: true,
    hasNextSegment: false,
  }
  const a = createActor(gameMachine, {
    snapshot: snapshotAt(DB.GameStatus.RESULTS, intermediate),
  })
  a.start()
  assert.equal(a.getSnapshot().can({ type: 'FINISH_GAME' }), false)
  assert.equal(a.getSnapshot().can({ type: 'ACTIVATE_NEXT_PERIOD' }), true)
  a.stop()

  // final RESULTS (activePeriodIx advanced to totalPeriods): FINISH_GAME valid,
  // ACTIVATE_NEXT_PERIOD invalid; sending FINISH_GAME reaches COMPLETED.
  const final: GameTransitionContext = {
    activePeriodIx: 2,
    totalPeriods: 2,
    segmentCount: 2,
    hasActiveSegment: true,
    hasNextSegment: false,
  }
  const b = createActor(gameMachine, {
    snapshot: snapshotAt(DB.GameStatus.RESULTS, final),
  })
  b.start()
  assert.equal(b.getSnapshot().can({ type: 'ACTIVATE_NEXT_PERIOD' }), false)
  assert.equal(b.getSnapshot().can({ type: 'FINISH_GAME' }), true)
  b.send({ type: 'FINISH_GAME' })
  assert.equal(b.getSnapshot().value, DB.GameStatus.COMPLETED)
  assert.equal(b.getSnapshot().status, 'done') // COMPLETED is a final state
  b.stop()
})

test('a persisted snapshot round-trips through getPersistedSnapshot/restore', () => {
  const ctx: GameTransitionContext = {
    activePeriodIx: 0,
    totalPeriods: 2,
    segmentCount: 2,
    hasActiveSegment: true,
    hasNextSegment: true,
  }
  const actor = createActor(gameMachine, {
    snapshot: snapshotAt(DB.GameStatus.SCHEDULED, ctx),
  })
  actor.start()
  actor.send({ type: 'ACTIVATE_NEXT_PERIOD' })
  actor.send({ type: 'ACTIVATE_NEXT_SEGMENT' })
  assert.equal(actor.getSnapshot().value, DB.GameStatus.RUNNING)

  const persisted = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()))
  actor.stop()

  const restored = createActor(gameMachine, { snapshot: persisted })
  restored.start()
  assert.equal(restored.getSnapshot().value, DB.GameStatus.RUNNING)
  assert.equal(restored.getSnapshot().can({ type: 'ACTIVATE_NEXT_SEGMENT' }), true)
  restored.stop()
})

// Sanity: GAME_TRANSITIONS itself is internally consistent (targets are valid)
test('every transition target is a known GameStatus', () => {
  for (const byEvent of Object.values(GAME_TRANSITIONS)) {
    for (const transition of Object.values(byEvent) as Array<
      { to: DB.GameStatus } | undefined
    >) {
      if (!transition) continue
      assert.ok(
        ALL_STATUSES.includes(transition.to),
        `target ${transition.to} is a valid GameStatus`
      )
    }
  }
})

void (GAME_EVENTS satisfies readonly GameEvent[])
