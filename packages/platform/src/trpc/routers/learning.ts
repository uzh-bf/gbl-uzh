import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, playerProcedure } from '../init.js'
import { idSchema } from '../schemas.js'
import * as GameService from '../../services/GameService.js'
import * as PlayService from '../../services/PlayService.js'
import {
  type LearningElementListDto,
  toLearningElementAttemptDto,
  toLearningElementListDto,
  toLearningElementStateDto,
} from '../dto/learning.js'
import { throwAsTRPCError } from '../errors.js'

const byIdInput = z.object({ id: idSchema })

function normalizeSelection(selection: string | number[]) {
  if (Array.isArray(selection)) {
    return JSON.stringify(selection)
  }

  return selection
}

export function createLearningRouter() {
  return createTRPCRouter({
    list: playerProcedure.query(async ({ ctx }) => {
      try {
        const elements = await GameService.getLearningElements({}, ctx as any)

        return (elements ?? [])
          .map((element: any) => toLearningElementListDto(element))
          .filter(
            (element): element is LearningElementListDto => element !== null
          )
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),

    byId: playerProcedure
      .input(byIdInput)
      .query(async ({ input, ctx }) => {
        try {
          const state = await PlayService.getLearningElement(
            { id: input.id },
            ctx as any
          )

          return toLearningElementStateDto(state as any)
        } catch (error) {
          throwAsTRPCError(error)
        }
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
          if (error instanceof SyntaxError) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid learning element selection payload',
            })
          }

          throwAsTRPCError(error)
        }
      }),

    questAchievements: playerProcedure.query(async ({ ctx }) => {
      try {
        const achievements = await ctx.prisma.achievement.findMany({
          where: {
            id: {
              notIn: ['LEARNING_ELEMENT_SOLVED'],
            },
          },
        })

        return achievements ?? []
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),
  })
}
