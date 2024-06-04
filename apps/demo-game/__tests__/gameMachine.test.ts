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

  it('creates a new Game', () => {
    GameService.createGame({ name: nameGame, playerCount: playerCount }, ctx, {
      roleAssigner,
    })
  })
})

export {}
