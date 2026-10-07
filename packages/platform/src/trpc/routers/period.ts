import { adminProcedure, assertGameOwnership, createTRPCRouter } from '../init.js'
import {
  gameIdSchema,
  jsonObjectSchema,
  requireFactsSchema,
} from '../schemas.js'
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
  return createTRPCRouter({
    add: adminProcedure
      .input(
        z.object({
          gameId: gameIdSchema,
          facts: jsonObjectSchema,
          segmentCount: z.number().int().positive(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        const period = await GameService.addGamePeriod(
          input as any,
          ctx as any,
          {
            schema: requireFactsSchema(
              schemas.PeriodFactsSchema,
              'PeriodFactsSchema'
            ),
            services: services as any,
          }
        )

        return toPeriodDto(period as any)
      }),
  })
}
