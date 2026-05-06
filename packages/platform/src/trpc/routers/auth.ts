import { idSchema } from '../schemas.js'
import * as AccountService from '../../services/AccountService.js'
import { toPlayerSelfDto } from '../dto/player.js'
import { createTRPCRouter, publicProcedure, playerProcedure } from '../init.js'
import { throwAsTRPCError } from '../errors.js'
import { z } from 'zod'

const loginAsTeamInput = z.object({
  token: idSchema,
})

export function createAuthRouter() {
  return createTRPCRouter({
    loginAsTeam: publicProcedure
      .input(loginAsTeamInput)
      .mutation(async ({ input, ctx }) => {
        try {
          const player = await AccountService.loginAsTeam(input, ctx as any)

          return toPlayerSelfDto(player as any)
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),

    logoutAsTeam: playerProcedure.mutation(async ({ ctx }) => {
      try {
        return AccountService.logoutAsTeam(ctx as any)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),
  })
}
