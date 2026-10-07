import * as DB from '../../generated/prisma/client.js'
import type { PlayerSelfDto } from './contracts.js'

export function toPlayerSelfDto(
  player:
    | {
        id: string
        isReady: boolean
        number: number
        role?: string | null
        name: string
        facts: unknown
        experience: number
        experienceToNext: number
        tutorialCompleted: boolean
        level?: { id?: number; index?: number }
        game: {
          id: number
          name: string
          status: DB.GameStatus
          facts: unknown
          activePeriod?: {
            index?: number
            activeSegmentIx?: number | null
          }
        }
        achievementKeys?: string[]
        achievements?: unknown[]
        completedLearningElementIds?: string[]
        visitedStoryElementIds?: string[]
      }
    | null
    | undefined
): PlayerSelfDto | null {
  // Callers pass service results untyped, so a query that forgot to include
  // the game relation must not crash the mapper.
  if (!player?.game) return null

  const { activePeriod } = player.game

  return {
    id: player.id,
    isReady: Boolean(player.isReady),
    number: player.number,
    name: player.name,
    role: player.role ?? null,
    facts: player.facts,
    experience: player.experience,
    experienceToNext: player.experienceToNext,
    tutorialCompleted: player.tutorialCompleted,
    achievementKeys: player.achievementKeys ?? [],
    achievements: (player.achievements ?? []).map((entry) => {
      const item = entry as any
      return {
        id: item?.id ?? 0,
        count: item?.count ?? 0,
        periodIx: item?.periodIx ?? 0,
        achievement: {
          id: item?.achievement?.id ?? '',
          name: item?.achievement?.name ?? '',
          description: item?.achievement?.description ?? '',
          image: item?.achievement?.image ?? null,
          when: item?.achievement?.when ?? DB.AchievementFrequency.FIRST,
          scope: item?.achievement?.scope ?? DB.AchievementScope.GAME,
          activePeriods: item?.achievement?.activePeriods ?? [],
          reward: item?.achievement?.reward ?? null,
        },
      }
    }),
    level: {
      id: player.level?.id ?? 0,
      index: player.level?.index ?? 0,
    },
    game: {
      id: player.game.id,
      name: player.game.name,
      status: player.game.status,
      facts: player.game.facts,
      // -1 is the database default for a period without an active segment.
      activePeriod:
        typeof activePeriod?.index === 'number'
          ? {
              index: activePeriod.index,
              activeSegmentIx: activePeriod.activeSegmentIx ?? -1,
            }
          : undefined,
    },
    completedLearningElementIds: player.completedLearningElementIds ?? [],
    visitedStoryElementIds: player.visitedStoryElementIds ?? [],
  }
}
