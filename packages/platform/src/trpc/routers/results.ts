import { z } from 'zod'
import { createTRPCRouter, playerProcedure } from '../init.js'
import { gameIdSchema, playerResultTypeSchema } from '../schemas.js'
import * as PlayService from '../../services/PlayService.js'
import {
  toPastResultDto,
  toSpecificResultDto,
  toPlayerResultCoreDto,
} from '../dto/results.js'
import { throwAsTRPCError } from '../errors.js'

const specificInput = z.object({
  gameId: gameIdSchema,
  type: playerResultTypeSchema,
})

function present<T>(value: T | null): value is T {
  return value !== null
}

export function createResultsRouter() {
  return createTRPCRouter({
    listForCurrentGame: playerProcedure.query(async ({ ctx }) => {
      try {
        const results = await PlayService.getPlayerResults({}, ctx as any)

        return (results ?? [])
          .map((result: any) => toPlayerResultCoreDto(result))
          .filter(present)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),

    specific: playerProcedure.input(specificInput).query(async ({ input, ctx }) => {
      try {
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
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),

    pastForPlayer: playerProcedure.query(async ({ ctx }) => {
      try {
        const results = await PlayService.getPastResults({}, ctx as any)
        if (!results) return []

        return (results ?? [])
          .map((result: any) => toPastResultDto(result))
          .filter(present)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),
  })
}
