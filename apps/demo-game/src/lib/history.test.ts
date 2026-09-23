import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ResultQuery } from '../graphql/generated/ops'
import { buildHistory, playerAmount, playerPercent } from './results'

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
  assert.equal(history(data).quarters.length, 0)
  assert.equal(history(data).value, 10000)
  assert.equal(history(data).gain, 0)
  data.result.previousResults.push(row(0, 1), row(0, 2))
  data.result.currentGame.activePeriod.activeSegmentIx = 1
  assert.deepEqual(
    history(data).quarters.map((q) => q.quarter),
    [1]
  )
  for (const status of ['PAUSED', 'CONSOLIDATION']) {
    data.result.currentGame.status = status
    assert.deepEqual(
      history(data).quarters.map((q) => q.quarter),
      [1, 2]
    )
  }
})

test('settled amounts, saved mix and compounded returns come from persisted samples', () => {
  const data = fixture()
  data.result.currentGame.status = 'PAUSED'
  const result = history(data)
  const quarter = result.quarters[0]
  assert.equal(result.value, 10200)
  assert.equal(result.gain, 200)
  assert.equal(result.gainRate, 0.02)
  assert.equal(quarter.gain, 200)
  assert.deepEqual(quarter.allocation, facts.decisions)
  assert.ok(Math.abs(quarter.bonds - (1.1 * 0.95 * 1.02 - 1)) < 1e-12)
  assert.ok(Math.abs(quarter.stocks - (0.9 * 1.1 * 1.01 - 1)) < 1e-12)
  assert.deepEqual(
    quarter.months.map((month) => month.gain),
    [100, -50, 150]
  )
  assert.deepEqual(
    quarter.months.map((month) => month.dice?.bonds ?? null),
    [null, 8, null]
  )
  data.result.currentGame.periods[0].segments[0].facts.revealedRollIndices.push(
    0
  )
  assert.equal(history(data).quarters[0].months[0].dice.bonds, 8)
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
  assert.deepEqual(
    history(data).quarters.map((q) => q.label),
    ['26 Q1', '26 Q2']
  )
  assert.deepEqual(history(data).years, [2026, 2027])
  data.result.currentGame.status = 'CONSOLIDATION'
  assert.equal(history(data).quarters.length, 3)
  data.result.previousResults.push(row(1, -1, 'PERIOD_END'))
  data.result.currentGame.status = 'RESULTS'
  data.result.currentGame.activePeriod = { ...period(2), activeSegmentIx: -1 }
  assert.deepEqual(history(data).years, [2026, 2027])
  assert.equal(history(data).quarters.length, 3)
  data.result.currentGame.activePeriod = null
  assert.equal(history(data).quarters.length, 3)
  assert.deepEqual(history(data).years, [2026, 2027])
})

test('missing, malformed and double-encoded facts degrade without inventing values', () => {
  const data = fixture()
  data.result.currentGame.status = 'PAUSED'
  data.result.previousResults[1].facts = JSON.stringify(JSON.stringify(facts))
  assert.equal(history(data).value, 10200)
  for (const raw of [
    null,
    '{',
    {},
    { ...facts, assetsWithReturns: [null] },
    { ...facts, assetsWithReturns: [{ ix: 0 }, { ix: 3 }] },
  ]) {
    data.result.previousResults[1].facts = raw
    const result = history(data)
    assert.equal(result.value, null)
    assert.equal(result.quarters[0].bonds, null)
    assert.equal(result.quarters[0].months.length, 0)
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
  assert.equal(quarter.allocation, null)
  assert.equal(quarter.bonds, null)
  assert.equal(quarter.gain, -100)
  assert.equal(buildHistory({} as ResultQuery).value, null)
})

test('formats Swiss amounts and signed returns without negative zero', () => {
  assert.equal(playerAmount(10140.86), "10'140.86")
  assert.equal(playerAmount(140.86, true), '+140.86')
  assert.equal(playerAmount(-0.001, true), '0.00')
  assert.equal(playerAmount(-1.005, true), '-1.01')
  assert.equal(playerPercent(-0.019), '-1.90%')
  assert.equal(playerPercent(0.0141), '+1.41%')
  assert.equal(playerPercent(null), '—')
})
