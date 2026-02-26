import * as DB from '@prisma/client'
import { pubSub } from '../lib/pubsub.js'
import { BaseUserNotificationType as UserNotificationType } from '../types.js'
import type {
  BaseGlobalNotificationType,
  Event as PlatformEvent,
} from '../types.js'
import log from '../lib/logger.js'

export async function receiveEvents({ events, ctx, prisma }) {
  if (!Array.isArray(events) || events.length === 0) return []

  const definedEvents = await prisma.event.findMany({
    include: {
      achievements: true,
    },
  })

  const definedLevels = await prisma.playerLevel.findMany()

  const perEventOps = await Promise.all(
    events.map(async (event) =>
      receiveEvent({ ...event, ctx }, definedEvents, definedLevels, prisma)
    )
  )

  const ops = perEventOps.flat()
  if (ops.length === 0) return []

  const transaction = (prisma as any)?.$transaction
  const results =
    typeof transaction === 'function' ? transaction.call(prisma, ops) : Promise.all(ops)

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
  prisma
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
          (awardedAchievements.rewards.xp ?? 0) + (achievement.reward?.xp ?? 0),
      }
    }

    const currentLevelPlus1 = definedLevels.find(
      (level) => level.index === event.ctx.currentLevelIx + 1
    )

    const currentLevelPlus2 = definedLevels.find(
      (level) => level.index === event.ctx.currentLevelIx + 2
    )

    if (awardedAchievements.achievements.length > 0) {
      if (
        event.ctx.experience + awardedAchievements.rewards.xp >=
        currentLevelPlus1.requiredXP
      ) {
        publishUserNotification(
          {
            user: {
              sub: event.ctx.args.playerId,
            },
          },
          [
            {
              type: UserNotificationType.ACHIEVEMENT_RECEIVED,
            },
          ]
        )
        publishUserNotification(
          {
            user: {
              sub: event.ctx.args.playerId,
            },
          },
          [
            {
              type: UserNotificationType.LEVEL_UP,
            },
          ]
        )

        return [
          prisma.player.update({
            where: {
              id: event.ctx.args.playerId,
            },
            data: {
              experience: {
                increment: awardedAchievements.rewards.xp,
              },
              experienceToNext: currentLevelPlus2.requiredXP,
              level: {
                connect: {
                  index: currentLevelPlus1.index,
                },
              },
              achievementKeys: {
                push: awardedAchievements.achievementKeys,
              },
            },
          }),
        ]
      } else {
        publishUserNotification(
          {
            user: {
              sub: event.ctx.args.playerId,
            },
          },
          [
            {
              type: UserNotificationType.ACHIEVEMENT_RECEIVED,
            },
          ]
        )

        return [
          prisma.player.update({
            where: {
              id: event.ctx.args.playerId,
            },
            data: {
              experience: {
                increment: awardedAchievements.rewards.xp,
              },
              achievementKeys: {
                push: awardedAchievements.achievementKeys,
              },
            },
          }),
        ]
      }
    }

    return []
  }

  return []
}

export function publishGlobalNotification(event: PlatformEvent<any>) {
  try {
    pubSub.publish('global:events', event)
    log.info('[EventService] Successfully published to "global:events".')
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
    pubSub.publish('user:events', ctx.user.sub, events as any)
  }
}
