import { adminProcedure, assertGameOwnership, createTRPCRouter } from '../init.js'
import { gameIdSchema, jsonObjectSchema } from '../schemas.js'
import {
  toAdminGameDto,
  toGameListItemDto,
  type GameListItemDto,
} from '../dto/game.js'
import * as GameService from '../../services/GameService.js'
import * as PlayService from '../../services/PlayService.js'
import { throwAsTRPCError } from '../errors.js'
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
  const createGameInput = z.object({
    name: z.string().trim().min(1),
    playerCount: z.number().int().positive(),
    facts: jsonObjectSchema,
  })

  const byIdInput = z.object({ id: gameIdSchema })
  const countdownInput = z.object({
    gameId: gameIdSchema,
    seconds: z.number().int().nonnegative(),
  })
  const switchInput = z.object({
    gameId: gameIdSchema,
    toggle: z.boolean(),
  })
  const nextPeriodInput = z.object({ gameId: gameIdSchema })

  return createTRPCRouter({
    list: adminProcedure.query(async ({ ctx }) => {
      try {
        const games = await GameService.getGames({}, ctx as any)

        return games
          .map((game: any) => toGameListItemDto(game))
          .filter((game): game is GameListItemDto => game !== null)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),

    byId: adminProcedure
      .input(byIdInput)
      .query(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.id)
        try {
          const game = await GameService.getGame(input, ctx as any)

          return toAdminGameDto(game as any)
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),

    create: adminProcedure
      .input(createGameInput)
      .mutation(async ({ input, ctx }) => {
        try {
          const game = await GameService.createGame(
            input as any,
            ctx as any,
            {
              schema: schemas.GameFactsSchema,
              roleAssigner,
            }
          )

          return toAdminGameDto(game as any)
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),

    activateNextPeriod: adminProcedure
      .input(nextPeriodInput)
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        try {
          const game = await GameService.activateNextPeriod(input, ctx as any, {
            services,
          } as any)

          return toAdminGameDto(firstResult(game as any))
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),

    activateNextSegment: adminProcedure
      .input(nextPeriodInput)
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        try {
          const game = await GameService.activateNextSegment(input, ctx as any, {
            services,
          } as any)

          return toAdminGameDto(firstResult(game as any))
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),

    addCountdown: adminProcedure
      .input(countdownInput)
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        try {
          return await PlayService.addCountdown(input, ctx as any)
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),

    toggleSwitch: adminProcedure
      .input(switchInput)
      .mutation(async ({ input, ctx }) => {
        await assertGameOwnership(ctx, input.gameId)
        try {
          return await PlayService.toggleSwitch(input, ctx as any)
        } catch (error) {
          throwAsTRPCError(error)
        }
      }),
  })
}
