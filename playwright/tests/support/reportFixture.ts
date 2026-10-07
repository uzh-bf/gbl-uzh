type Segment = {
  id: number
  index: number
  countdownExpiresAt: null
  countdownDurationMs: null
  facts: Record<string, never>
  learningElements: never[]
  storyElements: never[]
}

type Period = {
  id: number
  index: number
  activeSegmentIx: null
  segmentCount: number
  facts: Record<string, never>
  segments: Segment[]
}

type Player = {
  id: string
  number: number
  name: string
  role: string
  isReady: boolean
  facts: Record<string, never>
  experience: number
  experienceToNext: number
  token: string
}

type Game = {
  id: number
  name: string
  status: string
  version: number
  activePeriodIx: number
  activeSegmentIx: null
  activePeriod: null
  facts: Record<string, never>
  players: Player[]
  periods: Period[]
}

type Row = {
  id: number
  type: 'SEGMENT_END' | 'PERIOD_END'
  player: { id: string; name: string }
  period: { id: number; index: number }
  segment: { id: number; index: number } | null
  facts: unknown
}

/** A deterministic classroom-sized report; no database records are created. */
export function reportFixture(teamCount = 15) {
  const game: Game = {
    id: 74000,
    name: 'Report design fixture',
    status: 'RESULTS',
    version: 1,
    activePeriodIx: 0,
    activeSegmentIx: null,
    activePeriod: null,
    facts: {},
    players: Array.from({ length: teamCount }, (_, index) => ({
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
      id: 74100 + index,
      index,
      activeSegmentIx: null,
      segmentCount: 4,
      facts: {},
      segments: Array.from({ length: 4 }, (_, quarter) => ({
        id: 74200 + index * 4 + quarter,
        index: quarter,
        countdownExpiresAt: null,
        countdownDurationMs: null,
        facts: {},
        learningElements: [],
        storyElements: [],
      })),
    })),
  }
  const rows: Row[] = []
  const ends: Row[] = []
  let resultId = 74300
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
          id: resultId++,
          type: 'SEGMENT_END',
          player: { id: player.id, name: player.name },
          period: { id: period.id, index: period.index },
          segment: {
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
        id: resultId++,
        type: 'PERIOD_END',
        player: { id: player.id, name: player.name },
        period: { id: period.id, index: period.index },
        segment: null,
        facts: {},
      })
    }
  })
  return { game, rows, ends }
}
