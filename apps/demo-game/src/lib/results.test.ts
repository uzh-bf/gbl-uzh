import { describe, expect, test } from 'vitest'
import type { ResultQuery } from '../graphql/generated/ops'
import { FIRST_GAME_YEAR } from './constants'
import { parseFacts } from './facts'
import {
  balanceMix,
  buildHistory,
  buildResultView,
  compoundReturns,
  difference,
  finiteNumber,
  playerAmount,
  playerPercent,
  readAllocation,
  readBalanceSamples,
  readInitialCapital,
} from './results'

const assets = (total: number) => ({
  bank: total * 0.5,
  bonds: total * 0.3,
  stocks: total * 0.2,
  totalAssets: total,
})
const facts = (start = 10000, end = 10200) => ({
  initialCapital: 10000,
  decisions: { bank: 50, bonds: 30, stocks: 20 },
  assets: assets(end),
  returns: { bank: 99, bonds: 42, stocks: -1 },
  assetsWithReturns: [start, start + 100, start - 50, end].map((total, ix) => ({
    ix,
    ...assets(total),
    bankBenchmark: 10000 + ix * 10,
    bondsBenchmark: 10000 + ix * 20,
    stocksBenchmark: 10000 - ix * 10,
    bankReturn: 0.002,
    bondsReturn: [0, 0.1, -0.05, 0.02][ix],
    stocksReturn: -0.01,
  })),
})
const row = (
  p: number,
  s: number,
  type = 'SEGMENT_END',
  raw: unknown = facts()
) => ({
  id: `${p}-${s}-${type}`,
  period: { id: `p${p}`, index: p },
  segment: s >= 0 ? { id: `s${p}-${s}`, index: s } : null,
  type,
  facts: raw,
})
function fixture() {
  return {
    result: {
      playerResult: { facts: facts() },
      previousResults: [
        row(0, -1, 'PERIOD_START', {
          initialCapital: 10000,
          assets: assets(10000),
        }),
        row(0, 0),
      ],
      currentGame: {
        id: '1',
        status: 'PAUSED',
        activePeriod: { id: 'p0', index: 0, activeSegmentIx: 0 },
        periods: [
          {
            id: 'p0',
            index: 0,
            activeSegmentIx: 0,
            segmentCount: 1,
            facts: { rollsPerSegment: 3 },
            segments: [],
          },
        ],
      },
    },
  }
}
const build = (data: ReturnType<typeof fixture>) =>
  buildResultView(data as unknown as ResultQuery)

test('quarter view uses settled balances, month order, benchmarks and cumulative return', () => {
  const data = fixture()
  // Deliberately unordered, with future working results carrying old samples.
  data.result.previousResults.unshift(row(0, 1))
  const view = build(data)
  expect(view.year).toBe(FIRST_GAME_YEAR)
  expect(view.quarter).toBe(1)
  expect(view.opening.label).toBe('Start')
  expect(view.quarterGain).toBe(200)
  expect(view.current.totalAssets).toBe(10200)
  expect(view.monthRange).toBe('Jan – Mar')
  expect(view.monthly.map((sample) => sample.label)).toStrictEqual([
    'Jan',
    'Feb',
    'Mar',
  ])
  expect(view.monthly[2].bondsBenchmark).toBe(10060)
  expect(Math.abs(view.accumulatedReturn - 0.02) < 1e-12).toBeTruthy()
  expect(view.allocation).toStrictEqual({ bank: 50, bonds: 30, stocks: 20 })
  data.result.currentGame.status = 'RUNNING'
  expect(build(data)).toBe(null)
})

test('consolidation compares current persisted assets with final quarter close', () => {
  const data = fixture()
  data.result.currentGame.status = 'CONSOLIDATION'
  expect(build(data).consolidationChange).toBe(0)
  data.result.playerResult.facts.assets = assets(10225)
  expect(build(data).consolidationChange).toBe(25)
  expect(build(data).close.totalAssets).toBe(10200)
})

