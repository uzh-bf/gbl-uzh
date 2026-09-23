import * as DB from '../generated/prisma/client.js'
import log from '../lib/logger.js'
import { getPubSub } from '../lib/pubsub.js'
import type { Event as PlatformEvent } from '../types.js'
import { BaseUserNotificationType as UserNotificationType } from '../types.js'

export const realtimeGameStateSelect = {
  status: true,
  activePeriodIx: true,
  version: true,
  activePeriod: {
    select: {
      activeSegmentIx: true,
    },
  },
} as const

type RealtimeGameState = {
  status: DB.GameStatus
  activePeriodIx: number
  version: number
  activePeriod: {
    activeSegmentIx: number | null
  } | null
}

export async function getGameRealtimeState(
  prisma: DB.PrismaClient,
  gameId: number
) {
  return prisma.game.findUnique({
    where: { id: gameId },
    select: realtimeGameStateSelect,
  }) as Promise<RealtimeGameState | null>
}

export function buildGameRealtimeFacts(
  gameId: number,
  gameState: RealtimeGameState | null,
  extraFacts: Record<string, unknown> = {}
) {
  return {
    ...extraFacts,
    gameId,
    version: gameState?.version ?? 0,
    status: gameState?.status ?? null,
    activePeriodIx: gameState?.activePeriodIx ?? null,
    activeSegmentIx: gameState?.activePeriod?.activeSegmentIx ?? null,
  }
}

/** XP is stored as a PostgreSQL Int; invalid content must not break completion. */
export function rewardXP(reward: unknown): number {
  const xp =
    reward && typeof reward === 'object' && 'xp' in reward ? reward.xp : null
  return typeof xp === 'number' &&
    Number.isInteger(xp) &&
    xp >= 0 &&
    xp <= 2147483647
    ? xp
    : 0
}

export function experienceUpdate(
  player: { experience: number; levelIx: number },
  xp: number,
  levels: { index: number; requiredXP: number }[]
) {
  const experience = player.experience + xp
  const sorted = [...levels].sort((a, b) => a.index - b.index)
  const levelIx = sorted.reduce(
    (index, level) =>
      level.requiredXP <= experience ? Math.max(index, level.index) : index,
    player.levelIx
  )
  return {
    experience: { increment: xp },
    level: { connect: { index: levelIx } },
    experienceToNext:
      sorted.find((level) => level.index > levelIx)?.requiredXP ?? 0,
  }
}

export async function receiveEvents({
  events,
  ctx,
  prisma,
  notify = publishUserNotification,
  inTransaction = false,
}) {
  if (!Array.isArray(events) || events.length === 0) return []

  const definedEvents = await prisma.event.findMany({
    include: {
      achievements: true,
    },
  })

  const definedLevels = await prisma.playerLevel.findMany()

  const perEventOps = await Promise.all(
    events.map(async (event) =>
      receiveEvent(
        { ...event, ctx },
        definedEvents,
        definedLevels,
        prisma,
        notify
      )
    )
  )

  const ops = perEventOps.flat()
  if (ops.length === 0) return []

  const transaction = (prisma as any)?.$transaction
  const results =
    !inTransaction && typeof transaction === 'function'
      ? transaction.call(prisma, ops)
      : Promise.all(ops)

  return results
}

function prepareAchievementData({
  achievementId,
  gameId,
  periodIx,
  playerId,
  count,
}) {
  return {
    count,
    periodIx,
    achievement: { connect: { id: achievementId } },
    game: { connect: { id: gameId } },
    period: { connect: { gameId_index: { gameId, index: periodIx } } },
    player: { connect: { id: playerId } },
  }
}

function evaluateConditions(
  conditions: { fact: string; op: string; value: number }[] | null | undefined,
  facts: Record<string, any> | null | undefined
): boolean {
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0)
    return true
  if (!facts) return false

  return conditions.every((cond) => {
    const actual = facts[cond.fact]
    if (actual == null) return false
    switch (cond.op) {
      case 'gt':
        return actual > cond.value
      case 'gte':
        return actual >= cond.value
      case 'lt':
        return actual < cond.value
      case 'lte':
        return actual <= cond.value
      case 'eq':
        return actual === cond.value
      case 'neq':
        return actual !== cond.value
      default:
        return false
    }
  })
}

