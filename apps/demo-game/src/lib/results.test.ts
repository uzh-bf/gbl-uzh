import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ResultQuery } from '../graphql/generated/ops'
import { parseFacts } from './facts'
import {
  balanceMix,
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
  assert.equal(view.year, 2026)
  assert.equal(view.quarter, 1)
  assert.equal(view.opening.label, 'Start')
  assert.equal(view.quarterGain, 200)
  assert.equal(view.current.totalAssets, 10200)
  assert.equal(view.monthRange, 'Jan – Mar')
  assert.deepEqual(
    view.monthly.map((sample) => sample.label),
    ['Jan', 'Feb', 'Mar']
  )
  assert.equal(view.monthly[2].bondsBenchmark, 10060)
  assert.ok(Math.abs(view.accumulatedReturn - 0.02) < 1e-12)
  assert.deepEqual(view.allocation, { bank: 50, bonds: 30, stocks: 20 })
  data.result.currentGame.status = 'RUNNING'
  assert.equal(build(data), null)
})

test('consolidation compares current persisted assets with final quarter close', () => {
  const data = fixture()
  data.result.currentGame.status = 'CONSOLIDATION'
  assert.equal(build(data).consolidationChange, 0)
  data.result.playerResult.facts.assets = assets(10225)
  assert.equal(build(data).consolidationChange, 25)
  assert.equal(build(data).close.totalAssets, 10200)
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
  assert.equal(view.year, 2027)
  assert.equal(view.current.totalAssets, 10500)
  assert.equal(view.yearGain, 300)
  assert.deepEqual(
    view.years.map((year) => year.gain),
    [200, 300]
  )
  assert.ok(Math.abs(view.accumulatedReturn - 0.05) < 1e-12)
  assert.ok(
    Math.abs(view.annualReturns.bonds - (1.1 * 0.95 * 1.02 - 1)) < 1e-12
  )
  assert.ok(Math.abs(view.annualReturns.stocks - (0.99 ** 3 - 1)) < 1e-12)
  data.result.currentGame.activePeriod = null
  assert.deepEqual(build(data), view)
})

test('multiple quarters omit duplicate boundaries and compound all monthly market rates', () => {
  const data = fixture()
  data.result.currentGame.activePeriod.activeSegmentIx = 1
  data.result.currentGame.periods[0].segmentCount = 2
  data.result.previousResults.push(row(0, 1, 'SEGMENT_END', facts(10200, 9800)))
  const view = build(data)
  assert.equal(view.quarter, 2)
  assert.equal(view.opening.label, 'Mar')
  assert.equal(view.monthRange, 'Apr – Jun')
  assert.equal(view.monthly.length, 6)
  assert.equal(view.quarterGain, -400)
  assert.ok(Math.abs(view.accumulatedReturn - -0.02) < 1e-12)
  assert.ok(
    Math.abs(view.annualReturns.bonds - ((1.1 * 0.95 * 1.02) ** 2 - 1)) < 1e-12
  )
})

test('missing and encoded facts never become invented balances or returns', () => {
  const data = fixture()
  data.result.previousResults[1].facts = JSON.stringify(JSON.stringify(facts()))
  assert.equal(build(data).current.totalAssets, 10200)
  for (const raw of [
    null,
    '{',
    {},
    { assetsWithReturns: [{ ix: 0 }, { ix: 2 }] },
  ]) {
    data.result.previousResults[1].facts = raw
    const view = build(data)
    assert.equal(view.current.totalAssets, null)
    assert.equal(view.quarterGain, null)
    assert.equal(view.accumulatedReturn, null)
    assert.equal(view.annualReturns.bank, null)
    assert.equal(view.monthly.length, 3)
    assert.ok(view.monthly.every((sample) => sample.totalAssets === null))
  }
  assert.equal(buildResultView({} as ResultQuery), null)
})

test('mix derives from holdings and supports zero asset allocations', () => {
  assert.deepEqual(
    balanceMix({ bank: 100, bonds: 0, stocks: 0, totalAssets: 100 }),
    { bank: 100, bonds: 0, stocks: 0 }
  )
  assert.equal(
    balanceMix({ bank: 0, bonds: 0, stocks: 0, totalAssets: 0 }),
    null
  )
  assert.equal(
    balanceMix({ bank: 100, bonds: null, stocks: 0, totalAssets: 100 }),
    null
  )
  assert.equal(
    balanceMix({ bank: 100, bonds: -1, stocks: 0, totalAssets: 99 }),
    null
  )
})

test('a missing current quarter stays unavailable instead of showing an earlier close', () => {
  const data = fixture()
  data.result.currentGame.activePeriod.activeSegmentIx = 1
  const view = build(data)
  assert.equal(view.quarter, 2)
  assert.equal(view.current.totalAssets, null)
  assert.equal(view.quarterGain, null)
  assert.equal(view.opening.label, 'Mar')
  assert.ok(
    view.monthly.slice(3).every((sample) => sample.totalAssets === null)
  )
})

test('an incomplete year cannot report a partial annual market return', () => {
  const data = fixture()
  data.result.currentGame.status = 'RESULTS'
  data.result.currentGame.periods[0].segmentCount = 2
  data.result.previousResults.push(row(0, -1, 'PERIOD_END'))
  assert.equal(build(data).annualReturns.bank, null)
})

