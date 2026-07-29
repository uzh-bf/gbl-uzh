import { adminProcedure, assertGameOwnership, createTRPCRouter } from '../init.js'
import { gameIdSchema, jsonObjectSchema } from '../schemas.js'
import * as GameService from '../../services/GameService.js'
import { toPeriodDto } from '../dto/game.js'
import { z } from 'zod'

type RouterDeps = {
  services?: Record<string, unknown>
  schemas?: {
    PeriodFactsSchema?: any
  }
}

export function createPeriodRouter({
  services = {},
  schemas = {},
}: RouterDeps = {}) {
  const addInput = z.object({
    gameId: gameIdSchema,
    facts: jsonObjectSchema,
    segmentCount: z.number().int().positive(),
  })

  return createTRPCRouter({
    add: adminProcedure.input(addInput).mutation(async ({ input, ctx }) => {
      await assertGameOwnership(ctx, input.gameId)
      const period = await GameService.addGamePeriod(input as any, ctx as any, {
        schema: schemas.PeriodFactsSchema,
        services: services as any,
      })

      return toPeriodDto(period as any)
    }),
  })
}
