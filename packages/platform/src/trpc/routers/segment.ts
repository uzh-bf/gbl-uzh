import { adminProcedure, assertGameOwnership, createTRPCRouter } from '../init.js'
import { gameIdSchema, idSchema, jsonObjectSchema } from '../schemas.js'
import * as GameService from '../../services/GameService.js'
import { toActiveSegmentDto } from '../dto/game.js'
import { z } from 'zod'

type RouterDeps = {
  services?: Record<string, unknown>
  schemas?: {
    PeriodSegmentFactsSchema?: any
  }
}

export function createSegmentRouter({
  services = {},
  schemas = {},
}: RouterDeps = {}) {
  const addInput = z.object({
    gameId: gameIdSchema,
    periodIx: z.number().int().nonnegative(),
    facts: jsonObjectSchema,
    learningElements: z.array(idSchema).optional(),
    storyElements: z.array(idSchema).optional(),
  })

  return createTRPCRouter({
    add: adminProcedure.input(addInput).mutation(async ({ input, ctx }) => {
      await assertGameOwnership(ctx, input.gameId)
      const segment = await GameService.addPeriodSegment(
        {
          gameId: input.gameId,
          periodIx: input.periodIx,
          facts: input.facts,
          learningElements: input.learningElements,
          storyElements: input.storyElements,
        } as Parameters<typeof GameService.addPeriodSegment>[0],
        ctx as any,
        {
          schema: schemas.PeriodSegmentFactsSchema,
          services: services as any,
        } as any
      )

      return toActiveSegmentDto(segment as any)
    }),
  })
}
