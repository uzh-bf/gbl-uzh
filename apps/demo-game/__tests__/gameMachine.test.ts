import { GameService, Reducers, UserRole } from '@gbl-uzh/platform'
import { PrismaClient } from '@prisma/client'
import { PeriodFacts, PeriodFactsSchema } from '../src/graphql/types'
import * as reds from '../src/reducers'

// TODO(Jakob):
// - Check where we get the facts from to addPeriod
// - Delete game after testing it? -> delete from DB
// - flag for clearing the prisma db and do from scratch -> only over cli?

// - Why do we always provide all reducers for every function in GameServie?

// - Add state machine in the platform code and add it here
// - Use the functions in util and GameService and alter them iteratively
//   in order to use the state machine -> also check how to use the actor

describe('Testing Demo Game', () => {
  const nameGame = 'TestDemoGame'
  const playerCount = 1
  const createNewGame = true
  let gameId = 1
  let game
  const userSub = '716f7632-ed33-4701-a281-0f27bd4f6e82'
  const roleAssigner = (ix: number): UserRole => UserRole.PLAYER
  const prisma = new PrismaClient()
  const reducers: Reducers<PrismaClient> = {
    Actions: {
      apply: reds.Actions.apply,
      ActionTypes: reds.Actions.ActionTypes,
    },
    Period: {
      apply: reds.Period.apply,
      ActionTypes: reds.Period.ActionTypes,
    },
    PeriodResult: {
      apply: reds.PeriodResult.apply,
      ActionTypes: reds.PeriodResult.ActionTypes,
    },
    Segment: {
      apply: reds.Segment.apply,
      ActionTypes: reds.Segment.ActionTypes,
    },
    SegmentResult: {
      apply: reds.SegmentResult.apply,
      ActionTypes: reds.SegmentResult.ActionTypes,
    },
  }

  let ctx: GameService.Context = {
    prisma: prisma,
    user: {
      sub: userSub,
      role: UserRole.ADMIN,
    },
  }

  const findGame = async (gameId: number) => {
    const results = {
      include: {
        player: true,
      },
    }

    return prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        players: true,
        periods: true,
        activePeriod: {
          include: {
            results: results,
            nextPeriod: true,
            previousPeriod: {
              include: {
                results: results,
              },
            },
            activeSegment: {
              include: {
                results: results,
              },
            },
            decisions: {
              include: {
                player: true,
              },
            },
          },
        },
      },
    })
  }

  it('creates a new Game', async () => {
    if (createNewGame) {
      game = await GameService.createGame(
        { name: nameGame, playerCount: playerCount },
        ctx,
        { roleAssigner }
      )
      gameId = game.id
    } else {
      game = await findGame(gameId)
    }

    let periodFacts = {
      rollsPerSegment: 1,
      scenario: {
        bankReturn: 1,
        seed: 1,
        trendStocks: 1,
        trendBonds: 1,
        gapStocks: 1,
        gapBonds: 1,
      },
    }

    GameService.addGamePeriod<PeriodFacts>(
      { gameId, facts: periodFacts },
      ctx,
      {
        schema: PeriodFactsSchema,
        reducers,
      }
    )

    // let segmentPeriodFacts = {
    //   returns: []
    //   { bank: number; bonds: number; stocks: number }[]
    //   diceRolls: { bonds: number; stocks: number }[]
    // }

    // GameService.addPeriodSegment<PeriodSegmentFacts>(
    //   {gameId, periodIx: 0, facts: {}}, ctx, {
    //   schema: PeriodSegmentFactsSchema,
    //   reducers,
    // })
  })
})

export {}
