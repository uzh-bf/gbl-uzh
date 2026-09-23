import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ResultQuery } from '../graphql/generated/ops'
import { FIRST_GAME_YEAR } from './constants'
import { learningXP, storyLibrary, teamStatistics } from './team'

const story = (id: string) => ({
  id,
  title: id,
  type: 'GENERIC',
  content: 'Story',
})
const period = (index: number, activeSegmentIx: number, cards: string[][]) => ({
  id: `p${index}`,
  index,
  activeSegmentIx,
  segments: cards.map((ids, ix) => ({
    id: `p${index}s${ix}`,
    index: ix,
    storyElements: ids.map(story),
  })),
})
const asData = (data: unknown) => data as ResultQuery

test('story library hides future content and retains first-release metadata on repeats', () => {
  const first = period(0, 1, [
    ['B', 'A'],
    ['C', 'A'],
  ])
  const current = period(1, 0, [['D', 'A'], ['Future']])
  const data = asData({
    result: {
      currentGame: {
        periods: [current, first, period(2, -1, [['Later']])],
        activePeriod: current,
      },
    },
  })
  const entries = storyLibrary(data)
  assert.deepEqual(
    entries.map((entry) => entry.story.id),
    ['D', 'C', 'A', 'B']
  )
  const a = entries.find((entry) => entry.story.id === 'A')!
  assert.equal(a.sequence.year, FIRST_GAME_YEAR)
  assert.equal(a.sequence.quarter, 1)
  assert.equal(a.index, 0)
  assert.deepEqual(
    a.sequence.stories.map((item) => item.id),
    ['A', 'B']
  )
})

test('story archive survives upcoming and disconnected period pointers in results', () => {
  const done = period(0, -1, [['A'], ['B']])
  const upcoming = period(1, -1, [['Future']])
  const data = asData({
    result: {
      previousResults: [{ type: 'PERIOD_END', period: done }],
      currentGame: {
        status: 'RESULTS',
        periods: [done, upcoming],
        activePeriod: upcoming,
      },
    },
  })
  assert.deepEqual(
    storyLibrary(data).map((entry) => entry.story.id),
    ['B', 'A']
  )
  data.result!.currentGame!.activePeriod = null
  assert.deepEqual(
    storyLibrary(data).map((entry) => entry.story.id),
    ['B', 'A']
  )
  assert.deepEqual(storyLibrary(asData({})), [])
})

test('team value and last quarter use settled balances, not the cumulative return', () => {
  const first = period(0, 0, [[]])
  const facts = {
    initialCapital: 10000,
    assetsWithReturns: [
      { ix: 0, totalAssets: 12000 },
      { ix: 1, totalAssets: 12600 },
    ],
  }
  const data = asData({
    result: {
      playerResult: { facts },
      previousResults: [
        {
          type: 'SEGMENT_END',
          period: first,
          segment: { id: 'p0s0', index: 0 },
          facts,
        },
      ],
      currentGame: { status: 'RUNNING', periods: [first], activePeriod: first },
    },
  })
  assert.deepEqual(teamStatistics(data), { value: 10000, lastQuarter: null })
  data.result!.currentGame!.status = 'PAUSED' as never
  assert.deepEqual(teamStatistics(data), { value: 12600, lastQuarter: 0.05 })
  facts.assetsWithReturns[0].totalAssets = 0
  assert.equal(teamStatistics(data).lastQuarter, null)
  facts.assetsWithReturns = []
  assert.deepEqual(teamStatistics(data), { value: null, lastQuarter: null })
})

test('XP badges accept only configured finite nonnegative reward.xp', () => {
  for (const value of [
    null,
    undefined,
    20,
    '20',
    {},
    { xp: '20' },
    { xp: NaN },
    { xp: -1 },
  ])
    assert.equal(learningXP(value), null)
  assert.equal(learningXP({ xp: 0 }), 0)
  assert.equal(learningXP({ xp: 20 }), 20)
})
