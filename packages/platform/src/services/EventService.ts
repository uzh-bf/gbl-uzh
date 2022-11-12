import { AchievementFrequency } from '../generated/ops'
import { pubSub } from '../lib/pubsub'
import { BaseUserNotificationType as UserNotificationType } from '../types'

export async function receiveEvents({ events, ctx, prisma }) {
  if (!Array.isArray(events)) return

  const definedEvents = await prisma.event.findMany({
    include: {
      achievements: true,
    },
  })

  const definedLevels = await prisma.playerLevel.findMany()

  const promises = await Promise.all(
    events.map(async (event) =>
      receiveEvent({ ...event, ctx }, definedEvents, definedLevels, prisma)
    )
  )

  const results = prisma.$transaction(promises.flat())

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
    achievement: { connect: { id: achievementId } },
    game: { connect: { id: gameId } },
    period: { connect: { gameId_index: { gameId, index: periodIx } } },
    player: { connect: { id: playerId } },
  }
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
    const awardedAchievements = await matchingEvent.achievements.reduce(
      async (acc, achievement) => {
        if (
          achievement.when === AchievementFrequency.First &&
          event.ctx.achievements.includes(achievement.id)
        ) {
          return acc
        }

        const existingInstance = await prisma.achievementInstance.findFirst({
          where: {
            achievement: {
              id: achievement.id,
            },
            player: {
              id: event.ctx.args.playerId,
            },
          },
        })

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

        return {
          achievements: [
            ...acc.achievements,
            {
              achievement,
              achievementInstance,
            },
          ],
          achievementKeys: [...acc.achievementKeys, achievement.id],
          rewards: {
            ...acc.rewards,
            xp: (acc.rewards.xp ?? 0) + (achievement.reward?.xp ?? 0),
          },
        }
      },
      {
        achievements: [],
        achievementKeys: [],
        rewards: {},
      }
    )

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

export function publishGlobalNotification(event: any) {
  // console.log(event)
  pubSub.publish('global:events', event as any)
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
