import {
  adminProcedure,
  assertGameOwnership,
  createTRPCRouter,
} from '../init.js'
import {
  gameIdSchema,
  jsonObjectSchema,
  requireFactsSchema,
} from '../schemas.js'
import { toAdminGameDto, toGameListItemDto } from '../dto/game.js'
import {
  adminGameDtoSchema,
  gameListItemDtoSchema,
  type GameListItemDto,
} from '../dto/contracts.js'
import * as GameService from '../../services/GameService.js'
import * as PlayService from '../../services/PlayService.js'
import { z } from 'zod'

type RouterDeps = {
  services?: Record<string, unknown>
  schemas?: {
    GameFactsSchema?: any
  }
  roleAssigner?: (ix: number, facts: unknown) => unknown
}

function firstResult<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export function createGameRouter({
  services = {},
  schemas = {},
  roleAssigner,
}: RouterDeps = {}) {
  const nextPeriodInput = z.object({ gameId: gameIdSchema })

  return createTRPCRouter({
    list: adminProcedure
      .output(z.array(gameListItemDtoSchema))
      .query(async ({ ctx }) => {
        const games = await GameService.getGames({}, ctx as any)

        return games
          .map((game: any) => toGameListItemDto(game))
          .filter((game): game is GameListItemDto => game !== null)
      }),

    byId: adminProcedure
      .input(z.object({ id: gameIdSchema }))
      .output(adminGameDtoSchema.nullable())
      .query(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.id)
        const game = await GameService.getGame(input, ctx as any)

        return toAdminGameDto(game as any)
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().trim().min(1),
          playerCount: z.number().int().positive(),
          facts: jsonObjectSchema,
        })
      )
      .output(adminGameDtoSchema.nullable())
      .mutation(async ({ input, ctx }) => {
        const game = await GameService.createGame(input as any, ctx as any, {
          schema: requireFactsSchema(
            schemas.GameFactsSchema,
            'GameFactsSchema'
          ),
          roleAssigner,
        })

        return toAdminGameDto(game as any)
      }),

    activateNextPeriod: adminProcedure
      .input(nextPeriodInput)
      .output(adminGameDtoSchema.nullable())
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        const game = await GameService.activateNextPeriod(
          input,
          ctx as any,
          {
            services,
          } as any
        )

        return toAdminGameDto(firstResult(game as any))
      }),

    activateNextSegment: adminProcedure
      .input(nextPeriodInput)
      .output(adminGameDtoSchema.nullable())
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        const game = await GameService.activateNextSegment(
          input,
          ctx as any,
          {
            services,
          } as any
        )

        return toAdminGameDto(firstResult(game as any))
      }),

    addCountdown: adminProcedure
      .input(
        z.object({
          gameId: gameIdSchema,
          seconds: z.number().int().nonnegative(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        return PlayService.addCountdown(input, ctx as any)
      }),

    toggleSwitch: adminProcedure
      .input(
        z.object({
          gameId: gameIdSchema,
          toggle: z.boolean(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        return PlayService.toggleSwitch(input, ctx as any)
      }),
  })
}