test('year results use PERIOD_END despite upcoming or disconnected pointers', () => {
  const data = fixture()
  data.result.currentGame.status = 'RESULTS'
  data.result.previousResults.push(row(0, -1, 'PERIOD_END'))
  data.result.previousResults.push(
    row(1, -1, 'PERIOD_START', {
      initialCapital: 10000,
      assets: assets(10200),
    }),
    row(1, 0, 'SEGMENT_END', facts(10200, 10500)),
    row(1, -1, 'PERIOD_END', facts(10200, 10500)),
    row(2, 0)
  )
  data.result.currentGame.activePeriod = {
    id: 'p2',
    index: 2,
    activeSegmentIx: -1,
  }
  const view = build(data)
  expect(view.year).toBe(FIRST_GAME_YEAR + 1)
  expect(view.current.totalAssets).toBe(10500)
  expect(view.yearGain).toBe(300)
  expect(view.years.map((year) => year.gain)).toStrictEqual([200, 300])
  expect(Math.abs(view.accumulatedReturn - 0.05) < 1e-12).toBeTruthy()
  expect(
    Math.abs(view.annualReturns.bonds - (1.1 * 0.95 * 1.02 - 1)) < 1e-12
  ).toBeTruthy()
  expect(
    Math.abs(view.annualReturns.stocks - (0.99 ** 3 - 1)) < 1e-12
  ).toBeTruthy()
  data.result.currentGame.activePeriod = null
  expect(build(data)).toStrictEqual(view)
})

test('multiple quarters omit duplicate boundaries and compound all monthly market rates', () => {
  const data = fixture()
  data.result.currentGame.activePeriod.activeSegmentIx = 1
  data.result.currentGame.periods[0].segmentCount = 2
  data.result.previousResults.push(row(0, 1, 'SEGMENT_END', facts(10200, 9800)))
  const view = build(data)
  expect(view.quarter).toBe(2)
  expect(view.opening.label).toBe('Mar')
  expect(view.monthRange).toBe('Apr – Jun')
  expect(view.monthly.length).toBe(6)
  expect(view.quarterGain).toBe(-400)
  expect(Math.abs(view.accumulatedReturn - -0.02) < 1e-12).toBeTruthy()
  expect(
    Math.abs(view.annualReturns.bonds - ((1.1 * 0.95 * 1.02) ** 2 - 1)) < 1e-12
  ).toBeTruthy()
})

test('missing and encoded facts never become invented balances or returns', () => {
  const data = fixture()
  data.result.previousResults[1].facts = JSON.stringify(JSON.stringify(facts()))
  expect(build(data).current.totalAssets).toBe(10200)
  for (const raw of [
    null,
    '{',
    {},
    { assetsWithReturns: [{ ix: 0 }, { ix: 2 }] },
  ]) {
    data.result.previousResults[1].facts = raw
    const view = build(data)
    expect(view.current.totalAssets).toBe(null)
    expect(view.quarterGain).toBe(null)
    expect(view.accumulatedReturn).toBe(null)
    expect(view.annualReturns.bank).toBe(null)
    expect(view.monthly.length).toBe(3)
    expect(
      view.monthly.every((sample) => sample.totalAssets === null)
    ).toBeTruthy()
  }
  expect(buildResultView({} as ResultQuery)).toBe(null)
})

test('mix derives from holdings and supports zero asset allocations', () => {
  expect(
    balanceMix({ bank: 100, bonds: 0, stocks: 0, totalAssets: 100 })
  ).toStrictEqual({ bank: 100, bonds: 0, stocks: 0 })
  expect(balanceMix({ bank: 0, bonds: 0, stocks: 0, totalAssets: 0 })).toBe(
    null
  )
  expect(
    balanceMix({ bank: 100, bonds: null, stocks: 0, totalAssets: 100 })
  ).toBe(null)
  expect(balanceMix({ bank: 100, bonds: -1, stocks: 0, totalAssets: 99 })).toBe(
    null
  )
})

test('a missing current quarter stays unavailable instead of showing an earlier close', () => {
  const data = fixture()
  data.result.currentGame.activePeriod.activeSegmentIx = 1
  const view = build(data)
  expect(view.quarter).toBe(2)
  expect(view.current.totalAssets).toBe(null)
  expect(view.quarterGain).toBe(null)
  expect(view.opening.label).toBe('Mar')
  expect(
    view.monthly.slice(3).every((sample) => sample.totalAssets === null)
  ).toBeTruthy()
})

test('an incomplete year cannot report a partial annual market return', () => {
  const data = fixture()
  data.result.currentGame.status = 'RESULTS'
  data.result.currentGame.periods[0].segmentCount = 2
  data.result.previousResults.push(row(0, -1, 'PERIOD_END'))
  expect(build(data).annualReturns.bank).toBe(null)
})

