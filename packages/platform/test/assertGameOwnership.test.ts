// assertGameOwnership (src/trpc/init.ts) scopes every admin gameId-taking
// route to games the caller owns (Game.ownerId === user.sub), throwing
// NOT_FOUND rather than FORBIDDEN so a non-owner cannot even confirm the
// game exists. Covers the function directly, then exercises it through a
// real admin route (game.toggleSwitch) to confirm it actually gates the
// router as wired.
import {
  assertGameOwnership,
  createCallerFactory,
} from '../src/trpc/init.js'
import { createPlatformRouter } from '../src/trpc/createPlatformRouter.js'
import { UserRole } from '../src/types.js'
import { createMockPrisma, createTestContext } from './helpers.js'

describe('assertGameOwnership (direct)', () => {
  it('throws NOT_FOUND when prisma.game.findFirst resolves null', async () => {
    const prisma = createMockPrisma()
    prisma.game.findFirst.mockResolvedValue(null)
    const ctx = createTestContext({
      prisma,
      user: { sub: 'admin-1', role: UserRole.ADMIN },
    })

    await expect(assertGameOwnership(ctx, 42)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
    expect(prisma.game.findFirst).toHaveBeenCalledWith({
      where: { id: 42, ownerId: 'admin-1' },
      select: { id: true },
    })
  })

  it('resolves without throwing when a matching owned game is returned', async () => {
    const prisma = createMockPrisma()
    prisma.game.findFirst.mockResolvedValue({ id: 42 })
    const ctx = createTestContext({
      prisma,
      user: { sub: 'admin-1', role: UserRole.ADMIN },
    })

    await expect(assertGameOwnership(ctx, 42)).resolves.toBeUndefined()
  })

  it('throws UNAUTHORIZED when there is no authenticated user', async () => {
    const prisma = createMockPrisma()
    const ctx = createTestContext({ prisma })

    await expect(assertGameOwnership(ctx, 42)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
    expect(prisma.game.findFirst).not.toHaveBeenCalled()
  })
})

describe('assertGameOwnership through a real admin route (game.toggleSwitch)', () => {
  const router = createPlatformRouter({})
  const createCaller = createCallerFactory(router)

  it('rejects NOT_FOUND before the handler runs when the admin does not own the game', async () => {
    const prisma = createMockPrisma()
    prisma.game.findFirst.mockResolvedValue(null)
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'admin-1', role: UserRole.ADMIN },
      })
    )

    await expect(
      caller.game.toggleSwitch({ gameId: 42, toggle: true })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    // PlayService.toggleSwitch must never run for a non-owned game.
    expect(prisma.game.findUnique).not.toHaveBeenCalled()
  })

  it('proceeds into the handler once ownership is confirmed', async () => {
    const prisma = createMockPrisma()
    prisma.game.findFirst.mockResolvedValue({ id: 42 })
    // No active segment -> PlayService.toggleSwitch short-circuits to null
    // without further prisma writes; proves the handler ran past the
    // ownership gate.
    prisma.game.findUnique.mockResolvedValue(null)
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'admin-1', role: UserRole.ADMIN },
      })
    )

    await expect(
      caller.game.toggleSwitch({ gameId: 42, toggle: true })
    ).resolves.toBeNull()
    expect(prisma.game.findUnique).toHaveBeenCalled()
  })
})
