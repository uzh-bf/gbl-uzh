import { GameService, UserRole } from '@gbl-uzh/platform'
import { PrismaClient } from '@prisma/client'

describe('Testing Demo Game', () => {
  const nameGame = 'TestDemoGame'
  const playerCount = 1
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

  // TODO(Jakob):
  // - flag if it should create new game or find existing one
  //   (implement helper for that)
  // - flag for clearing the prisma db and do from scratch
  // - what is the return of GameService.createGame and what is it used for?

  // - Add state machine in the platform code and add it here
  // - Use the functions in util and GameService and alter them iteratively
  //   in order to use the state machine -> also check how to use the actor

  it('creates a new Game', () => {
    GameService.createGame({ name: nameGame, playerCount: playerCount }, ctx, {
      roleAssigner,
    })
  })
})

export {}
