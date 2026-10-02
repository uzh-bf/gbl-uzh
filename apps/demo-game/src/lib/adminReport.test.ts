import { describe, expect, test } from 'vitest'
import type { GameDetail, SpecificResult } from '~/types/api'
import {
  averageAllocation,
  buildAdminReport,
  reportPercent,
} from './adminReport'

type Game = GameDetail
// Fixture rows use readable string ids and loose facts; the report only
// compares ids for equality and parses facts defensively.
type Row = Omit<SpecificResult, 'id' | 'facts' | 'type'> & {
  id: string
  type?: SpecificResult['type']
  facts: any
}

const buildReport = (
  game: Game,
  rows: Row[],
  ends: Row[],
  scope: Parameters<typeof buildAdminReport>[3]
) =>
  buildAdminReport(
    game,
    rows as unknown as SpecificResult[],
    ends as unknown as SpecificResult[],
    scope
  )

function fixture() {
  const game = {
    id: '1',
    status: 'RESULTS',
    activePeriod: null,
    players: [
      { id: 'a', name: 'Same name', number: 1 },
      { id: 'b', name: 'Same name', number: 2 },
    ],
    periods: [0, 1].map((index) => ({
      id: `p${index}`,
      index,
      segments: [0, 1, 2, 3].map((index) => ({ id: `s${index}`, index })),
    })),
  } as unknown as Game
  const rows: Row[] = []
  for (const player of game.players) {
    let balance = 10000
    for (const period of game.periods)
      for (const segment of period.segments) {
        const rates =
          player.id === 'b'
            ? [0.002, 0.002, 0.002]
            : period.index === 0
              ? [0.01, -0.02, 0.03]
              : [-0.02, 0.01, 0.02]
        const samples = [{ ix: 0, totalAssets: balance, bankReturn: 0.002 }]
        rates.forEach((rate, ix) => {
          balance *= 1 + rate
          samples.push({ ix: ix + 1, totalAssets: balance, bankReturn: 0.002 })
        })
        rows.push({
          id: `${player.id}-${period.id}-${segment.id}`,
          player,
          period: { id: period.id, index: period.index },
          segment,
          facts: {
            decisions: { bank: 33.3, bonds: 33.3, stocks: 33.4 },
            assetsWithReturns: samples,
          },
        })
      }
  }
  const ends = game.periods.map((period) => ({
    id: `end-${period.id}`,
    period,
    player: game.players[0],
    facts: {},
  })) as unknown as Row[]
  return { game, rows, ends }
}

