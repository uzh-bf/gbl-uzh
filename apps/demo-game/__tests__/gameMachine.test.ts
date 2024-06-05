import { GameService, UserRole } from '@gbl-uzh/platform'
import { PrismaClient } from '@prisma/client'

describe('Testing Demo Game', () => {
  const nameGame = 'TestDemoGame'
  const playerCount = 1
  const createNewGame = true
  let gameId = 1
  let game
  const userSub = '716f7632-ed33-4701-a281-0f27bd4f6e82'
  const roleAssigner = (ix: number): UserRole => UserRole.PLAYER
  const prisma = new PrismaClient()

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

  // TODO(Jakob):
  // - flag for clearing the prisma db and do from scratch
  // - what is the return of GameService.createGame and what is it used for?

  // - Add state machine in the platform code and add it here
  // - Use the functions in util and GameService and alter them iteratively
  //   in order to use the state machine -> also check how to use the actor

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
  })
})

export {}
