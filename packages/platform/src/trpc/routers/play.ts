import { z } from 'zod'
import { createTRPCRouter, playerProcedure } from '../init.js'
import { TRPCError } from '@trpc/server'
import { throwAsTRPCError } from '../errors.js'
import * as PlayService from '../../services/PlayService.js'
import * as GameService from '../../services/GameService.js'
import { toPlayerSelfDto } from '../dto/player.js'
import { toPlayerResultDto } from '../dto/results.js'
import * as DB from '@prisma/client'

const saveConsolidationDecisionInput = z.object({
  payload: z.string(),
})

function parsePayload(payload: string) {
  try {
    return JSON.parse(payload)
  } catch {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid JSON payload',
    })
  }
}

export function createPlayRouter() {
  return createTRPCRouter({
    self: playerProcedure.query(async ({ ctx }) => {
      try {
        const player = await PlayService.getPlayerData(
          { playerId: ctx.user.sub },
          ctx as any
        )

        return toPlayerSelfDto(player as any)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),

    result: playerProcedure.query(async ({ ctx }) => {
      try {
        const gameId = ctx.user.gameId
        if (typeof gameId !== 'number') {
          return null
        }

        const result = await PlayService.getPlayerResult(
          { gameId, playerId: ctx.user.sub },
          ctx as any
        )

        return toPlayerResultDto(result as any)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),

    updateReadyState: playerProcedure
      .input(z.object({ isReady: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const player = await PlayService.updateReadyState(
            { isReady: input.isReady },
            ctx as any
          )

          return toPlayerSelfDto(player as any)
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),

    performAction: playerProcedure
      .input(
        z.object({
          type: z.string().trim().min(1),
          payload: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const currentGame = await GameService.getGameFromContext(ctx as any)

          if (!currentGame?.activePeriod) return null

          const facts = parsePayload(input.payload)

          return PlayService.performActionWithRetry(
            {
              gameId: currentGame.id,
              actionType: input.type,
              playerId: ctx.user.sub,
              periodIx: currentGame.activePeriodIx,
              segmentIx: currentGame.activePeriod.activeSegmentIx,
              facts,
            } as any,
            ctx as any,
            {
              services: (ctx.services ?? {}) as any,
            } as any
          )
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),

    saveConsolidationDecision: playerProcedure
      .input(saveConsolidationDecisionInput)
      .mutation(async ({ input, ctx }) => {
        try {
          const facts = parsePayload(input.payload)

          return PlayService.saveDecisions(
            {
              decisionType: DB.PlayerDecisionType.CONSOLIDATION,
              facts,
            } as any,
            ctx as any
          )
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),
  })
}
