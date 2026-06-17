import { z } from 'zod'
import {
  createTRPCRouter,
  playerProcedure,
  protectedProcedure,
} from '../init.js'
import { idSchema } from '../schemas.js'
import * as GameService from '../../services/GameService.js'
import * as PlayService from '../../services/PlayService.js'
import { throwAsTRPCError } from '../errors.js'

export function createStoryRouter() {
  return createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await GameService.getStoryElements({}, ctx as any)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),

    markVisited: playerProcedure
      .input(z.object({ elementId: idSchema }))
      .mutation(async ({ input, ctx }) => {
        try {
          const player = await PlayService.markStoryElement(
            { elementId: input.elementId } as any,
            ctx as any
          )

          if (!player) return null

          // Return only the fields the client needs; the raw Player record
          // includes the login token and other internal columns.
          return {
            id: player.id,
            visitedStoryElementIds: player.visitedStoryElementIds,
          }
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),
  })
}