test('year-end progress retains the final quarter when its result is missing', () => {
  const data = fixture()
  data.result.currentGame.status = 'RESULTS'
  data.result.currentGame.activePeriod = null
  data.result.currentGame.periods[0].activeSegmentIx = 3
  data.result.currentGame.periods[0].segmentCount = 4
  data.result.previousResults.push(row(0, -1, 'PERIOD_END'))
  const view = build(data)
  expect(view.quarter).toBe(4)
  expect(view.monthly.length).toBe(12)
  expect(view.close.totalAssets).toBe(null)
  expect(view.current.totalAssets).toBe(10200)
})

test('year gain requires a real opening balance, not the earliest surviving quarter', () => {
  const data = fixture()
  data.result.currentGame.status = 'RESULTS'
  data.result.previousResults = [
    row(0, 1, 'SEGMENT_END', facts(10200, 10500)),
    row(0, -1, 'PERIOD_END', facts(10200, 10500)),
  ]
  expect(build(data).yearGain).toBe(null)
  data.result.previousResults.push(row(0, 0))
  expect(build(data).yearGain).toBe(500)
})

test('facts accept objects and legacy encodings, without accepting arrays or primitives', () => {
  const facts = { avatar: 'bear', initialCapital: 0 }
  expect(parseFacts(facts)).toBe(facts)
  for (const raw of [
    JSON.stringify(facts),
    JSON.stringify(JSON.stringify(facts)),
  ])
    expect(parseFacts(raw)).toStrictEqual(facts)
  for (const raw of [
    null,
    undefined,
    0,
    false,
    [],
    '{} broken',
    'null',
    '[1]',
    JSON.stringify(JSON.stringify(JSON.stringify(facts))),
  ])
    expect(parseFacts(raw)).toStrictEqual({})
})

test('numeric helpers preserve missing data, zero, and finite losses', () => {
  for (const raw of [null, undefined, '1', NaN, Infinity, -Infinity])
    expect(finiteNumber(raw)).toBe(null)
  expect(finiteNumber(0)).toBe(0)
  expect(finiteNumber(-0.1)).toBe(-0.1)
  expect(difference(0, 2)).toBe(-2)
  expect(difference(null, 2)).toBe(null)
  expect(difference(2, null)).toBe(null)
  expect(difference(Number.MAX_VALUE, -Number.MAX_VALUE)).toBe(null)
  expect(compoundReturns([])).toBe(null)
  expect(compoundReturns([0.1, null])).toBe(null)
  expect(compoundReturns([Infinity])).toBe(null)
  expect(compoundReturns([NaN])).toBe(null)
  expect(compoundReturns([0, 0])).toBe(0)
  expect(compoundReturns([-1, 0.2])).toBe(-1)
  expect(compoundReturns([0.1, -0.05, 0.02])).toBe(1.1 * 0.95 * 1.02 - 1)
})

test('saved allocations retain decimal validation without coercing stored strings', () => {
  const allocation = { bank: 33.3, bonds: 33.3, stocks: 33.4 }
  expect(readAllocation(JSON.stringify(allocation))).toStrictEqual(allocation)
  for (const raw of [
    null,
    { bank: 100 },
    { bank: '100', bonds: 0, stocks: 0 },
    { bank: 33.33, bonds: 33.33, stocks: 33.34 },
  ])
    expect(readAllocation(raw)).toBe(null)
})

test('balance samples require an opening record and contiguous indices', () => {
  const samples = [
    { ix: 0, totalAssets: 100 },
    { ix: 1, totalAssets: 90 },
  ]
  expect(readBalanceSamples({ assetsWithReturns: samples })).toStrictEqual(
    samples
  )
  expect(
    readBalanceSamples(
      JSON.stringify({
        assetsWithReturns: samples.map((sample) => JSON.stringify(sample)),
      })
    )
  ).toStrictEqual(samples)
  for (const samples of [
    [],
    [{ ix: 0 }],
    [{ ix: 1 }, { ix: 2 }],
    [{ ix: 0 }, { ix: 2 }],
    [null, { ix: 1 }],
  ])
    expect(readBalanceSamples({ assetsWithReturns: samples })).toStrictEqual([])
})

