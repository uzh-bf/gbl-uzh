import { z } from 'zod'
import { createTRPCRouter, playerProcedure } from '../init.js'
import { idSchema } from '../schemas.js'
import * as GameService from '../../services/GameService.js'
import * as PlayService from '../../services/PlayService.js'
import { throwAsTRPCError } from '../errors.js'

export function createStoryRouter() {
  return createTRPCRouter({
    list: playerProcedure.query(async ({ ctx }) => {
      try {
        return GameService.getStoryElements({}, ctx as any)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),

    markVisited: playerProcedure
      .input(z.object({ elementId: idSchema }))
      .mutation(async ({ input, ctx }) => {
        try {
          return PlayService.markStoryElement(
            { elementId: input.elementId } as any,
            ctx as any
          )
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),
  })
}
