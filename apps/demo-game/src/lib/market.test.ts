import { expect, test } from 'vitest'
import { FIRST_GAME_YEAR } from './constants'
import { parseFacts } from './facts'
import {
  latestRevealedRoll,
  marketPeriod,
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
  expect(
    readMarketRoll(JSON.stringify(JSON.stringify(facts)), 0)
  ).toStrictEqual({
    dice: facts.diceRolls[0],
    returns: facts.returns[0],
  })
  for (const raw of [
    null,
    '{',
    { diceRolls: [null], returns: [null] },
    { ...facts, diceRolls: [{ shared: 3, bonds: 3, stocks: 13 }] },
  ])
    expect(readMarketRoll(raw, 0)).toBe(null)
  for (const index of [-1, 0.5, 2])
    expect(readMarketRoll(facts, index)).toBe(null)
  expect(parseFacts('bad')).toStrictEqual({})
  expect(readScenario({})).toBe(null)
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
  expect(result.segmentId).toBe('last')
  expect(result.index).toBe(1)
  expect(result.label).toBe(`${FIRST_GAME_YEAR} · Quarter 4 · Month 2`)
  expect(result.roll.returns.bank).toBe(0.004)
  game.periods[0].segments[1].facts.revealedRollIndices = [0]
  expect(latestRevealedRoll(game).segmentId).toBe('current')
  game.periods.forEach((period) =>
    period.segments.forEach((segment) => {
      segment.facts = { ...segment.facts, revealedRollIndices: [] }
    })
  )
  expect(latestRevealedRoll(game)).toBe(null)
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
  expect(latestRevealedRoll(game).label).toBe(
    `${FIRST_GAME_YEAR} · Quarter 2 · Month 2`
  )
  expect(readScenario(marketPeriod(game).facts)).toStrictEqual(scenario)
})