test('initial capital uses the first recorded finite value, including zero, then current facts', () => {
  expect(
    readInitialCapital([{ facts: {} }, { facts: { initialCapital: 0 } }], {
      initialCapital: 10,
    })
  ).toBe(0)
  expect(
    readInitialCapital(
      [{ facts: { initialCapital: NaN } }],
      JSON.stringify({ initialCapital: 10 })
    )
  ).toBe(10)
  expect(
    readInitialCapital(
      [
        { facts: JSON.stringify({ initialCapital: 100 }) },
        { facts: { initialCapital: 200 } },
      ],
      { initialCapital: 300 }
    )
  ).toBe(100)
  expect(readInitialCapital([], {})).toBe(null)
})

test('player formatting keeps Swiss separators, signed rounding and neutral zero', () => {
  expect(playerAmount(1234.5)).toBe("1'234.50")
  expect(playerAmount(-1.005, true)).toBe('-1.01')
  for (const zero of [0, -0, 0.001, -0.001])
    expect(playerAmount(zero, true)).toBe('0.00')
  expect(playerPercent(0.000001)).toBe('0.00%')
  expect(playerPercent(-0.000001)).toBe('0.00%')
  expect(playerAmount(null)).toBe('—')
})

test('legacy month overrides cannot change quarter month ranges', () => {
  const data = fixture()
  data.result.currentGame.periods[0].facts.rollsPerSegment = 5
  const view = buildResultView(data as unknown as ResultQuery)
  expect(view.monthRange).toBe('Jan – Mar')
  expect(view.quarterMonths.length).toBe(3)
})