describe('admin report scoped metrics', () => {
  test('compounds the selected year and whole game, keeping actual balances', () => {
    const { game, rows, ends } = fixture()
    const year = buildReport(game, rows, ends, 1)
    const whole = buildReport(game, rows, ends, 'all')
    const r0 = (1.01 * 0.98 * 1.03) ** 4 - 1
    const r1 = (0.98 * 1.01 * 1.02) ** 4 - 1
    expect(year.teams[0].return).toBeCloseTo(r1)
    expect(whole.teams[0].return).toBeCloseTo((1 + r0) * (1 + r1) - 1)
    expect(year.teams[0].assets).toBeCloseTo(10000 * (1 + r0) * (1 + r1))
    expect(year.points[0].values.team0.return).toBe(0)
    expect(year.points[0].values.team0.assets).toBeCloseTo(10000 * (1 + r0))
    expect(year.quarters).toHaveLength(4)
    expect(whole.quarters).toHaveLength(8)
    expect(whole.teams[0].color).toBe(year.teams[0].color)
    expect(whole.teams.map((t) => t.seriesKey)).toEqual(['team0', 'team1'])
  })

  test('annualises sample volatility and geometric excess return over savings', () => {
    const { game, rows, ends } = fixture()
    const report = buildReport(game, rows, ends, 'all')
    const rates = Array.from({ length: 4 }, () => [
      0.01, -0.02, 0.03, -0.02, 0.01, 0.02,
    ]).flat()
    const mean = rates.reduce((a, b) => a + b, 0) / 24
    const risk =
      Math.sqrt(rates.reduce((s, v) => s + (v - mean) ** 2, 0) / 23) *
      Math.sqrt(12)
    const annual = Math.sqrt(1 + report.teams[0].return!) - 1
    expect(report.teams[0].risk).toBeCloseTo(risk)
    expect(report.teams[0].sharpe).toBeCloseTo(
      (annual - (1.002 ** 12 - 1)) / risk
    )
    expect(report.teams[1].risk).toBeLessThan(0.0001)
    expect(report.teams[1].sharpe).toBeNull()
    expect(report.bestSharpe?.id).toBe('a')
  })

  test('ranking, average return and allocations use the scope and preserve decimals', () => {
    const { game, rows, ends } = fixture()
    const report = buildReport(game, rows, ends, 0)
    expect(report.ranking[0].id).toBe('a')
    expect(report.averageReturn).toBeCloseTo(
      (report.teams[0].return! + report.teams[1].return!) / 2
    )
    expect(report.mix?.stocks).toBeCloseTo(33.4)
    expect(report.averageDecisions['p0:s0']?.bank).toBeCloseTo(33.3)
    expect(
      averageAllocation([null, { bank: 100, bonds: 0, stocks: 0 }])
    ).toEqual({ bank: 100, bonds: 0, stocks: 0 })
  })

  test('sorts result rows and accepts double-encoded legacy facts', () => {
    const { game, rows, ends } = fixture()
    const expected = buildReport(game, rows, ends, 'all')
    rows[0].facts = JSON.stringify(JSON.stringify(rows[0].facts))
    expect(buildReport(game, rows.reverse(), ends.reverse(), 'all')).toEqual(
      expected
    )
  })

  test('excludes live segment records and includes the quarter after settlement', () => {
    const { game, rows, ends } = fixture()
    game.status = 'RUNNING' as Game['status']
    game.activePeriod = {
      id: 'p1',
      activeSegmentIx: 1,
    } as unknown as Game['activePeriod']
    let report = buildReport(game, rows, ends.slice(0, 1), 1)
    expect(report.points).toHaveLength(4)
    expect(report.teams[0].decisions['p1:s1']).toBeNull()
    game.status = 'PAUSED' as Game['status']
    report = buildReport(game, rows, ends.slice(0, 1), 1)
    expect(report.points).toHaveLength(7)
    expect(report.teams[0].decisions['p1:s1']).not.toBeNull()
  })

  test('does not bridge a missing quarter or turn missing data into zero', () => {
    const { game, rows, ends } = fixture()
    const report = buildReport(
      game,
      rows.filter((row) => row.id !== 'a-p0-s1'),
      ends,
      0
    )
    expect(report.points.find((p) => p.month === 4)?.values.team0).toEqual({
      assets: null,
      return: null,
    })
    expect(
      report.points.find((p) => p.month === 7)?.values.team0.assets
    ).not.toBeNull()
    expect(
      report.points.find((p) => p.month === 7)?.values.team0.return
    ).toBeNull()
    expect(report.teams[0].return).toBeNull()
    expect(report.teams[0].risk).toBeNull()
    expect(report.eligibleCount).toBe(1)
  })

  test('rejects malformed or noncontiguous samples and missing benchmark inputs', () => {
    const { game, rows, ends } = fixture()
    rows[0].facts.assetsWithReturns[2].ix = 9
    rows[4].facts.assetsWithReturns[1].bankReturn = undefined
    const first = buildReport(game, rows, ends, 0)
    expect(first.teams[0].return).toBeNull()
    expect(first.teams[0].sharpe).toBeNull()
    const second = buildReport(game, rows, ends, 1)
    expect(second.teams[0].return).not.toBeNull()
    expect(second.teams[0].sharpe).toBeNull()
    rows[0].facts = '{bad JSON'
    expect(() => buildReport(game, rows, ends, 'all')).not.toThrow()
  })

  test('empty games and unplayed years render unavailable data', () => {
    const { game } = fixture()
    const report = buildReport(game, [], [], 1)
    expect(report.hasResults).toBe(false)
    expect(report.top).toBeNull()
    expect(report.averageReturn).toBeNull()
    expect(report.points).toEqual([])
    expect(
      buildReport({ ...game, players: [], periods: [] }, [], [], 'all').teams
    ).toEqual([])
  })

  test('a missing final month never reports the preceding balance as the final balance', () => {
    const { game, rows, ends } = fixture()
    rows[7].facts.assetsWithReturns.pop()
    rows[15].facts.assetsWithReturns.pop()
    const report = buildReport(game, rows, ends, 1)
    expect(report.teams[0].assets).toBeNull()
    expect(report.teams[0].return).toBeNull()
    expect(report.teams[0].sharpe).toBeNull()
    expect(report.hasResults).toBe(true)
  })

  test('formats signed percentages without negative zero', () => {
    expect(reportPercent(-0.00001)).toBe('0.0%')
    expect(reportPercent(0.0123)).toBe('+1.2%')
    expect(reportPercent(null)).toBe('—')
  })

  test('keeps 100 team colors distinct and stable across scope and input order', () => {
    const { game, rows, ends } = fixture()
    game.players = Array.from({ length: 100 }, (_, index) => ({
      ...game.players[0],
      id: `player-${index}`,
      number: index + 1,
    }))
    const whole = buildReport(game, rows, ends, 'all')
    expect(new Set(whole.teams.map((team) => team.color)).size).toBe(100)
    game.players.reverse()
    const year = buildReport(game, rows, ends, 1)
    expect(year.teams.map(({ id, color }) => ({ id, color }))).toEqual(
      whole.teams.map(({ id, color }) => ({ id, color }))
    )
  })
})
