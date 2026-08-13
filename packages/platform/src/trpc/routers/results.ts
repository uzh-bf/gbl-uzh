import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  assertGameOwnership,
  createTRPCRouter,
  playerProcedure,
  protectedProcedure,
} from '../init.js'
import { UserRole } from '../../types.js'
import { gameIdSchema, playerResultTypeSchema } from '../schemas.js'
import * as PlayService from '../../services/PlayService.js'
import { toPastResultDto, toSpecificResultDto } from '../dto/results.js'
import {
  pastResultDtoSchema,
  specificResultDtoSchema,
} from '../dto/contracts.js'

const specificInput = z.object({
  gameId: gameIdSchema,
  type: playerResultTypeSchema,
})

function present<T>(value: T | null): value is T {
  return value !== null
}

export function createResultsRouter() {
  return createTRPCRouter({
    listForCurrentGame: playerProcedure
      .output(z.array(specificResultDtoSchema))
      .query(async ({ ctx }) => {
        const results = await PlayService.getPlayerResults({}, ctx as any)

        return (results ?? [])
          .map((result: any) => toSpecificResultDto(result))
          .filter(present)
      }),

    specific: protectedProcedure
      .input(specificInput)
      .output(z.array(specificResultDtoSchema))
      .query(async ({ input, ctx }) => {
        // Players may only read results for their own game; admins (reports)
        // may only read results for games they own.
        if (ctx.user.role === UserRole.ADMIN) {
          await assertGameOwnership(ctx, input.gameId)
        } else if (input.gameId !== ctx.user.gameId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' })
        }

        const results = await PlayService.getSpecificResults(
          {
            gameId: input.gameId,
            type: input.type,
          } as any,
          ctx as any
        )

        return (results ?? [])
          .map((result: any) => toSpecificResultDto(result))
          .filter(present)
      }),

    pastForPlayer: playerProcedure
      .output(z.array(pastResultDtoSchema))
      .query(async ({ ctx }) => {
        const results = await PlayService.getPastResults({}, ctx as any)
        if (!results) return []

        return results
          .map((result: any) => toPastResultDto(result))
          .filter(present)
      }),
  })
}
