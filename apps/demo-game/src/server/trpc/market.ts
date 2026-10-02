import {
  adminProcedure,
  assertGameOwnership,
  createTRPCRouter,
  EventService,
  type PlatformContext,
} from '@gbl-uzh/platform'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import prisma from '../../lib/prisma'
import {
  canRevealMarketRoll,
  getMarketDice,
  revealMarketRoll,
} from '../../services/MarketRevealService'

const segmentInput = z.object({ segmentId: z.number().int() })

// Admins may only read or reveal dice for games they own. Resolve the segment's
// game first and fail with NOT_FOUND for anything else, like the platform's
// game routes.
async function assertSegmentOwnership(ctx: PlatformContext, segmentId: number) {
  const segment = await prisma.periodSegment.findUnique({
    where: { id: segmentId },
    select: { gameId: true },
  })
  if (!segment) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Segment not found' })
  }
  await assertGameOwnership(ctx, segment.gameId)
}

// The reveal service publishes through a pub/sub-shaped dependency; route it
// to the platform's game-scoped realtime channel, which player SSE
// subscriptions listen on.
const pubSub = {
  publish: (
    _channel: 'global:events',
    event: { type: string; facts: { gameId: number } }
  ) => EventService.publishGlobalNotification(event.facts.gameId, event),
}

export const marketRouter = createTRPCRouter({
  dice: adminProcedure.input(segmentInput).query(async ({ input, ctx }) => {
    await assertSegmentOwnership(ctx, input.segmentId)
    const segment = await getMarketDice(input.segmentId, {
      prisma,
      user: ctx.user,
    })
    if (!segment) return null
    return {
      id: segment.id,
      gameId: segment.gameId,
      periodIx: segment.periodIx,
      index: segment.index,
      facts: segment.facts,
      periodFacts: segment.period.facts,
      canReveal: canRevealMarketRoll(segment),
    }
  }),

  revealRoll: adminProcedure
    .input(segmentInput.extend({ rollIndex: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      await assertSegmentOwnership(ctx, input.segmentId)
      const segment = await revealMarketRoll(input.segmentId, input.rollIndex, {
        prisma,
        user: ctx.user,
        pubSub,
      })
      return { id: segment.id, facts: segment.facts }
    }),
})
