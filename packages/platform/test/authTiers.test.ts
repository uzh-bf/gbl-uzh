// Behavioral baseline for the four procedure tiers exported from
// src/trpc/init.ts (public/protected/admin/player). One representative
// procedure per tier, picked for a happy path that is cheap to satisfy with
// a small prisma mock.
//
// NOTE on scope: `enforceRole` (admin/player) checks both "is there a user"
// and "does the role match". `enforceAuthenticatedUser` (protected) only
// checks "is there a user" - it never throws FORBIDDEN, so there is no
// wrong-role case to assert for the protected tier. `publicProcedure` runs no
// auth middleware at all, so it can throw neither UNAUTHORIZED nor FORBIDDEN
// from the tier itself; those two cases are asserted as "does not reject
// regardless of caller identity" instead of contorting a procedure into
// throwing errors its tier structurally cannot produce.
import { beforeEach, describe, expect, it } from '@jest/globals'
import { createPlatformRouter } from '../src/trpc/createPlatformRouter.js'
import { createCallerFactory } from '../src/trpc/init.js'
import { UserRole } from '../src/types.js'
import { createMockPrisma, createTestContext } from './helpers.js'

const router = createPlatformRouter({})
const createCaller = createCallerFactory(router)

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret'
})

describe('public tier: auth.loginAsTeam', () => {
  function mockMatchingPlayer(prisma: ReturnType<typeof createMockPrisma>) {
    prisma.player.findUnique.mockResolvedValue({
      id: 'player-1',
      gameId: 1,
      token: 'team-token',
      role: 'PLAYER',
      isReady: false,
      number: 1,
      name: 'Team 1',
      facts: {},
      experience: 0,
      experienceToNext: 100,
      level: { id: 1, index: 0 },
      achievements: [],
      achievementKeys: [],
      completedLearningElementIds: [],
      visitedStoryElementIds: [],
      game: {
        id: 1,
        name: 'Test Game',
        status: 'RUNNING',
        facts: {},
        activePeriod: undefined,
      },
    })
  }

  it('proceeds with no ctx.user (no UNAUTHORIZED from the tier)', async () => {
    const prisma = createMockPrisma()
    mockMatchingPlayer(prisma)
    const caller = createCaller(createTestContext({ prisma }))

    await expect(
      caller.auth.loginAsTeam({ token: 'team-token' })
    ).resolves.toMatchObject({ id: 'player-1' })
  })

  it('proceeds regardless of an existing caller role (no FORBIDDEN from the tier)', async () => {
    const prisma = createMockPrisma()
    mockMatchingPlayer(prisma)
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'admin-1', role: UserRole.ADMIN },
      })
    )

    await expect(
      caller.auth.loginAsTeam({ token: 'team-token' })
    ).resolves.toMatchObject({ id: 'player-1' })
  })
})

describe('protected tier: learning.list', () => {
  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(caller.learning.list()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })

  it('succeeds for any authenticated role (protectedProcedure does not gate on role)', async () => {
    const prisma = createMockPrisma()
    prisma.learningElement.findMany.mockResolvedValue([])
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER },
      })
    )

    await expect(caller.learning.list()).resolves.toEqual([])
  })
})

describe('admin tier: game.list', () => {
  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(caller.game.list()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })

  it('rejects with FORBIDDEN for a PLAYER caller', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER },
      })
    )

    await expect(caller.game.list()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('succeeds for an ADMIN caller', async () => {
    const prisma = createMockPrisma()
    prisma.game.findMany.mockResolvedValue([])
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'admin-1', role: UserRole.ADMIN },
      })
    )

    await expect(caller.game.list()).resolves.toEqual([])
  })
})

describe('player tier: play.self', () => {
  const playerFixture = {
    id: 'player-1',
    isReady: false,
    number: 1,
    name: 'Team 1',
    role: 'PLAYER',
    facts: {},
    experience: 0,
    experienceToNext: 100,
    tutorialCompleted: false,
    achievementKeys: [],
    achievements: [],
    level: { id: 1, index: 0 },
    game: {
      id: 1,
      name: 'Test Game',
      status: 'RUNNING',
      facts: {},
      activePeriod: undefined,
    },
    completedLearningElementIds: [],
    visitedStoryElementIds: [],
  }

  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(caller.play.self()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })

  it('rejects with FORBIDDEN for an ADMIN caller', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'admin-1', role: UserRole.ADMIN },
      })
    )

    await expect(caller.play.self()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('succeeds for a PLAYER caller', async () => {
    const prisma = createMockPrisma()
    prisma.player.findUnique.mockResolvedValue(playerFixture)
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER },
      })
    )

    await expect(caller.play.self()).resolves.toMatchObject({
      id: 'player-1',
      name: 'Team 1',
    })
  })

  it('updates readiness without requiring unloaded player relations', async () => {
    const prisma = createMockPrisma()
    prisma.player.update.mockResolvedValue({
      id: 'player-1',
      isReady: true,
    })
    prisma.game.findUnique.mockResolvedValue({
      status: 'RUNNING',
      activePeriodIx: 0,
      version: 2,
      activePeriod: { activeSegmentIx: 0 },
    })
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER, gameId: 1 },
      })
    )

    await expect(
      caller.play.updateReadyState({ isReady: true })
    ).resolves.toEqual({ id: 'player-1', isReady: true })
  })
})
