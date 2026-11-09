import { idSchema } from '../schemas.js'
import * as AccountService from '../../services/AccountService.js'
import { toPlayerSelfDto } from '../dto/player.js'
import { createTRPCRouter, publicProcedure, playerProcedure } from '../init.js'
import { z } from 'zod'
import { playerSelfDtoSchema } from '../dto/contracts.js'

export function createAuthRouter() {
  return createTRPCRouter({
    loginAsTeam: publicProcedure
      .input(
        z.object({
          token: idSchema,
        })
      )
      .output(playerSelfDtoSchema.nullable())
      .mutation(async ({ input, ctx }) => {
        const player = await AccountService.loginAsTeam(input, ctx as any)

        return toPlayerSelfDto(player as any)
      }),

    logoutAsTeam: playerProcedure.mutation(({ ctx }) =>
      AccountService.logoutAsTeam(ctx as any)
    ),
  })
}
