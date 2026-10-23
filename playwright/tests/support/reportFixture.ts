import type {
  GameQuery,
  SpecificResultsQuery,
} from '../../../apps/demo-game/src/graphql/generated/ops'

type Game = NonNullable<GameQuery['game']>
type Row = NonNullable<SpecificResultsQuery['specificResults']>[number]

/** A deterministic classroom-sized report; no database records are created. */
export function reportFixture(teamCount = 15) {
  const game = {
    __typename: 'Game',
    id: '74000',
    name: 'Report design fixture',
    status: 'RESULTS',
    activePeriodIx: null,
    activeSegmentIx: null,
    activePeriod: null,
    playerCount: teamCount,
    facts: {},
    players: Array.from({ length: teamCount }, (_, index) => ({
      __typename: 'Player',
      id: `report-team-${index + 1}`,
      number: index + 1,
      name: index === 6 ? 'Investment Guru' : `Team ${index + 1}`,
      role: 'Trader',
      isReady: false,
      facts: {},
      experience: 0,
      experienceToNext: 100,
      token: '',
    })),
    periods: [0, 1, 2].map((index) => ({
      __typename: 'Period',
      id: `report-period-${index}`,
      index,
      activeSegmentIx: null,
      segmentCount: 4,
      facts: {},
      segments: Array.from({ length: 4 }, (_, quarter) => ({
        __typename: 'PeriodSegment',
        id: `report-segment-${index}-${quarter}`,
        index: quarter,
        countdownExpiresAt: null,
        countdownDurationMs: null,
        facts: {},
        learningElements: [],
        storyElements: [],
      })),
    })),
  } as Game
  const rows: Row[] = []
  const ends: Row[] = []
  const market = [
    -0.045, 0.022, 0.028, 0.02, 0.027, -0.034, -0.021, -0.007, -0.014, 0.015,
    -0.077, -0.07, 0.029, 0.024, -0.019, 0.012, -0.011, 0.05, -0.016, -0.019,
    0.012, 0.047, -0.013, -0.08,
  ]
  game.players.forEach((player, team) => {
    let balance = 10000
    for (const period of game.periods.slice(0, 2)) {
      for (const segment of period.segments) {
        const bank =
          team === 11 ? 100 : 10 + ((team * 13 + segment.index * 7) % 60)
        const bonds =
          team === 11 ? 0 : Math.min(100 - bank, 15 + ((team * 11) % 40))
        const stocks = 100 - bank - bonds
        const samples = [{ ix: 0, totalAssets: balance, bankReturn: 0.001 }]
        for (let month = 0; month < 3; month++) {
          const marketRate =
            market[period.index * 12 + segment.index * 3 + month]
          const rate =
            (bank / 100) * 0.001 +
            (bonds / 100) * (marketRate * 0.3 + 0.002) +
            (stocks / 100) * (marketRate * (0.8 + team / 25))
          balance *= 1 + rate
          samples.push({
            ix: month + 1,
            totalAssets: balance,
            bankReturn: 0.001,
          })
        }
        rows.push({
          __typename: 'PlayerResult',
          id: `${player.id}-${segment.id}`,
          type: 'SEGMENT_END' as Row['type'],
          player: { __typename: 'Player', id: player.id, name: player.name },
          period: { __typename: 'Period', id: period.id, index: period.index },
          segment: {
            __typename: 'PeriodSegment',
            id: segment.id,
            index: segment.index,
          },
          facts: {
            decisions: { bank, bonds, stocks },
            assetsWithReturns: samples,
          },
        })
      }
      ends.push({
        __typename: 'PlayerResult',
        id: `${player.id}-${period.id}-end`,
        type: 'PERIOD_END' as Row['type'],
        player: { __typename: 'Player', id: player.id, name: player.name },
        period: { __typename: 'Period', id: period.id, index: period.index },
        segment: null,
        facts: {},
      })
    }
  })
  return { game, rows, ends }
}
