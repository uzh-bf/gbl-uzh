import type { PrismaClient } from '../generated/prisma/client'
import { parseFacts } from '../lib/facts'
import { readMarketRoll, revealedIndices } from '../lib/market'

type Context = {
  prisma: PrismaClient
  user?: { role?: string }
  pubSub: {
    publish: (
      channel: 'global:events',
      event: { type: string; facts: { gameId: number } }
    ) => unknown
  }
}

export function requireMarketAdmin(user?: { role?: string }) {
  if (user?.role !== 'ADMIN' && user?.role !== 'MASTER')
    throw new Error('Only admins can reveal market rolls.')
}

export function canRevealMarketRoll(segment: {
  periodIx: number
  index: number
  game: { activePeriodIx: number }
  period: { activeSegmentIx: number }
}) {
  return (
    segment.periodIx < segment.game.activePeriodIx ||
    (segment.periodIx === segment.game.activePeriodIx &&
      segment.index <= segment.period.activeSegmentIx)
  )
}

export async function getMarketDice(
  segmentId: number,
  ctx: Pick<Context, 'prisma' | 'user'>
) {
  requireMarketAdmin(ctx.user)
  return ctx.prisma.periodSegment.findUnique({
    where: { id: segmentId },
    include: { period: true, game: true },
  })
}

export async function revealMarketRoll(
  segmentId: number,
  rollIndex: number,
  ctx: Context
) {
  requireMarketAdmin(ctx.user)
  if (!Number.isInteger(rollIndex) || rollIndex < 0)
    throw new Error('Invalid monthly roll.')
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const segment = await ctx.prisma.$transaction(
        async (tx) => {
          const segment = await tx.periodSegment.findUnique({
            where: { id: segmentId },
            include: { period: true, game: true },
          })
          if (!segment) throw new Error('Segment not found.')
          if (!canRevealMarketRoll(segment))
            throw new Error('Future segments cannot be revealed.')
          if (!readMarketRoll(segment.facts, rollIndex))
            throw new Error('Invalid or unavailable monthly roll.')
          const indices = revealedIndices(segment.facts)
          if (indices.includes(rollIndex)) return segment
          return tx.periodSegment.update({
            where: { id: segmentId },
            data: {
              facts: {
                ...parseFacts(segment.facts),
                revealedRollIndices: [...indices, rollIndex].sort(
                  (a, b) => a - b
                ),
              },
            },
          })
        },
        { isolationLevel: 'Serializable' }
      )
      // A repeated request also pokes clients, recovering a missed notification.
      await ctx.pubSub.publish('global:events', {
        type: 'MARKET_ROLL_REVEALED',
        facts: { gameId: segment.gameId },
      })
      return segment
    } catch (error) {
      if (attempt === 4 || (error as { code?: string }).code !== 'P2034')
        throw error
    }
  }
  throw new Error('Could not publish the roll. Please retry.')
}
