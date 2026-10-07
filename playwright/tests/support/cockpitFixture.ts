import type { ResultQuery } from '../../../apps/demo-game/src/graphql/generated/ops'

type PlayerResultData = NonNullable<ResultQuery['result']>
type CockpitFixture = ResultQuery & {
  self: NonNullable<ResultQuery['self']>
  result: PlayerResultData & {
    currentGame: NonNullable<PlayerResultData['currentGame']>
    previousResults: NonNullable<PlayerResultData['previousResults']>
    playerResult: NonNullable<PlayerResultData['playerResult']>
  }
}

/** Deterministic player data for responsive UI checks, without database writes. */
export function cockpitFixture() {
  const assets = (total: number) => ({
    bank: total * 0.55,
    bonds: total * 0.35,
    stocks: total * 0.1,
    totalAssets: total,
  })
  const allocation = { bank: 55, bonds: 35, stocks: 10 }
  const periods = [0, 1].map((index) => ({
    __typename: 'Period',
    id: `tablet-period-${index}`,
    index,
    segmentCount: 4,
    activeSegmentIx: index === 0 ? 3 : 1,
    facts: {
      scenario: {
        trendBonds: 0.0031,
        gapBonds: 0.005,
        trendStocks: 0.0065,
        gapStocks: 0.025,
        interestBank: 0.002,
      },
    },
    segments: Array.from({ length: 4 }, (_, quarter) => ({
      __typename: 'PeriodSegment',
      id: `tablet-segment-${index}-${quarter}`,
      index: quarter,
      facts: {
        diceRolls: [
          { shared: 3, bonds: 7, stocks: 6 },
          { shared: 2, bonds: 6, stocks: 8 },
          { shared: 4, bonds: 9, stocks: 7 },
        ],
        returns: [
          { bank: 0.002, bonds: 0.0031, stocks: -0.0185 },
          { bank: 0.002, bonds: -0.0019, stocks: 0.0315 },
          { bank: 0.002, bonds: 0.0131, stocks: 0.0065 },
        ],
        revealedRollIndices: [0],
      },
      countdownExpiresAt: null,
      countdownDurationMs: null,
      learningElements: [],
      storyElements: [],
    })),
  }))
  const facts = (start: number, end: number) => ({
    initialCapital: 10000,
    decisions: allocation,
    assets: assets(end),
    allocationSubmitted: false,
    assetsWithReturns: [start, start + 30, start - 10, end].map(
      (total, ix) => ({
        ix,
        ...assets(total),
        bankBenchmark: start + ix * 20,
        bondsBenchmark: start + ix * 10,
        stocksBenchmark: start + [0, -80, 70, 40][ix],
        bankReturn: 0.002,
        bondsReturn: [0, 0.0031, -0.0019, 0.0131][ix],
        stocksReturn: [0, -0.0185, 0.0315, 0.0065][ix],
      })
    ),
  })
  const row = (
    period: number,
    quarter: number,
    type: string,
    start: number,
    end: number
  ) => ({
    __typename: 'PlayerResult',
    id: `tablet-result-${period}-${quarter}-${type}`,
    type,
    period: { __typename: 'Period', id: periods[period].id, index: period },
    segment:
      quarter < 0
        ? null
        : {
            __typename: 'PeriodSegment',
            id: periods[period].segments[quarter].id,
            index: quarter,
          },
    facts: facts(start, end),
  })
  const activePeriod = { ...periods[1], activeSegment: periods[1].segments[1] }
  const currentGame = {
    __typename: 'Game',
    id: '74001',
    name: 'Minigame',
    status: 'RUNNING',
    facts: {},
    nextAutoContinueAt: null,
    players: [],
    periods,
    activePeriod,
  }
  return {
    self: {
      __typename: 'Player',
      id: 'tablet-player',
      name: 'Team 1',
      role: 'Trader',
      isReady: false,
      facts: { location: 'AG' },
      experience: 340,
      experienceToNext: 500,
      completedLearningElementIds: [],
      visitedStoryElementIds: [],
      achievementKeys: [],
      achievements: [],
      level: { __typename: 'PlayerLevel', id: 'tablet-level', index: 2 },
      game: currentGame,
    },
    result: {
      currentGame,
      previousResults: [
        row(0, -1, 'PERIOD_START', 10000, 10000),
        ...[0, 1, 2, 3].map((quarter) =>
          row(
            0,
            quarter,
            'SEGMENT_END',
            10000 + quarter * 50,
            10050 + quarter * 50
          )
        ),
        row(0, -1, 'PERIOD_END', 10000, 10200),
        row(1, -1, 'PERIOD_START', 10200, 10200),
        row(1, 0, 'SEGMENT_END', 10200, 10250),
        row(1, 1, 'SEGMENT_END', 10250, 10300),
      ],
      playerResult: {
        ...row(1, 1, 'SEGMENT_START', 10250, 10300),
        player: {
          __typename: 'Player',
          id: 'tablet-player',
          completedLearningElementIds: [],
          visitedStoryElementIds: [],
        },
      },
      transactions: [],
    },
    decision: null,
  } as unknown as CockpitFixture
}