test('year-end progress retains the final quarter when its result is missing', () => {
  const data = fixture()
  data.result.currentGame.status = 'RESULTS'
  data.result.currentGame.activePeriod = null
  data.result.currentGame.periods[0].activeSegmentIx = 3
  data.result.currentGame.periods[0].segmentCount = 4
  data.result.previousResults.push(row(0, -1, 'PERIOD_END'))
  const view = build(data)
  assert.equal(view.quarter, 4)
  assert.equal(view.monthly.length, 12)
  assert.equal(view.close.totalAssets, null)
  assert.equal(view.current.totalAssets, 10200)
})

test('year gain requires a real opening balance, not the earliest surviving quarter', () => {
  const data = fixture()
  data.result.currentGame.status = 'RESULTS'
  data.result.previousResults = [
    row(0, 1, 'SEGMENT_END', facts(10200, 10500)),
    row(0, -1, 'PERIOD_END', facts(10200, 10500)),
  ]
  assert.equal(build(data).yearGain, null)
  data.result.previousResults.push(row(0, 0))
  assert.equal(build(data).yearGain, 500)
})

test('facts accept objects and legacy encodings, without accepting arrays or primitives', () => {
  const facts = { avatar: 'bear', initialCapital: 0 }
  assert.equal(parseFacts(facts), facts)
  for (const raw of [
    JSON.stringify(facts),
    JSON.stringify(JSON.stringify(facts)),
  ])
    assert.deepEqual(parseFacts(raw), facts)
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
    assert.deepEqual(parseFacts(raw), {})
})

test('numeric helpers preserve missing data, zero, and finite losses', () => {
  for (const raw of [null, undefined, '1', NaN, Infinity, -Infinity])
    assert.equal(finiteNumber(raw), null)
  assert.equal(finiteNumber(0), 0)
  assert.equal(finiteNumber(-0.1), -0.1)
  assert.equal(difference(0, 2), -2)
  assert.equal(difference(null, 2), null)
  assert.equal(difference(2, null), null)
  assert.equal(difference(Number.MAX_VALUE, -Number.MAX_VALUE), null)
  assert.equal(compoundReturns([]), null)
  assert.equal(compoundReturns([0.1, null]), null)
  assert.equal(compoundReturns([Infinity]), null)
  assert.equal(compoundReturns([NaN]), null)
  assert.equal(compoundReturns([0, 0]), 0)
  assert.equal(compoundReturns([-1, 0.2]), -1)
  assert.equal(compoundReturns([0.1, -0.05, 0.02]), 1.1 * 0.95 * 1.02 - 1)
})

test('saved allocations retain decimal validation without coercing stored strings', () => {
  const allocation = { bank: 33.3, bonds: 33.3, stocks: 33.4 }
  assert.deepEqual(readAllocation(JSON.stringify(allocation)), allocation)
  for (const raw of [
    null,
    { bank: 100 },
    { bank: '100', bonds: 0, stocks: 0 },
    { bank: 33.33, bonds: 33.33, stocks: 33.34 },
  ])
    assert.equal(readAllocation(raw), null)
})

test('balance samples require an opening record and contiguous indices', () => {
  const samples = [
    { ix: 0, totalAssets: 100 },
    { ix: 1, totalAssets: 90 },
  ]
  assert.deepEqual(readBalanceSamples({ assetsWithReturns: samples }), samples)
  assert.deepEqual(
    readBalanceSamples(
      JSON.stringify({
        assetsWithReturns: samples.map((sample) => JSON.stringify(sample)),
      })
    ),
    samples
  )
  for (const samples of [
    [],
    [{ ix: 0 }],
    [{ ix: 1 }, { ix: 2 }],
    [{ ix: 0 }, { ix: 2 }],
    [null, { ix: 1 }],
  ])
    assert.deepEqual(readBalanceSamples({ assetsWithReturns: samples }), [])
})

test('initial capital uses the first recorded finite value, including zero, then current facts', () => {
  assert.equal(
    readInitialCapital([{ facts: {} }, { facts: { initialCapital: 0 } }], {
      initialCapital: 10,
    }),
    0
  )
  assert.equal(
    readInitialCapital(
      [{ facts: { initialCapital: NaN } }],
      JSON.stringify({ initialCapital: 10 })
    ),
    10
  )
  assert.equal(
    readInitialCapital(
      [
        { facts: JSON.stringify({ initialCapital: 100 }) },
        { facts: { initialCapital: 200 } },
      ],
      { initialCapital: 300 }
    ),
    100
  )
  assert.equal(readInitialCapital([], {}), null)
})

test('player formatting keeps Swiss separators, signed rounding and neutral zero', () => {
  assert.equal(playerAmount(1234.5), "1'234.50")
  assert.equal(playerAmount(-1.005, true), '-1.01')
  for (const zero of [0, -0, 0.001, -0.001])
    assert.equal(playerAmount(zero, true), '0.00')
  assert.equal(playerPercent(0.000001), '0.00%')
  assert.equal(playerPercent(-0.000001), '0.00%')
  assert.equal(playerAmount(null), '—')
})
