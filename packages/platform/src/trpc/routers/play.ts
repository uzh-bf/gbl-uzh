import * as DB from '../../generated/prisma/client.js'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import * as EventService from '../../services/EventService.js'
import * as GameService from '../../services/GameService.js'
import * as PlayService from '../../services/PlayService.js'
import { toPlayerSelfDto } from '../dto/player.js'
import { toPlayerResultCoreDto, toPlayerResultDto } from '../dto/results.js'
import { createTRPCRouter, playerProcedure } from '../init.js'
import { requireFactsSchema } from '../schemas.js'

type RouterDeps = {
  services?: Record<string, unknown>
  schemas?: {
    PlayerFactsSchema?: any
    // Game-specific yup schema for the parsed performAction payload; when
    // provided, invalid player input fails as BAD_REQUEST before it reaches
    // the game's action reducer.
    ActionFactsSchema?: any
  }
}

const saveConsolidationDecisionInput = z.object({
  payload: z.string(),
})

const updatePlayerDataInput = z.object({
  name: z.string().optional().nullable(),
  facts: z.string().optional().nullable(),
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

function hasCompletedCompanySetup(
  player: { name?: unknown; facts?: unknown } | null | undefined
) {
  const hasName =
    typeof player?.name === 'string' && player.name.trim().length > 0
  if (!hasName) return false

  if (/^Team \d+$/i.test(player!.name as string)) return false

  const facts = player?.facts
  if (!facts || typeof facts !== 'object' || Array.isArray(facts)) return false

  const color = (facts as Record<string, unknown>).color
  return typeof color === 'string' && color.trim().length > 0
}

export function createPlayRouter({
  services = {},
  schemas = {},
}: RouterDeps = {}) {
  return createTRPCRouter({
    self: playerProcedure.query(async ({ ctx }) => {
      const player = await PlayService.getPlayerData(
        { playerId: ctx.user.sub },
        ctx as any
      )

      return toPlayerSelfDto(player as any)
    }),

    result: playerProcedure.query(async ({ ctx }) => {
      const gameId = ctx.user.gameId
      if (typeof gameId !== 'number') {
        return null
      }

      const result = await PlayService.getPlayerResult(
        { gameId, playerId: ctx.user.sub },
        ctx as any
      )

      return toPlayerResultDto(result as any)
    }),

    updateReadyState: playerProcedure
      .input(z.object({ isReady: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const player = await PlayService.updateReadyState(
          { isReady: input.isReady },
          ctx as any
        )

        return toPlayerSelfDto(player as any)
      }),

    updatePlayerData: playerProcedure
      .input(updatePlayerDataInput)
      .mutation(async ({ input, ctx }) => {
        const previousPlayer = await ctx.prisma.player.findUnique({
          where: {
            id: ctx.user.sub,
          },
          select: {
            name: true,
            facts: true,
          },
        })
        const hadSetupBefore = hasCompletedCompanySetup(previousPlayer)

        const facts = input.facts ? parsePayload(input.facts) : undefined
        // The service only validates when facts are present, so a name-only
        // update stays valid for a game that injects no PlayerFactsSchema.
        const playerFactsSchema = facts
          ? requireFactsSchema(schemas.PlayerFactsSchema, 'PlayerFactsSchema')
          : schemas.PlayerFactsSchema
        const player = await GameService.updatePlayerData(
          {
            name: input.name ?? undefined,
            facts,
          } as any,
          ctx as any,
          { schema: playerFactsSchema }
        )

        const hasSetupAfter = hasCompletedCompanySetup(player)
        if (!hadSetupBefore && hasSetupAfter && player) {
          await EventService.receiveEvents({
            events: [
              {
                type: 'COMPANY_SETUP_COMPLETED',
                facts: { hasName: 1, hasColor: 1 },
              },
            ],
            ctx: {
              user: ctx.user,
              args: {
                gameId: ctx.user.gameId,
                periodIx: player.game?.activePeriodIx ?? 0,
                playerId: ctx.user.sub,
              },
              achievements: player.achievementKeys,
              experience: player.experience,
              currentLevelIx: player.levelIx,
            },
            prisma: ctx.prisma,
          })
        }

        return toPlayerSelfDto(player as any)
      }),

    performAction: playerProcedure
      .input(
        z.object({
          type: z.string(),
          payload: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const currentGame = await GameService.getGameFromContext(ctx as any)

        if (!currentGame?.activePeriod) return null

        const facts = parsePayload(input.payload)
        if (schemas.ActionFactsSchema) {
          // yup ValidationError maps to BAD_REQUEST in the shared
          // service-error middleware (init.ts).
          await schemas.ActionFactsSchema.validate(facts)
        }

        const actionResult = await PlayService.performActionWithRetry(
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
            services: services as any,
          } as any
        )

        return toPlayerResultCoreDto(actionResult as any)
      }),

    saveConsolidationDecision: playerProcedure
      .input(saveConsolidationDecisionInput)
      .mutation(async ({ input, ctx }) => {
        const facts = parsePayload(input.payload)

        const decision = await PlayService.saveDecisions(
          {
            decisionType: DB.PlayerDecisionType.CONSOLIDATION,
            facts,
          } as any,
          ctx as any
        )

        if (!decision) return null

        return {
          id: decision.id,
          type: decision.type,
          facts: decision.facts,
        }
      }),
  })
}