describe('history', () => {
  const facts = {
    initialCapital: 10000,
    decisions: { bank: 50, bonds: 30, stocks: 20 },
    // These are affected by rebalancing and must not supply market returns.
    returns: { bonds: 42, stocks: 99 },
    assetsWithReturns: [
      { ix: 0, totalAssets: 10000 },
      {
        ix: 1,
        totalAssets: 10100,
        bankReturn: 0.002,
        bondsReturn: 0.1,
        stocksReturn: -0.1,
      },
      {
        ix: 2,
        totalAssets: 10050,
        bankReturn: 0.002,
        bondsReturn: -0.05,
        stocksReturn: 0.1,
      },
      {
        ix: 3,
        totalAssets: 10200,
        bankReturn: 0.002,
        bondsReturn: 0.02,
        stocksReturn: 0.01,
      },
    ],
  }
  const period = (index: number) => ({ id: `p${index}`, index })
  const row = (
    p: number,
    s: number,
    type = 'SEGMENT_END',
    raw: unknown = facts
  ) => ({
    id: `${p}-${s}-${type}`,
    type,
    period: period(p),
    segment: { id: `${p}-${s}`, index: s },
    facts: raw,
  })
  function fixture() {
    return {
      result: {
        playerResult: { facts },
        previousResults: [row(0, -1, 'PERIOD_START'), row(0, 0)],
        currentGame: {
          status: 'RUNNING',
          activePeriod: { ...period(0), activeSegmentIx: 0 },
          periods: [
            {
              ...period(0),
              segments: [
                {
                  id: '0-0',
                  index: 0,
                  facts: {
                    revealedRollIndices: [1],
                    diceRolls: Array.from({ length: 3 }, () => ({
                      shared: 3,
                      bonds: 8,
                      stocks: 6,
                    })),
                    returns: Array.from({ length: 3 }, () => ({
                      bank: 0.002,
                      bonds: 0.01,
                      stocks: 0.02,
                    })),
                  },
                },
              ],
            },
          ],
        },
      },
    }
  }
  const history = (data: ReturnType<typeof fixture>) =>
    buildHistory(data as unknown as ResultQuery)

  test('live SEGMENT_END records never count, even with carried-forward samples', () => {
    const data = fixture()
    expect(history(data).quarters.length).toBe(0)
    expect(history(data).value).toBe(10000)
    expect(history(data).gain).toBe(0)
    data.result.previousResults.push(row(0, 1), row(0, 2))
    data.result.currentGame.activePeriod.activeSegmentIx = 1
    expect(history(data).quarters.map((q) => q.quarter)).toStrictEqual([1])
    for (const status of ['PAUSED', 'CONSOLIDATION']) {
      data.result.currentGame.status = status
      expect(history(data).quarters.map((q) => q.quarter)).toStrictEqual([1, 2])
    }
  })

  test('settled amounts, saved mix and compounded returns come from persisted samples', () => {
    const data = fixture()
    data.result.currentGame.status = 'PAUSED'
    const result = history(data)
    const quarter = result.quarters[0]
    expect(result.value).toBe(10200)
    expect(result.gain).toBe(200)
    expect(result.gainRate).toBe(0.02)
    expect(quarter.gain).toBe(200)
    expect(quarter.allocation).toStrictEqual(facts.decisions)
    expect(
      Math.abs(quarter.bonds - (1.1 * 0.95 * 1.02 - 1)) < 1e-12
    ).toBeTruthy()
    expect(
      Math.abs(quarter.stocks - (0.9 * 1.1 * 1.01 - 1)) < 1e-12
    ).toBeTruthy()
    expect(quarter.months.map((month) => month.gain)).toStrictEqual([
      100, -50, 150,
    ])
    expect(
      quarter.months.map((month) => month.dice?.bonds ?? null)
    ).toStrictEqual([null, 8, null])
    data.result.currentGame.periods[0].segments[0].facts.revealedRollIndices.push(
      0
    )
    expect(history(data).quarters[0].months[0].dice.bonds).toBe(8)
  })

  test('cross-year ordering, upcoming RESULTS pointers and disconnected final pointers', () => {
    const data = fixture()
    data.result.previousResults = [
      row(1, 0),
      row(0, 1),
      row(0, -1, 'PERIOD_END'),
      row(0, 0),
      row(1, -1, 'PERIOD_START'),
    ]
    data.result.currentGame.activePeriod = { ...period(1), activeSegmentIx: 0 }
    expect(history(data).quarters.map((q) => q.label)).toStrictEqual([
      '26 Q1',
      '26 Q2',
    ])
    expect(history(data).years).toStrictEqual([
      FIRST_GAME_YEAR,
      FIRST_GAME_YEAR + 1,
    ])
    data.result.currentGame.status = 'CONSOLIDATION'
    expect(history(data).quarters.length).toBe(3)
    data.result.previousResults.push(row(1, -1, 'PERIOD_END'))
    data.result.currentGame.status = 'RESULTS'
    data.result.currentGame.activePeriod = { ...period(2), activeSegmentIx: -1 }
    expect(history(data).years).toStrictEqual([
      FIRST_GAME_YEAR,
      FIRST_GAME_YEAR + 1,
    ])
    expect(history(data).quarters.length).toBe(3)
    data.result.currentGame.activePeriod = null
    expect(history(data).quarters.length).toBe(3)
    expect(history(data).years).toStrictEqual([
      FIRST_GAME_YEAR,
      FIRST_GAME_YEAR + 1,
    ])
  })

  test('missing, malformed and double-encoded facts degrade without inventing values', () => {
    const data = fixture()
    data.result.currentGame.status = 'PAUSED'
    data.result.previousResults[1].facts = JSON.stringify(JSON.stringify(facts))
    expect(history(data).value).toBe(10200)
    for (const raw of [
      null,
      '{',
      {},
      { ...facts, assetsWithReturns: [null] },
      { ...facts, assetsWithReturns: [{ ix: 0 }, { ix: 3 }] },
    ]) {
      data.result.previousResults[1].facts = raw
      const result = history(data)
      expect(result.value).toBe(null)
      expect(result.quarters[0].bonds).toBe(null)
      expect(result.quarters[0].months.length).toBe(0)
    }
    data.result.previousResults[1].facts = {
      ...facts,
      decisions: { bank: 0 },
      assetsWithReturns: [
        facts.assetsWithReturns[0],
        { ix: 1, totalAssets: 9900 },
      ],
    }
    const quarter = history(data).quarters[0]
    expect(quarter.allocation).toBe(null)
    expect(quarter.bonds).toBe(null)
    expect(quarter.gain).toBe(-100)
    expect(buildHistory({} as ResultQuery).value).toBe(null)
  })

  test('formats Swiss amounts and signed returns without negative zero', () => {
    expect(playerAmount(10140.86)).toBe("10'140.86")
    expect(playerAmount(140.86, true)).toBe('+140.86')
    expect(playerAmount(-0.001, true)).toBe('0.00')
    expect(playerAmount(-1.005, true)).toBe('-1.01')
    expect(playerPercent(-0.019)).toBe('-1.90%')
    expect(playerPercent(0.0141)).toBe('+1.41%')
    expect(playerPercent(null)).toBe('—')
  })
})
