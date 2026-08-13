// play.performAction (src/trpc/routers/play.ts) validates the parsed action
// payload against an injected yup `ActionFactsSchema` before it ever reaches
// PlayService.performActionWithRetry. A yup ValidationError maps to
// BAD_REQUEST via throwAsTRPCError/asTRPCCodeFromServiceError. This is the
// schema seam: invalid payload never reaches the service layer; valid
// payload proceeds into it (services.Actions.apply, injected via
// createPlatformRouter({ services })).
import { describe, expect, it, jest } from '@jest/globals'
import * as yup from 'yup'
import { createCallerFactory } from '../src/trpc/init.js'
import { createPlatformRouter } from '../src/trpc/createPlatformRouter.js'
import { UserRole } from '../src/types.js'
import { createMockPrisma, createTestContext } from './helpers.js'

const ActionFactsSchema = yup.object({
  amount: yup.number().required(),
})

function buildCaller(
  prisma: ReturnType<typeof createMockPrisma>,
  actionsApply: ReturnType<typeof jest.fn>
) {
  const router = createPlatformRouter({
    schemas: { ActionFactsSchema },
    services: {
      Actions: {
        apply: actionsApply,
      },
    },
  })
  const createCaller = createCallerFactory(router)

  return createCaller(
    createTestContext({
      prisma,
      user: { sub: 'player-1', role: UserRole.PLAYER, gameId: 1 },
    })
  )
}

function buildCallerWithoutActionFactsSchema(
  prisma: ReturnType<typeof createMockPrisma>,
  actionsApply: ReturnType<typeof jest.fn>
) {
  const router = createPlatformRouter({
    services: {
      Actions: {
        apply: actionsApply,
      },
    },
  })
  const createCaller = createCallerFactory(router)

  return createCaller(
    createTestContext({
      prisma,
      user: { sub: 'player-1', role: UserRole.PLAYER, gameId: 1 },
    })
  )
}

describe('play.performAction schema seam', () => {
  it('fails closed when the game-specific action schema is not injected', async () => {
    const prisma = createMockPrisma()
    prisma.game.findUnique.mockResolvedValue({
      id: 1,
      activePeriod: { id: 10, index: 0 },
      activePeriodIx: 0,
    })
    const actionsApply = jest.fn()
    const caller = buildCallerWithoutActionFactsSchema(prisma, actionsApply)

    await expect(
      caller.play.performAction({
        type: 'DO_THING',
        payload: JSON.stringify({ amount: 5 }),
      })
    ).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' })

    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(actionsApply).not.toHaveBeenCalled()
  })

  it('rejects an invalid payload with BAD_REQUEST before reaching the service layer', async () => {
    const prisma = createMockPrisma()
    // GameService.getGameFromContext must resolve a game with an active
    // period, or the router short-circuits to `null` before validation runs.
    prisma.game.findUnique.mockResolvedValue({
      id: 1,
      activePeriod: { id: 10, index: 0 },
      activePeriodIx: 0,
    })
    const actionsApply = jest.fn()
    const caller = buildCaller(prisma, actionsApply)

    await expect(
      caller.play.performAction({
        type: 'DO_THING',
        payload: JSON.stringify({ amount: 'not-a-number' }),
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })

    // The schema rejection must short-circuit before the transaction /
    // service reducer ever runs.
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(actionsApply).not.toHaveBeenCalled()
  })

  it('proceeds into the service layer once the payload passes schema validation', async () => {
    const prisma = createMockPrisma()
    prisma.game.findUnique.mockResolvedValue({
      id: 1,
      activePeriod: { id: 10, index: 0 },
      activePeriodIx: 0,
    })

    const previousResult = {
      facts: { total: 0 },
      game: { id: 1, status: 'RUNNING' },
      segment: { facts: {}, index: 0, id: 100 },
      period: { facts: {}, index: 0, segmentCount: 1, id: 10 },
      player: {
        id: 'player-1',
        role: 'PLAYER',
        achievementKeys: [],
        experience: 0,
        levelIx: 0,
      },
    }

    const tx = createMockPrisma()
    tx.playerResult.findUnique.mockResolvedValue(previousResult)
    // `$transaction` is invoked with (fn, options); resolve by running the
    // callback against our transaction-scoped mock prisma.
    prisma.$transaction.mockImplementation((fn: any) => fn(tx))

    const actionsApply = jest.fn().mockReturnValue({
      result: { total: 5 },
      isDirty: false,
    })
    const caller = buildCaller(prisma, actionsApply)

    await expect(
      caller.play.performAction({
        type: 'DO_THING',
        payload: JSON.stringify({ amount: 5 }),
      })
    ).resolves.toBeNull()

    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(actionsApply).toHaveBeenCalledTimes(1)
    expect(actionsApply).toHaveBeenCalledWith(
      previousResult.facts,
      expect.objectContaining({
        type: 'DO_THING',
        payload: expect.objectContaining({ playerArgs: { amount: 5 } }),
      })
    )
  })
})
