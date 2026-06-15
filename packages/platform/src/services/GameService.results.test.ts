import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  computePeriodEndResults,
  computePeriodStartResults,
  computeSegmentEndResults,
  computeSegmentStartResults,
} from './GameService.js'

/**
 * These exercise the result-computation cores as PURE functions: plain data in,
 * plain descriptors out, with a fake `services` bundle and NO Prisma. They pin
 * the descriptor shapes (ActionDescriptor / EventDescriptor) and the period /
 * segment index conventions — the logic that was previously fused with Prisma
 * promises and therefore untestable.
 */

// A fake domain-services bundle. Each hook returns a fixed shape; `calls`
// records the context arguments so tests can assert what was passed in.
function fakeServices(overrides: any = {}) {
  const calls: any = {}
  const record = (name: string, value: any) => (facts: any, ctx: any) => {
    calls[name] = { facts, ctx }
    return value
  }
  const services = {
    PeriodResult: {
      initialize: record('periodInitialize', {
        resultFacts: { pInit: 1 },
        actions: [],
        ...overrides.periodInitialize,
      }),
      start: record('periodStart', {
        resultFacts: { pStart: 1 },
        actions: [],
        ...overrides.periodStart,
      }),
      end: record('periodEnd', {
        resultFacts: { pEnd: 1 },
        actions: [],
        events: [],
        ...overrides.periodEnd,
      }),
    },
    SegmentResult: {
      initialize: record('segInitialize', {
        resultFacts: { sInit: 1 },
        ...overrides.segInitialize,
      }),
      start: record('segStart', {
        resultFacts: { sStart: 1 },
        actions: [],
        ...overrides.segStart,
      }),
      end: record('segEnd', {
        resultFacts: { sEnd: 1 },
        actions: [],
        ...overrides.segEnd,
      }),
    },
  }
  return { services, calls }
}

test('computePeriodStartResults: not-started branch generates initial PERIOD_START results at nextPeriodIx', () => {
  const { services } = fakeServices({
    periodInitialize: {
      resultFacts: { x: 1 },
      actions: [{ type: 'A', facts: { a: 1 }, segment: 2 }],
    },
  })

  const { results, actions } = computePeriodStartResults(
    {
      results: undefined,
      players: [{ id: 'p1', role: 'R' }],
      activePeriodIx: -1,
      game: { id: 7, facts: { g: 1 } },
      periodFacts: { pf: 1 },
    },
    { services }
  )

  assert.deepEqual(results, [
    {
      type: DB.PlayerResultType.PERIOD_START,
      periodIx: 0,
      segmentIx: -1,
      facts: { x: 1 },
      player: { connect: { id: 'p1' } },
      game: { connect: { id: 7 } },
    },
  ])
  assert.deepEqual(actions, [
    { type: 'A', facts: { a: 1 }, segment: 2, playerId: 'p1', periodIx: 0 },
  ])
})

test('computePeriodStartResults: running branch transforms only PERIOD_END results at currentPeriodIx', () => {
  const { services } = fakeServices({
    periodStart: {
      resultFacts: { y: 2 },
      actions: [{ type: 'B', facts: {} }],
    },
  })

  const { results, actions } = computePeriodStartResults(
    {
      results: [
        {
          type: DB.PlayerResultType.PERIOD_END,
          facts: { r: 1 },
          player: { id: 'p1', role: 'R' },
        },
        // must be ignored (not a PERIOD_END result)
        {
          type: DB.PlayerResultType.SEGMENT_END,
          facts: {},
          player: { id: 'pX', role: 'R' },
        },
      ],
      players: [],
      activePeriodIx: 1,
      game: { id: 7, facts: {} },
      periodFacts: {},
    },
    { services }
  )

  assert.equal(results.length, 1)
  assert.equal(results[0].periodIx, 1)
  assert.equal(results[0].segmentIx, -1)
  assert.deepEqual(results[0].player, { connect: { id: 'p1' } })
  assert.deepEqual(actions, [
    {
      type: 'B',
      facts: {},
      segment: undefined,
      playerId: 'p1',
      periodIx: 1,
    },
  ])
})

