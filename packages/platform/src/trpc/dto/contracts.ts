import * as DB from '../../generated/prisma/client.js'
import { z } from 'zod'

const storyElementRefDtoSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .strict()

const activeSegmentDtoSchema = z
  .object({
    id: z.number(),
    index: z.number(),
    countdownExpiresAt: z.date().nullable(),
    countdownDurationMs: z.number().nullable(),
    facts: z.unknown(),
    learningElements: z.array(storyElementRefDtoSchema).optional(),
    storyElements: z.array(storyElementRefDtoSchema).optional(),
  })
  .strict()

const periodDtoSchema = z
  .object({
    id: z.number(),
    index: z.number(),
    activeSegmentIx: z.number().nullable(),
    facts: z.unknown(),
    segmentCount: z.number().nullable().optional(),
    segments: z.array(activeSegmentDtoSchema),
    activeSegment: activeSegmentDtoSchema.nullable().optional(),
  })
  .strict()

const adminPlayerDtoSchema = z
  .object({
    id: z.string(),
    isReady: z.boolean(),
    role: z.string().nullable(),
    number: z.number(),
    name: z.string(),
    facts: z.unknown(),
    experience: z.number(),
    experienceToNext: z.number(),
    token: z.string(),
  })
  .strict()

export const gameListItemDtoSchema = z
  .object({
    id: z.number(),
    status: z.nativeEnum(DB.GameStatus),
    name: z.string(),
    activePeriodIx: z.number(),
    activeSegmentIx: z.number().nullable(),
    facts: z.unknown(),
    playersCount: z.number(),
  })
  .strict()

export const adminGameDtoSchema = z
  .object({
    id: z.number(),
    status: z.nativeEnum(DB.GameStatus),
    name: z.string(),
    version: z.number(),
    facts: z.unknown(),
    activePeriodIx: z.number(),
    activeSegmentIx: z.number().nullable(),
    players: z.array(adminPlayerDtoSchema),
    periods: z.array(periodDtoSchema),
    activePeriod: periodDtoSchema.nullable(),
  })
  .strict()

const gameInfoForPlayerDtoSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    status: z.nativeEnum(DB.GameStatus),
    facts: z.unknown(),
    activePeriod: z
      .object({
        index: z.number(),
        activeSegmentIx: z.number(),
      })
      .strict()
      .optional(),
  })
  .strict()

const playerAchievementInstanceDtoSchema = z
  .object({
    id: z.number(),
    count: z.number(),
    periodIx: z.number(),
    achievement: z
      .object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        image: z.string().nullable(),
        when: z.nativeEnum(DB.AchievementFrequency),
        scope: z.nativeEnum(DB.AchievementScope),
        activePeriods: z.array(z.number().int()),
        reward: z.unknown(),
      })
      .strict(),
  })
  .strict()

export const playerSelfDtoSchema = z
  .object({
    id: z.string(),
    isReady: z.boolean(),
    number: z.number(),
    name: z.string(),
    role: z.string().nullable().optional(),
    facts: z.unknown(),
    experience: z.number(),
    experienceToNext: z.number(),
    tutorialCompleted: z.boolean(),
    achievementKeys: z.array(z.string()),
    achievements: z.array(playerAchievementInstanceDtoSchema),
    level: z
      .object({
        id: z.number(),
        index: z.number(),
      })
      .strict(),
    game: gameInfoForPlayerDtoSchema,
    completedLearningElementIds: z.array(z.string()),
    visitedStoryElementIds: z.array(z.string()),
  })
  .strict()

const resultPlayerDtoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .strict()

export const playerResultCoreDtoSchema = z
  .object({
    id: z.number(),
    type: z.nativeEnum(DB.PlayerResultType),
    facts: z.unknown(),
    // The period and segment facts contain operator-only simulation
    // parameters and are intentionally absent from this player-facing DTO.
    period: z
      .object({
        id: z.number(),
        index: z.number(),
      })
      .strict(),
    segment: z
      .object({
        id: z.number(),
        index: z.number(),
      })
      .strict()
      .nullable()
      .optional(),
  })
  .strict()

