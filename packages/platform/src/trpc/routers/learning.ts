import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  createTRPCRouter,
  playerProcedure,
  protectedProcedure,
} from '../init.js'
import { idSchema } from '../schemas.js'
import * as GameService from '../../services/GameService.js'
import * as PlayService from '../../services/PlayService.js'
import {
  type LearningElementListDto,
  toLearningElementAttemptDto,
  toLearningElementListDto,
  toLearningElementStateDto,
} from '../dto/learning.js'
import {
  questAchievementDtoSchema,
  toQuestAchievementDto,
} from '../dto/content.js'

const selectionSchema = z.array(z.number().int().nonnegative())

// The service grades a JSON array of option positions. A string selection is
// parsed and checked here, because the service turns parse errors into null.
function normalizeSelection(selection: string | number[]) {
  let parsed: unknown = selection
  if (typeof selection === 'string') {
    try {
      parsed = JSON.parse(selection)
    } catch {
      parsed = undefined
    }
  }

  const result = selectionSchema.safeParse(parsed)
  if (!result.success) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid learning element selection payload',
    })
  }

  return JSON.stringify(result.data)
}

export function createLearningRouter() {
  return createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      const elements = await GameService.getLearningElements({}, ctx as any)

      return (elements ?? [])
        .map((element: any) => toLearningElementListDto(element))
        .filter(
          (element): element is LearningElementListDto => element !== null
        )
    }),

    byId: playerProcedure
      .input(z.object({ id: idSchema }))
      .query(async ({ input, ctx }) => {
        const state = await PlayService.getLearningElement(
          { id: input.id },
          ctx as any
        )

        return toLearningElementStateDto(state as any)
      }),

    attempt: playerProcedure
      .input(
        z.object({
          elementId: idSchema,
          selection: z.union([selectionSchema, z.string()]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const attempt = await PlayService.attemptLearningElement(
          {
            elementId: input.elementId,
            selection: normalizeSelection(input.selection),
          },
          ctx as any
        )

        return toLearningElementAttemptDto(attempt as any)
      }),

    questAchievements: playerProcedure
      .output(z.array(questAchievementDtoSchema))
      .query(async ({ ctx }) => {
        const achievements = await ctx.prisma.achievement.findMany({
          where: {
            id: {
              notIn: ['LEARNING_ELEMENT_SOLVED'],
            },
          },
          select: {
            id: true,
            name: true,
            namesByRole: true,
            description: true,
            descriptionsByRole: true,
            image: true,
            when: true,
            scope: true,
            activePeriods: true,
            reward: true,
          },
        })

        return (achievements ?? [])
          .map((achievement: any) => toQuestAchievementDto(achievement))
          .filter(
            (achievement): achievement is NonNullable<typeof achievement> =>
              achievement !== null
          )
      }),
  })
}