test('computePeriodEndResults: one EventDescriptor per result; per-player segment-end grouping', () => {
  const { services, calls } = fakeServices({
    periodEnd: {
      resultFacts: { z: 3 },
      actions: [{ type: 'C', facts: {}, segment: 0 }],
      events: [{ e: 1 }],
    },
  })

  const { results, actions, events } = computePeriodEndResults(
    {
      segmentEndResults: [
        { playerId: 'p1', v: 1 },
        { playerId: 'p2', v: 2 },
      ],
      players: [{ id: 'p1' }],
      activeSegmentResults: [
        {
          type: DB.PlayerResultType.SEGMENT_END,
          playerId: 'p1',
          player: {
            id: 'p1',
            role: 'R',
            levelIx: 0,
            experience: 5,
            achievementKeys: ['k'],
          },
          facts: {},
        },
      ],
      periodFacts: {},
      periodDecisions: [{ playerId: 'p1', d: 1 }],
      segmentFacts: {},
      activePeriodIx: 2,
      activeSegmentIx: 0,
      game: { id: 7, facts: {} },
    },
    { services }
  )

  assert.deepEqual(results, [
    {
      type: DB.PlayerResultType.PERIOD_END,
      periodIx: 2,
      facts: { z: 3 },
      player: { connect: { id: 'p1' } },
      game: { connect: { id: 7 } },
    },
  ])
  assert.deepEqual(actions, [
    { type: 'C', facts: {}, segment: 0, playerId: 'p1', periodIx: 2 },
  ])
  assert.deepEqual(events, [
    {
      playerId: 'p1',
      events: [{ e: 1 }],
      periodIx: 2,
      gameId: 7,
      achievementKeys: ['k'],
      experience: 5,
      levelIx: 0,
    },
  ])
  // the player's own vs other players' segment-end results were partitioned
  assert.deepEqual(calls.periodEnd.ctx.segmentEndResults, [
    { playerId: 'p1', v: 1 },
  ])
  assert.deepEqual(calls.periodEnd.ctx.otherPlayersSegmentEndResults, [
    { playerId: 'p2', v: 2 },
  ])
  assert.deepEqual(calls.periodEnd.ctx.consolidationDecisions, {
    playerId: 'p1',
    d: 1,
  })
})

test('computePeriodEndResults: pushes one EventDescriptor per result even when the domain emits no events', () => {
  // mirrors the original behaviour: a thunk was queued per result regardless of
  // whether the domain produced events, so receiveEvents still runs per player.
  const { services } = fakeServices({
    periodEnd: { resultFacts: {}, actions: [], events: [] },
  })

  const { events } = computePeriodEndResults(
    {
      segmentEndResults: [],
      players: [{ id: 'p1' }],
      activeSegmentResults: [
        {
          type: DB.PlayerResultType.SEGMENT_END,
          playerId: 'p1',
          player: {
            id: 'p1',
            role: 'R',
            levelIx: 0,
            experience: 0,
            achievementKeys: [],
          },
          facts: {},
        },
      ],
      periodFacts: {},
      periodDecisions: [],
      segmentFacts: {},
      activePeriodIx: 0,
      activeSegmentIx: 0,
      game: { id: 7, facts: {} },
    },
    { services }
  )

  assert.equal(events.length, 1)
  assert.deepEqual(events[0]!.events, [])
})