const playerTransactionDtoSchema = z
  .object({
    id: z.number(),
    periodIx: z.number(),
    segmentIx: z.number().nullable(),
    type: z.string(),
    facts: z.unknown().optional(),
  })
  .strict()

const learningElementRefDtoSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .strict()

const resultStoryElementDtoSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    type: z.nativeEnum(DB.StoryElementType).optional(),
    content: z.string().nullable().optional(),
    contentRole: z.unknown().optional(),
  })
  .strict()

const activeSegmentSummaryDtoSchema = z
  .object({
    id: z.number(),
    index: z.number(),
    facts: z.unknown(),
    countdownExpiresAt: z.date().nullable().optional(),
    countdownDurationMs: z.number().nullable().optional(),
    learningElements: z.array(learningElementRefDtoSchema).optional(),
    storyElements: z.array(resultStoryElementDtoSchema).optional(),
  })
  .strict()

const resultPeriodSummaryDtoSchema = z
  .object({
    id: z.number(),
    index: z.number(),
    activeSegmentIx: z.number().nullable(),
    facts: z.unknown(),
    segmentCount: z.number().nullable().optional(),
    segments: z.array(activeSegmentSummaryDtoSchema),
  })
  .strict()

const resultActivePeriodDtoSchema = resultPeriodSummaryDtoSchema
  .extend({
    activeSegment: activeSegmentSummaryDtoSchema.nullable().optional(),
  })
  .strict()

export const playerResultDtoSchema = z
  .object({
    currentGame: z
      .object({
        id: z.number(),
        status: z.nativeEnum(DB.GameStatus),
        players: z.array(resultPlayerDtoSchema),
        nextAutoContinueAt: z.date().nullable().optional(),
        periods: z.array(resultPeriodSummaryDtoSchema),
        activePeriod: resultActivePeriodDtoSchema.optional(),
      })
      .strict(),
    playerResult: playerResultCoreDtoSchema.nullable(),
    previousResults: z.array(playerResultCoreDtoSchema),
    transactions: z.array(playerTransactionDtoSchema),
  })
  .strict()

export const specificResultDtoSchema = z
  .object({
    id: z.number(),
    type: z.nativeEnum(DB.PlayerResultType),
    facts: z.unknown(),
    period: z
      .object({
        id: z.number(),
        index: z.number(),
      })
      .strict(),
    segment: z
      .object({
        id: z.number(),
        index: z.number(),
      })
      .strict()
      .nullable()
      .optional(),
    player: resultPlayerDtoSchema,
  })
  .strict()

export const pastResultDtoSchema = specificResultDtoSchema

export type StoryElementRefDto = z.infer<typeof storyElementRefDtoSchema>
export type ActiveSegmentDto = z.infer<typeof activeSegmentDtoSchema>
export type PeriodDto = z.infer<typeof periodDtoSchema>
export type AdminPlayerDto = z.infer<typeof adminPlayerDtoSchema>
export type GameListItemDto = z.infer<typeof gameListItemDtoSchema>
export type AdminGameDto = z.infer<typeof adminGameDtoSchema>
export type PlayerSelfDto = z.infer<typeof playerSelfDtoSchema>
export type ResultPlayerDto = z.infer<typeof resultPlayerDtoSchema>
export type PlayerResultCoreDto = z.infer<typeof playerResultCoreDtoSchema>
export type PlayerTransactionDto = z.infer<typeof playerTransactionDtoSchema>
export type LearningElementRefDto = z.infer<typeof learningElementRefDtoSchema>
export type StoryElementDto = z.infer<typeof resultStoryElementDtoSchema>
export type ActiveSegmentSummaryDto = z.infer<
  typeof activeSegmentSummaryDtoSchema
>
export type ResultPeriodSummaryDto = z.infer<
  typeof resultPeriodSummaryDtoSchema
>
export type PlayerResultDto = z.infer<typeof playerResultDtoSchema>
export type SpecificResultDto = z.infer<typeof specificResultDtoSchema>
export type PastResultDto = z.infer<typeof pastResultDtoSchema>
