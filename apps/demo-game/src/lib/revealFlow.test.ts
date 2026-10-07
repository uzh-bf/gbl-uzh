import { expect, test } from 'vitest'
import type { ResultQuery } from '../graphql/generated/ops'
import { validateAdvance } from '../services/SegmentService'
import {
  allMarketRollsRevealed,
  currentMarketReview,
  pendingMarketReveal,
} from './market'
import { buildHistory, buildResultView } from './results'
import { teamStatistics } from './team'

function cockpitFixture() {
  const segments = [0, 1].map((index) => ({
    id: `s${index}`,
    index,
    facts: {
      revealedRollIndices: index === 0 ? [0, 1, 2] : [],
      diceRolls: Array.from({ length: 3 }, () => ({
        shared: 3,
        bonds: 7,
        stocks: 6,
      })),
      returns: Array.from({ length: 3 }, () => ({
        bank: 0.002,
        bonds: 0.003,
        stocks: 0.004,
      })),
    },
  }))
  const period = {
    id: 'p1',
    index: 1,
    activeSegmentIx: 1,
    segmentCount: 4,
    segments,
  }
  const facts = (start: number) => ({
    initialCapital: 10000,
    decisions: { bank: 50, bonds: 30, stocks: 20 },
    assets: { bank: 5500, bonds: 3300, stocks: 2200, totalAssets: 11000 },
    assetsWithReturns: [0, 1, 2, 3].map((ix) => ({
      ix,
      totalAssets: start + ix * 100,
    })),
  })
  return {
    result: {
      currentGame: {
        status: 'RUNNING',
        activePeriod: period,
        periods: [period],
      },
      playerResult: { facts: facts(10300) },
      previousResults: segments.map((segment) => ({
        id: `r${segment.index}`,
        type: 'SEGMENT_END',
        period,
        segment,
        facts: facts(10000 + segment.index * 300),
      })),
    },
  } as unknown as ResultQuery
}

test.each(['PAUSED', 'CONSOLIDATION'] as const)(
  'results stay private until three reveals in %s',
  (status) => {
    const data = cockpitFixture()
    const game = data.result.currentGame
    const baseline = buildHistory(data)
    game.status = status as typeof game.status
    const segment = game.activePeriod!.segments[1]
    const stored = structuredClone(data.result.playerResult.facts)
    for (const indices of [[], [0], [0, 1]]) {
      segment.facts.revealedRollIndices = indices
      expect(pendingMarketReveal(game)?.id).toBe(segment.id)
      expect(buildResultView(data)).toBeNull()
      expect(buildHistory(data)).toEqual(baseline)
      expect(teamStatistics(data).value).toBe(baseline.value)
      expect(() => validateAdvance(segment.facts)).toThrow(/all three/)
    }
    segment.facts.revealedRollIndices = [0, 1, 2]
    expect(pendingMarketReveal(game)).toBeNull()
    expect(buildResultView(data)).not.toBeNull()
    expect(buildHistory(data).quarters).toHaveLength(
      baseline.quarters.length + 1
    )
    expect(() => validateAdvance(segment.facts)).not.toThrow()
    expect(data.result.playerResult.facts).toEqual(stored)
  }
)

test('invalid or duplicated reveal markers cannot unlock advancement', () => {
  const data = cockpitFixture()
  const facts = data.result.currentGame.activePeriod!.segments[1].facts
  facts.revealedRollIndices = [0, 0, 1, 9]
  expect(allMarketRollsRevealed(facts)).toBe(false)
  facts.revealedRollIndices = [0, 1, 2]
  facts.diceRolls[2].shared = 0
  expect(allMarketRollsRevealed(facts)).toBe(false)
})

test('Market resets during allocation and reviews the correct closed quarter', () => {
  const data = cockpitFixture()
  const game = data.result.currentGame
  expect(currentMarketReview(game)).toBeNull()
  game.status = 'PAUSED' as typeof game.status
  expect(currentMarketReview(game)?.segment.id).toBe(
    game.activePeriod!.segments[1].id
  )
  game.status = 'RESULTS' as typeof game.status
  game.activePeriod = null
  expect(currentMarketReview(game)?.period.index).toBe(1)
})