test('computeSegmentStartResults: first-segment branch turns PERIOD_START into a SEGMENT_START/END pair at segmentIx 0', () => {
  const { services } = fakeServices({
    segInitialize: { resultFacts: { i: 1 } },
  })

  const { results, actions } = computeSegmentStartResults(
    {
      id: 7,
      facts: {},
      activePeriodIx: 0,
      activePeriodId: 99,
      activePeriod: {
        activeSegmentIx: -1,
        facts: {},
        segments: [{ facts: { s0: 1 }, nextSegment: { facts: {} } }],
        results: [
          {
            type: DB.PlayerResultType.PERIOD_START,
            playerId: 'p1',
            player: { role: 'R' },
            facts: {},
          },
        ],
      },
    },
    { services }
  )

  assert.equal(results.length, 2)
  assert.deepEqual(
    results.map((r: any) => r.type),
    [DB.PlayerResultType.SEGMENT_START, DB.PlayerResultType.SEGMENT_END]
  )
  for (const r of results as any[]) {
    assert.equal(r.periodIx, 0)
    assert.equal(r.segmentIx, 0)
    assert.deepEqual(r.facts, { i: 1 })
    assert.deepEqual(r.player, { connect: { id: 'p1' } })
    assert.deepEqual(r.period, { connect: { id: 99 } })
    assert.deepEqual(r.game, { connect: { id: 7 } })
  }
  // initialize produces no actions
  assert.deepEqual(actions, [])
})

test('computeSegmentStartResults: throws when the active period has no segments', () => {
  const { services } = fakeServices()
  assert.throws(
    () =>
      computeSegmentStartResults(
        {
          id: 7,
          facts: {},
          activePeriodIx: 0,
          activePeriodId: 99,
          activePeriod: { activeSegmentIx: -1, facts: {}, segments: [], results: [] },
        },
        { services }
      ),
    /no segments exist in the active period/
  )
})

test('computeSegmentStartResults: subsequent-segment branch advances to nextSegmentIx and emits actions', () => {
  const { services } = fakeServices({
    segStart: {
      resultFacts: { s: 1 },
      actions: [{ type: 'D', facts: {} }],
    },
  })

  const { results, actions } = computeSegmentStartResults(
    {
      id: 7,
      facts: {},
      // non-zero so the action's periodIx is pinned to activePeriodIx, not 0
      activePeriodIx: 2,
      activePeriodId: 99,
      activePeriod: {
        activeSegmentIx: 0,
        facts: {},
        segments: [{}, {}],
        activeSegment: {
          facts: {},
          nextSegment: { facts: {} },
          results: [
            {
              type: DB.PlayerResultType.SEGMENT_END,
              playerId: 'p1',
              player: { id: 'p1', role: 'R' },
              facts: {},
            },
          ],
        },
      },
    },
    { services }
  )

  assert.equal(results.length, 2)
  // segmentIx advances independently of the period index
  for (const r of results as any[]) assert.equal(r.segmentIx, 1)
  assert.deepEqual(actions, [
    { type: 'D', facts: {}, segment: undefined, playerId: 'p1', periodIx: 2 },
  ])
})

test('computeSegmentEndResults: produces SEGMENT_END update descriptors keyed by composite id', () => {
  const { services } = fakeServices({
    segEnd: {
      resultFacts: { e: 1 },
      actions: [{ type: 'E', facts: {}, segment: 0 }],
    },
  })

  const { results, actions } = computeSegmentEndResults(
    {
      id: 7,
      facts: {},
      activePeriodIx: 0,
      activePeriod: {
        activeSegmentIx: 0,
        facts: {},
        activeSegment: {
          facts: {},
          results: [
            {
              type: DB.PlayerResultType.SEGMENT_END,
              playerId: 'p1',
              player: { id: 'p1', role: 'R' },
              facts: {},
            },
          ],
        },
      },
    },
    { services }
  )

  assert.deepEqual(results, [
    {
      where: {
        periodIx_segmentIx_playerId_type: {
          periodIx: 0,
          segmentIx: 0,
          playerId: 'p1',
          type: DB.PlayerResultType.SEGMENT_END,
        },
      },
      data: {
        facts: { e: 1 },
        game: { connect: { id: 7 } },
      },
    },
  ])
  assert.deepEqual(actions, [
    { type: 'E', facts: {}, segment: 0, playerId: 'p1', periodIx: 0 },
  ])
})
