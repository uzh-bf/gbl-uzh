import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  latestRevealedRoll,
  marketPeriod,
  parseMarketFacts,
  readMarketRoll,
  readScenario,
} from './market'

const facts = {
  diceRolls: [
    { shared: 3, bonds: 5, stocks: 9 },
    { shared: 6, bonds: 7, stocks: 12 },
  ],
  returns: [
    { bank: 0.004, bonds: -0.02, stocks: 0.1 },
    { bank: 0.004, bonds: 0.01, stocks: 0.2 },
  ],
  revealedRollIndices: [0, 1],
}

test('read persisted rolls safely without computing or inventing results', () => {
  assert.deepEqual(readMarketRoll(JSON.stringify(JSON.stringify(facts)), 0), {
    dice: facts.diceRolls[0],
    returns: facts.returns[0],
  })
  for (const raw of [
    null,
    '{',
    { diceRolls: [null], returns: [null] },
    { ...facts, diceRolls: [{ shared: 3, bonds: 3, stocks: 13 }] },
  ])
    assert.equal(readMarketRoll(raw, 0), null)
  for (const index of [-1, 0.5, 2])
    assert.equal(readMarketRoll(facts, index), null)
  assert.deepEqual(parseMarketFacts('bad'), {})
  assert.equal(readScenario({}), null)
})

test('latest reveal uses chronological order, persists over years, and excludes future segments', () => {
  const game = {
    activePeriod: { index: 1, activeSegmentIx: 0 },
    periods: [
      {
        index: 1,
        segments: [
          { id: 'future', index: 1, facts },
          {
            id: 'current',
            index: 0,
            facts: { ...facts, revealedRollIndices: [] },
          },
        ],
      },
      {
        index: 0,
        segments: [
          { id: 'older', index: 0, facts },
          {
            id: 'last',
            index: 3,
            facts: { ...facts, revealedRollIndices: [1, 0, 1] },
          },
        ],
      },
    ],
  } as unknown as Parameters<typeof latestRevealedRoll>[0]
  const result = latestRevealedRoll(game)
  assert.equal(result.segmentId, 'last')
  assert.equal(result.index, 1)
  assert.equal(result.label, '2026 · Quarter 4 · Month 2')
  assert.equal(result.roll.returns.bank, 0.004)
  game.periods[0].segments[1].facts.revealedRollIndices = [0]
  assert.equal(latestRevealedRoll(game).segmentId, 'current')
  game.periods.forEach((period) =>
    period.segments.forEach((segment) => {
      segment.facts = { ...segment.facts, revealedRollIndices: [] }
    })
  )
  assert.equal(latestRevealedRoll(game), null)
})

test('final results retain the last period after the active pointer disconnects', () => {
  const scenario = {
    trendBonds: -0.001,
    gapBonds: 0.004,
    trendStocks: 0.013,
    gapStocks: 0.06,
    interestBank: 0.004,
  }
  const game = {
    status: 'RESULTS',
    activePeriod: null,
    periods: [
      {
        id: '1',
        index: 0,
        activeSegmentIx: 1,
        facts: { scenario },
        segments: [{ id: 'last', index: 1, facts }],
      },
    ],
  } as unknown as Parameters<typeof latestRevealedRoll>[0]
  assert.equal(latestRevealedRoll(game).label, '2026 · Quarter 2 · Month 2')
  assert.deepEqual(readScenario(marketPeriod(game).facts), scenario)
})