export async function receiveEvent(
  event,
  definedEvents,
  definedLevels,
  prisma,
  notify = publishUserNotification
) {
  const matchingEvent = definedEvents.find((item) => item.id === event.type)
  // console.warn(event, matchingEvent)

  // if there is a matching event and it awards achievements, process each
  if (matchingEvent && matchingEvent.achievements?.length > 0) {
    const awardedAchievements: {
      achievements: { achievement: any; achievementInstance: any }[]
      achievementKeys: string[]
      rewards: { xp?: number }
    } = {
      achievements: [],
      achievementKeys: [],
      rewards: {},
    }

    for (const achievement of matchingEvent.achievements) {
      // skip if event facts don't match achievement conditions
      if (!evaluateConditions(achievement.conditions, event.facts)) {
        continue
      }

      const isPeriodScoped = achievement.scope === DB.AchievementScope.PERIOD

      // For GAME-scoped FIRST achievements, skip if already earned globally
      if (
        !isPeriodScoped &&
        achievement.when === DB.AchievementFrequency.FIRST &&
        event.ctx.achievements.includes(achievement.id)
      ) {
        continue
      }

      let existingInstance
      if (isPeriodScoped) {
        // PERIOD scope: look up by (achievementId, playerId, periodIx)
        existingInstance = await prisma.achievementInstance.findUnique({
          where: {
            achievementId_playerId_periodIx: {
              achievementId: achievement.id,
              playerId: event.ctx.args.playerId,
              periodIx: event.ctx.args.periodIx,
            },
          },
        })

        // For PERIOD-scoped FIRST achievements, skip if already earned this period
        if (
          achievement.when === DB.AchievementFrequency.FIRST &&
          existingInstance
        ) {
          continue
        }
      } else {
        // GAME scope: look up by (achievementId, playerId) ignoring period
        existingInstance = await prisma.achievementInstance.findFirst({
          where: {
            achievement: {
              id: achievement.id,
            },
            player: {
              id: event.ctx.args.playerId,
            },
          },
        })
      }

      let achievementInstance
      if (existingInstance) {
        achievementInstance = await prisma.achievementInstance.update({
          where: {
            id: existingInstance.id,
          },
          data: prepareAchievementData({
            count: existingInstance.count + 1,
            achievementId: achievement.id,
            gameId: event.ctx.args.gameId,
            periodIx: event.ctx.args.periodIx,
            playerId: event.ctx.args.playerId,
          }),
        })
      } else {
        achievementInstance = await prisma.achievementInstance.create({
          data: prepareAchievementData({
            count: 1,
            achievementId: achievement.id,
            gameId: event.ctx.args.gameId,
            periodIx: event.ctx.args.periodIx,
            playerId: event.ctx.args.playerId,
          }),
        })
      }

      awardedAchievements.achievements.push({
        achievement,
        achievementInstance,
      })
      awardedAchievements.achievementKeys.push(achievement.id)
      awardedAchievements.rewards = {
        ...awardedAchievements.rewards,
        xp:
          (awardedAchievements.rewards.xp ?? 0) + rewardXP(achievement.reward),
      }
    }

    if (awardedAchievements.achievements.length > 0) {
      const update = experienceUpdate(
        { experience: event.ctx.experience, levelIx: event.ctx.currentLevelIx },
        awardedAchievements.rewards.xp ?? 0,
        definedLevels
      )
      const notifications = [
        { type: UserNotificationType.ACHIEVEMENT_RECEIVED },
      ]
      if (update.level.connect.index > event.ctx.currentLevelIx)
        notifications.push({ type: UserNotificationType.LEVEL_UP })
      notify({ user: { sub: event.ctx.args.playerId } }, notifications)
      return [
        prisma.player.update({
          where: { id: event.ctx.args.playerId },
          data: {
            ...update,
            achievementKeys: { push: awardedAchievements.achievementKeys },
          },
        }),
      ]
    }

    return []
  }

  return []
}

export function publishGlobalNotification(event: PlatformEvent<any>) {
  try {
    getPubSub().publish('global:events', event)
    log.info('[EventService] Published to "global:events".', {
      gameId: event?.facts?.gameId ?? null,
      type: event?.type ?? null,
      version: event?.facts?.version ?? null,
    })
  } catch (e) {
    log.error('[EventService] Error during pubSub.publish:', e)
  }
}

export function publishUserNotification(
  ctx: { user: { sub: string } },
  events?: any
) {
  if (events && events.length > 0) {
    // console.log(events)
    getPubSub().publish('user:events', ctx.user.sub, events as any)
  }
}
