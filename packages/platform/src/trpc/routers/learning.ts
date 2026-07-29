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

const byIdInput = z.object({ id: idSchema })

function normalizeSelection(selection: string | number[]) {
  if (Array.isArray(selection)) {
    return JSON.stringify(selection)
  }

  return selection
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

    byId: playerProcedure.input(byIdInput).query(async ({ input, ctx }) => {
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
          selection: z.union([z.array(z.number().int()), z.string()]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const serializedSelection = normalizeSelection(input.selection)

          const attempt = await PlayService.attemptLearningElement(
            {
              elementId: input.elementId,
              selection: serializedSelection,
            } as any,
            ctx as any
          )

          return toLearningElementAttemptDto(attempt as any)
        } catch (error) {
          // The service JSON.parses the stored/submitted selection; a
          // SyntaxError therefore signals a malformed player payload, not a
          // server fault. Everything else is mapped by the shared middleware.
          if (error instanceof SyntaxError) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid learning element selection payload',
            })
          }

          throw error
        }
      }),

    questAchievements: playerProcedure.query(async ({ ctx }) => {
      const achievements = await ctx.prisma.achievement.findMany({
        where: {
          id: {
            notIn: ['LEARNING_ELEMENT_SOLVED'],
          },
        },
      })

      return achievements ?? []
    }),
  })
}
