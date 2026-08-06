import * as DB from '../../generated/prisma/client.js'

interface GameInfoForPlayerDto {
  id: number
  name: string
  status: DB.GameStatus
  facts: unknown
  activePeriod?: {
    index: number
    activeSegmentIx: number
  }
}

interface PlayerAchievementInstanceDto {
  id: number
  count: number
  periodIx: number
  achievement: {
    id: string
    name: string
    description: string
    image: string | null
    when: DB.AchievementFrequency
    scope: DB.AchievementScope
    activePeriods: number[]
    reward: unknown
  }
}

export interface PlayerSelfDto {
  id: string
  isReady: boolean
  number: number
  name: string
  role?: string | null
  facts: unknown
  experience: number
  experienceToNext: number
  tutorialCompleted: boolean
  achievementKeys: string[]
  achievements: PlayerAchievementInstanceDto[]
  level: {
    id: number
    index: number
  }
  game: GameInfoForPlayerDto
  completedLearningElementIds: string[]
  visitedStoryElementIds: string[]
}

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
        tutorialCompleted?: boolean
        level?: { id?: number; index?: number }
        game: {
          id: number
          name: string
          status: DB.GameStatus
          facts: unknown
          activePeriod?: {
            index?: number
            activeSegmentIx?: number
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
  if (!player) return null

  return {
    id: player.id,
    isReady: Boolean(player.isReady),
    number: player.number,
    name: player.name,
    role: player.role ?? null,
    facts: player.facts,
    experience: player.experience,
    experienceToNext: player.experienceToNext,
    tutorialCompleted: Boolean(player.tutorialCompleted),
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
      activePeriod:
        typeof player.game.activePeriod?.index === 'number' &&
        typeof player.game.activePeriod?.activeSegmentIx === 'number'
          ? {
              index: player.game.activePeriod.index,
              activeSegmentIx: player.game.activePeriod.activeSegmentIx,
            }
          : undefined,
    },
    completedLearningElementIds: player.completedLearningElementIds ?? [],
    visitedStoryElementIds: player.visitedStoryElementIds ?? [],
  }
}
