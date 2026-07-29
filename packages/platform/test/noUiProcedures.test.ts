// The six routed procedures with no corresponding UI in demo-game (roadmap
// item D4). Each gets one auth-tier assertion (representative wrong-role /
// missing-user case, since the full four-way matrix is already covered by
// test/authTiers.test.ts) plus one happy path against a minimal mocked
// prisma fixture, read off the exact prisma calls in the underlying router
// and service.
import { createCallerFactory } from '../src/trpc/init.js'
import { createPlatformRouter } from '../src/trpc/createPlatformRouter.js'
import { UserRole } from '../src/types.js'
import { createMockPrisma, createTestContext } from './helpers.js'

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret'
})

const router = createPlatformRouter({})
const createCaller = createCallerFactory(router)

describe('game.toggleSwitch (admin, gameId input)', () => {
  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(
      caller.game.toggleSwitch({ gameId: 1, toggle: true })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('rejects with FORBIDDEN for a PLAYER caller', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER },
      })
    )

    await expect(
      caller.game.toggleSwitch({ gameId: 1, toggle: true })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('toggles the switch and returns the new value for the owning admin', async () => {
    const prisma = createMockPrisma()
    prisma.game.findFirst.mockResolvedValue({ id: 1 }) // ownership check
    prisma.game.findUnique.mockResolvedValue({
      facts: { toggle: false },
      activePeriod: { id: 10, activeSegment: { id: 100 } },
    })
    prisma.game.update.mockResolvedValue({
      status: 'RUNNING',
      activePeriodIx: 0,
      version: 2,
      activePeriod: { activeSegmentIx: 0 },
    })
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'admin-1', role: UserRole.ADMIN },
      })
    )

    await expect(
      caller.game.toggleSwitch({ gameId: 1, toggle: true })
    ).resolves.toBe(true)
  })
})

describe('play.saveConsolidationDecision (player, no game-id input)', () => {
  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(
      caller.play.saveConsolidationDecision({ payload: '{}' })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('rejects with FORBIDDEN for an ADMIN caller', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'admin-1', role: UserRole.ADMIN },
      })
    )

    await expect(
      caller.play.saveConsolidationDecision({ payload: '{}' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('saves the decision and returns it for the CONSOLIDATION phase', async () => {
    const prisma = createMockPrisma()
    prisma.game.findUnique.mockResolvedValue({
      id: 1,
      status: 'CONSOLIDATION',
      activePeriod: { index: 0, activeSegment: { id: 100 } },
    })
    prisma.playerDecision.upsert.mockResolvedValue({
      id: 5,
      type: 'CONSOLIDATION',
      facts: { choice: 'A' },
    })
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER, gameId: 1 },
      })
    )

    await expect(
      caller.play.saveConsolidationDecision({
        payload: JSON.stringify({ choice: 'A' }),
      })
    ).resolves.toEqual({ id: 5, type: 'CONSOLIDATION', facts: { choice: 'A' } })
  })
})

describe('results.listForCurrentGame (player, no input)', () => {
  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(caller.results.listForCurrentGame()).rejects.toMatchObject({
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

    await expect(caller.results.listForCurrentGame()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('returns the mapped results for the current game', async () => {
    const prisma = createMockPrisma()
    prisma.playerResult.findMany.mockResolvedValue([
      {
        id: 1,
        type: 'SEGMENT_END',
        facts: { score: 1 },
        period: { id: 10, index: 0 },
        segment: { id: 100, index: 0 },
      },
    ])
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER, gameId: 1 },
      })
    )

    await expect(caller.results.listForCurrentGame()).resolves.toEqual([
      {
        id: 1,
        type: 'SEGMENT_END',
        facts: { score: 1 },
        period: { id: 10, index: 0 },
        segment: { id: 100, index: 0 },
      },
    ])
  })
})

describe('results.pastForPlayer (player, no input)', () => {
  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(caller.results.pastForPlayer()).rejects.toMatchObject({
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

    await expect(caller.results.pastForPlayer()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('returns past PERIOD_END results before the active period', async () => {
    const prisma = createMockPrisma()
    prisma.game.findUnique.mockResolvedValue({ id: 1, activePeriodIx: 2 })
    prisma.playerResult.findMany.mockResolvedValue([
      {
        id: 1,
        type: 'PERIOD_END',
        facts: { score: 1 },
        period: { id: 10, index: 1, facts: {} },
        player: { id: 'player-1', name: 'Team 1' },
      },
    ])
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER, gameId: 1 },
      })
    )

    const result = await caller.results.pastForPlayer()
    expect(result).toHaveLength(1)
    expect(result?.[0]).toMatchObject({ id: 1, type: 'PERIOD_END' })
  })
})

describe('learning.questAchievements (player, no input)', () => {
  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(caller.learning.questAchievements()).rejects.toMatchObject({
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

    await expect(caller.learning.questAchievements()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('returns the non-learning-element quest achievements', async () => {
    const prisma = createMockPrisma()
    prisma.achievement.findMany.mockResolvedValue([
      { id: 'FIRST_TRADE', name: 'First Trade' },
    ])
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER },
      })
    )

    await expect(caller.learning.questAchievements()).resolves.toEqual([
      { id: 'FIRST_TRADE', name: 'First Trade' },
    ])
    expect(prisma.achievement.findMany).toHaveBeenCalledWith({
      where: { id: { notIn: ['LEARNING_ELEMENT_SOLVED'] } },
    })
  })
})

describe('auth.logoutAsTeam (player, no input)', () => {
  it('rejects with UNAUTHORIZED when there is no user', async () => {
    const prisma = createMockPrisma()
    const caller = createCaller(createTestContext({ prisma }))

    await expect(caller.auth.logoutAsTeam()).rejects.toMatchObject({
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

    await expect(caller.auth.logoutAsTeam()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('destroys the session and returns true for a known player', async () => {
    const prisma = createMockPrisma()
    prisma.player.findUnique.mockResolvedValue({ id: 'player-1' })
    const caller = createCaller(
      createTestContext({
        prisma,
        user: { sub: 'player-1', role: UserRole.PLAYER },
      })
    )

    await expect(caller.auth.logoutAsTeam()).resolves.toBe(true)
  })
})
