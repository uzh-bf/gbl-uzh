import * as DB from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { none, repeat } from 'ramda'
import * as yup from 'yup'
import log from '../lib/logger.js'
import {
  CtxWithFacts,
  CtxWithFactsAndSchema,
  CtxWithPrisma,
  UpdatePlayerDataArgs,
  BaseGlobalNotificationType,
  Event as PlatformEvent,
} from '../types.js'
import * as EventService from './EventService.js'
import * as GameTransitions from './GameTransitions.js'

type Context = CtxWithPrisma<PrismaClient>

/**
 * Ask the lifecycle machine (GameTransitions) for the status that `event` leads
 * to from the game's current status. Returns null — and logs — when there is no
 * valid transition, in which case the calling admin action is a no-op. The
 * switch in each transition then only selects side-effects for the (already
 * validated) transition and writes the returned `targetStatus`.
 */
function resolveTargetStatus(
  game: {
    status: DB.GameStatus
    activePeriodIx: number
    periods?: unknown[] | null
    activePeriod?: any
  },
  event: GameTransitions.GameEvent,
  gameId: number,
  fnName: string
): DB.GameStatus | null {
  const targetStatus = GameTransitions.nextStatus(
    game.status,
    event,
    GameTransitions.buildTransitionContext(game)
  )
  if (!targetStatus) {
    log.warn(`${fnName}: no valid ${event} from status ${game.status}`, {
      gameId,
    })
  }
  return targetStatus
}

/**
 * Safety net (opt-in via XSTATE_SHADOW): the machine authorized `target`; warn
 * when the committed row did not actually reach it. No-op when the flag is off
 * or the status matches.
 */
function assertMachineTarget(
  fnName: string,
  meta: {
    gameId: number
    fromStatus: DB.GameStatus
    event: GameTransitions.GameEvent
    target: DB.GameStatus
    actual: DB.GameStatus | null | undefined
  }
) {
  if (
    process.env.XSTATE_SHADOW === 'true' &&
    meta.actual != null &&
    meta.actual !== meta.target
  ) {
    log.warn(`[xstate] ${fnName}: committed status != machine target`, meta)
  }
}

/**
 * Publish a realtime game notification built from the post-transition realtime
 * state. Shared by the admin lifecycle transitions.
 */
function publishGameRealtimeEvent(
  gameId: number,
  gameState: Parameters<typeof EventService.buildGameRealtimeFacts>[1],
  type: BaseGlobalNotificationType
) {
  const eventToPublish: PlatformEvent<BaseGlobalNotificationType> = {
    type,
    facts: EventService.buildGameRealtimeFacts(gameId, gameState),
  }
  EventService.publishGlobalNotification(eventToPublish)
  log.info(
    `Published ${eventToPublish.type} for game ${gameId}`,
    eventToPublish.facts
  )
}

/**
 * Injectable post-commit realtime publish. The lifecycle transitions accept an
 * optional publisher in their options bag; production passes nothing and gets
 * `defaultGamePublisher` (which re-reads the realtime game state and publishes
 * it). Tests pass a no-op / spy, keeping that second Prisma read and the pubsub
 * singleton out of the unit path. See CONTEXT.md.
 */
export type GamePublisher = (
  gameId: number,
  type: BaseGlobalNotificationType
) => void | Promise<void>

function defaultGamePublisher(
  ctx: Context,
  requireActivePeriod = false
): GamePublisher {
  return async (gameId, type) => {
    const gameAfterUpdate = await EventService.getGameRealtimeState(
      ctx.prisma,
      gameId
    )
    if (gameAfterUpdate && (!requireActivePeriod || gameAfterUpdate.activePeriod)) {
      publishGameRealtimeEvent(gameId, gameAfterUpdate, type)
    }
  }
}

interface CreateGameArgs<T> {
  name: string
  playerCount: number
  facts: T
}

export async function createGame<TFacts>(
  { name, playerCount, facts }: CreateGameArgs<TFacts>,
  ctx: Context,
  {
    schema,
    roleAssigner,
  }: { schema: yup.Schema<TFacts>; roleAssigner?: (ix: number, facts: any) => any }
) {
  const validatedFacts = schema.validateSync(facts) as any

  return ctx.prisma.game.create({
    data: {
      name,
      facts: validatedFacts,
      owner: {
        connect: {
          id: ctx.user.sub,
        },
      },
      players: {
        create: repeat(0, playerCount).map((_, ix) => {
          return {
            facts: {},
            token: nanoid(),
            role: roleAssigner ? roleAssigner(ix, validatedFacts) : undefined,
            number: playerCount - ix,
            name: `Team ${playerCount - ix}`,
            level: {
              connect: {
                index: 0,
              },
            },
          }
        }),
      },
    },
    include: {
      players: true,
      periods: true,
    },
  })
}

interface AddGamePeriodArgs<T> {
  gameId: number
  facts: T
  segmentCount: number
}

export async function addGamePeriod<TFacts>(
  { gameId, facts, segmentCount }: AddGamePeriodArgs<TFacts>,
  ctx: Context,
  { schema, services }: CtxWithFactsAndSchema<TFacts, PrismaClient>
) {
  const validatedFacts = schema.validateSync(facts)

  const game = await ctx.prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      periods: {
        orderBy: {
          index: 'desc',
        },
        take: 1,
        include: {
          segments: {
            orderBy: {
              index: 'desc',
            },
            take: 1,
          },
        },
      },
    },
  })

  if (!game) return null

  const index = (game.periods[0]?.index ?? -1) + 1

  // TODO(JJ): Why do we provide validatedFacts twice?
  // - remove periodFacts from payload for initialize?
  const { resultFacts: initializedFacts, specificFacts } =
    services.Period.initialize(validatedFacts, {
      gameFacts: game.facts,
      // TODO(JJ): replace with undefined
      // At RS: If we replace validatedFacts with periodFacts the
      // Derivative Game will be broken, as it computes the trend from
      // periodFacts instead of the first arguement
      periodFacts: validatedFacts,
      previousPeriodFacts: game.periods[0]?.facts as any,
      previousSegmentFacts: game.periods[0]?.segments[0]?.facts as any,
      periodIx: index,
      segmentCount,
    })

  console.log(
    game.periods[0]?.facts,
    game.periods[0]?.segments[0]?.facts,
    initializedFacts
  )

  const res = await ctx.prisma.$transaction(async (tx) => {
    if (specificFacts && services.Period.updateDBAfterInitialize) {
      await services.Period.updateDBAfterInitialize(tx, specificFacts, {
        gameId,
      })
    }
    const updatedPeriod = await tx.period.upsert({
      where: {
        gameId_index: {
          gameId,
          index,
        },
      },
      create: {
        index,
        facts: initializedFacts,
        game: {
          connect: {
            id: gameId,
          },
        },
        segmentCount,
        previousPeriod: {
          connect:
            index > 0
              ? {
                  gameId_index: {
                    gameId,
                    index: index - 1,
                  },
                }
              : [],
        },
      },
      update: {
        facts: initializedFacts,
      },
      include: {
        segments: {
          include: {
            learningElements: true,
            storyElements: true,
          },
        },
      },
    })

    return updatedPeriod

    // NOTE(JJ): We don't a serialization isolation level here, as only one admin adds
    // a period at a time
  })

  return res
}

interface AddPeriodSegmentArgs<TFacts> {
  gameId: number
  periodIx: number
  facts: TFacts
  learningElements?: string[]
  storyElements?: string[]
}

export async function addPeriodSegment<TFacts>(
  {
    gameId,
    periodIx,
    facts,
    learningElements,
    storyElements,
  }: AddPeriodSegmentArgs<TFacts>,
  ctx: Context,
  { schema, services }: CtxWithFactsAndSchema<TFacts, PrismaClient>
) {
  const validatedFacts = schema.validateSync(facts)

  const game = await ctx.prisma.game.findUnique({ where: { id: gameId } })

  if (!game) return null

  const period = await ctx.prisma.period.findUnique({
    where: {
      gameId_index: {
        gameId,
        index: periodIx,
      },
    },
    include: {
      segments: {
        orderBy: {
          index: 'desc',
        },
      },
    },
  })

  if (!period || period.segments.length >= period.segmentCount) return null

  const segmentLast = period.segments[0]
  const index = (segmentLast?.index ?? -1) + 1
  let previousSegmentFacts = segmentLast?.facts
  if (index === 0 && periodIx > 0) {
    const previousPeriod = await ctx.prisma.period.findUnique({
      where: { gameId_index: { gameId, index: periodIx - 1 } },
      include: { segments: { orderBy: { index: 'desc' }, take: 1 } },
    })
    previousSegmentFacts = previousPeriod?.segments[0]?.facts
  }

  const { resultFacts: initializedFacts, specificFacts } =
    services.Segment.initialize(validatedFacts, {
      gameFacts: game.facts,
      periodFacts: period.facts,
      previousSegmentFacts,
      segmentIx: index,
      segmentCount: period.segmentCount,
      periodIx,
    })

  const res = await ctx.prisma.$transaction(async (tx) => {
    if (specificFacts && services.Segment.updateDBAfterInitialize) {
      await services.Segment.updateDBAfterInitialize(tx, specificFacts, {
        gameId,
      })
    }

    // create or update the facts and settings of a period segment
    const updatedSegment = tx.periodSegment.upsert({
      where: {
        gameId_periodIx_index: {
          gameId,
          periodIx,
          index,
        },
      },
      create: {
        index,
        facts: initializedFacts,
        learningElements: {
          connect: learningElements
            ? learningElements.map((item) => ({ id: item }))
            : [],
        },
        storyElements: {
          connect: storyElements
            ? storyElements.map((item) => ({ id: item }))
            : [],
        },
        game: {
          connect: {
            id: gameId,
          },
        },
        periodIx: periodIx,
        period: {
          connect: {
            gameId_index: {
              gameId,
              index: periodIx,
            },
          },
        },
        previousSegment: {
          connect:
            index > 0
              ? {
                  gameId_periodIx_index: {
                    gameId,
                    periodIx,
                    index: index - 1,
                  },
                }
              : [],
        },
      },
      update: {
        facts: initializedFacts,
        learningElements: {
          connect: learningElements
            ? learningElements.map((item) => ({ id: item }))
            : [],
        },
        storyElements: {
          connect: storyElements
            ? storyElements.map((item) => ({ id: item }))
            : [],
        },
      },
      include: {
        learningElements: true,
        storyElements: true,
      },
    })

    return updatedSegment
  })

  return res
}

interface ActivateNextPeriodArgs {
  gameId: number
}

export async function activateNextPeriod(
  { gameId }: ActivateNextPeriodArgs,
  ctx: Context,
  { services, publish }: CtxWithFacts<any, PrismaClient> & {
    publish?: GamePublisher
  }
) {
  log.info('activating next period for gameId:', gameId)

  // get the current game and as well as the results of the initially active period
  // these will be used by the model to compute the starting situation of the next period
  const game = await ctx.prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      players: true,
      periods: true,
      results: {
        where: {
          type: 'SEGMENT_END',
        },
        orderBy: [{ period: { index: 'asc' } }, { segment: { index: 'asc' } }],
      },
      activePeriod: {
        include: {
          results: {
            include: {
              player: true,
            },
          },
          nextPeriod: true,
          previousPeriod: {
            include: {
              results: {
                include: {
                  player: true,
                },
              },
            },
          },
          activeSegment: {
            include: {
              results: {
                include: {
                  player: true,
                },
              },
            },
          },
          decisions: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  })

  if (!game) return null
  log.info(`game found, status ${game.status}`)

  const currentPeriodIx = game.activePeriodIx
  const currentSegmentIx = game.activePeriod?.activeSegmentIx
  const nextPeriodIx = currentPeriodIx + 1

  // Drive the transition from the lifecycle machine (see resolveTargetStatus):
  // a null target means no valid transition from here, so this is a no-op. The
  // switch below only selects side-effects for the validated transition.
  const event = 'ACTIVATE_NEXT_PERIOD' as const
  const targetStatus = resolveTargetStatus(
    game,
    event,
    gameId,
    'activateNextPeriod'
  )
  if (!targetStatus) return null

  // NotificationService.publishGlobalNotification({
  //   type: GlobalNotificationType.PERIOD_ACTIVATED,
  // })

  let finalTransactionResult
  let didUpdate = false
  switch (game.status) {
    // SCHEDULED -> PREPARATION
    // if the game is scheduled, initialize period results and move to PREPARATION

    // TODO(JJ):
    // - The game facts should now be updated by the results
    // - They should be updated by the game status, e.g. when going to the next
    //   period or segment
    // - Done: the game facts are updated on user interaction in PlayService
    case DB.GameStatus.SCHEDULED: {
      const { results, actions } = computePeriodStartResults(
        {
          results: undefined,
          players: game.players,
          activePeriodIx: currentPeriodIx,
          game,
          periodFacts: game.periods?.[0]?.facts,
        },
        { services }
      )
      const extras = actions.map((a) => toPlayerActionCreate(ctx, gameId, a))

      // update the status and active period of the current game
      // and prepare PERIOD_START results
      const gameData: any = {
        status: targetStatus,
        activePeriodIx: nextPeriodIx,
        activePeriod: {
          connect: { gameId_index: { gameId, index: nextPeriodIx } },
        },
      }
      // TODO(JJ): Somewhere here we need to have a gameFactsUpdateService
      // if (Object.keys(gameFactsToUpdate).length > 0) {
      //   gameData.facts = gameFactsToUpdate
      // }

      finalTransactionResult = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          where: {
            id: gameId,
            // optimistic concurrency: only transition if status is unchanged
            status: game.status,
          },
          include: {
            periods: {
              include: {
                segments: true,
              },
            },
          },
          data: {
            ...gameData,
            version: {
              increment: 1,
            },
          },
        }),

        ctx.prisma.period.update({
          where: {
            gameId_index: {
              gameId,
              index: nextPeriodIx,
            },
          },
          data: {
            results: {
              create: results,
            },
          },
        }),

        ...extras,
      ])
      didUpdate = true

      break
    }

    // RUNNING -> CONSOLIDATION
    // if the final segment is running, go on with consolidation of the period
    // compute the results of the last segment and update the game status
    case DB.GameStatus.RUNNING: {
      // Guard on the *presence* of an active segment, not its truthiness:
      // `!currentSegmentIx` was also true at segment index 0, which wrongly
      // blocked consolidating a period whose only/first segment is active.
      if (!game.activePeriod?.activeSegment || currentSegmentIx == null)
        return null

      finalTransactionResult = await ctx.prisma.$transaction(
        async (tx) => {
          if (services.Segment.updateDBBeforeActivation) {
            await services.Segment.updateDBBeforeActivation(tx, {
              gameId,
              periodIx: currentPeriodIx,
              segmentIx: currentSegmentIx,
            })
          }
          // NOTE(JJ): The results may have changed
          const gameLocal = await tx.game.findUnique({
            where: { id: gameId },
            include: {
              activePeriod: {
                include: {
                  activeSegment: {
                    include: { results: { include: { player: true } } },
                  },
                },
              },
            },
          })

          const { results, actions } = computeSegmentEndResults(gameLocal, {
            services,
          })
          const extras = actions.map((a) =>
            toPlayerActionCreate(ctx, gameId, a)
          )

          // TODO(JJ): Check if we need to update the game facts as well
          // update period facts when starting consolidation
          const { resultFacts: consolidatedFacts } =
            services.Period.consolidate(gameLocal?.activePeriod?.facts, {
              gameFacts: gameLocal?.facts,
              previousSegmentFacts: gameLocal?.activePeriod?.activeSegment
                ?.facts as any,
              periodIx: currentPeriodIx,
              segmentCount: gameLocal?.activePeriod?.segmentCount,
            })

          const updatedGame = await tx.game.update({
            data: {
              status: targetStatus,
              version: {
                increment: 1,
              },
            },
            include: {
              periods: {
                include: {
                  segments: true,
                },
              },
            },
            where: {
              id: gameId,
              // optimistic concurrency: only transition if status is unchanged
              status: game.status,
            },
          })

          await tx.period.update({
            where: {
              gameId_index: {
                gameId,
                index: currentPeriodIx,
              },
            },
            data: {
              facts: consolidatedFacts,
            },
          })

          await tx.periodSegment.update({
            where: {
              gameId_periodIx_index: {
                gameId,
                periodIx: currentPeriodIx,
                index: currentSegmentIx,
              },
            },
            data: {
              results: {
                // compute SEGMENT_END results using model
                update: results,
              },
            },
            include: {
              results: {
                include: {
                  player: true,
                },
              },
            },
          })

          // reset player readiness
          await tx.player.updateMany({
            where: { game: { id: gameId } },
            data: { isReady: false },
          })

          for (const extra of extras) {
            await extra
          }

          return updatedGame
        },
        { timeout: 120000 }
      )
      didUpdate = true

      break
    }

    // CONSOLIDATION -> RESULTS
    // compute period end results and move to the results phase
    case DB.GameStatus.CONSOLIDATION: {
      if (!game.activePeriod?.activeSegment) return null

      const { results, actions, events } = computePeriodEndResults(
        {
          segmentEndResults: game.results,
          players: game.players,
          activeSegmentResults: game.activePeriod.activeSegment.results,
          segmentFacts: game.activePeriod.activeSegment.facts,
          periodFacts: game.activePeriod.facts,
          periodDecisions: game.activePeriod.decisions,
          activePeriodIx: currentPeriodIx,
          activeSegmentIx: currentSegmentIx,
          game,
        },
        { services }
      )
      const extras = actions.map((a) => toPlayerActionCreate(ctx, gameId, a))
      const promises = events.map((e) => toReceiveEventsThunk(ctx, e))

      let periodIx = nextPeriodIx

      // Advance the active-period index even for the final period (so
      // `activePeriodIx === totalPeriods` becomes the "no more periods" marker
      // that gates FINISH_GAME -> COMPLETED), but only `connect` the next period
      // when it actually exists. Connecting period `totalPeriods` (which does not
      // exist) was the long-standing last-period crash.
      const hasNextPeriod = periodIx < game.periods.length
      const gameData: any = {
        status: targetStatus,
        activePeriodIx: periodIx,
        ...(hasNextPeriod
          ? {
              activePeriod: {
                connect: { gameId_index: { gameId, index: periodIx } },
              },
            }
          : {}),
      }
      finalTransactionResult = await ctx.prisma.$transaction(
        async (tx) => {
          // TODO(JJ):
          // - Here we have all the latest results of all players
          // - add all players and all results
          const resultsPerPlayer = results.map((r) => ({
            facts: r.facts,
            playerId: r.player.connect.id,
          }))
          const resultsFactsPerPlayer =
            typeof services.PeriodResult.updateDBAfterEnd !== 'undefined'
              ? await services.PeriodResult.updateDBAfterEnd(
                  tx,
                  { results: resultsPerPlayer },
                  { gameId }
                )
              : resultsPerPlayer
          // TODO(JJ): We need to change the facts here
          results.forEach((r) => {
            const updatedResultFacts = resultsFactsPerPlayer.find(
              (f) => f.playerId === r.player.connect.id
            )?.facts
            if (updatedResultFacts) {
              r.facts = updatedResultFacts
            }
          })

          // update the status and active period of the current game
          const updatedGame = await tx.game.update({
            where: {
              id: gameId,
              // optimistic concurrency: only transition if status is unchanged
              status: game.status,
            },
            include: { periods: { include: { segments: true } } },
            data: {
              ...gameData,
              version: {
                increment: 1,
              },
            },
          })

          // create PERIOD_END results based on the previous SEGMENT_END results
          await tx.period.update({
            where: { gameId_index: { gameId, index: currentPeriodIx } },
            data: { results: { create: results } },
            include: { results: true },
          })

          // reset player readiness
          await tx.player.updateMany({
            where: { game: { id: gameId } },
            data: { isReady: false },
          })

          for (const extra of extras) {
            await extra
          }

          return updatedGame
        },
        { timeout: 120000 }
      )

      // run achievement/experience side-effects only after the game-state
      // transaction has committed (deferred thunks; they previously fired
      // eagerly during result computation, regardless of transaction outcome).
      // The period transition is already durably committed at this point, so a
      // failing side-effect must not fail the whole call (that would mislead the
      // admin into thinking the transition was rejected). Attempt every thunk
      // and surface failures via the log instead of abandoning the rest.
      const sideEffects = await Promise.allSettled(promises.map((p) => p()))
      const failedSideEffects = sideEffects.filter(
        (r) => r.status === 'rejected'
      )
      if (failedSideEffects.length > 0) {
        log.error(
          `period-end side-effects failed for ${failedSideEffects.length}/${promises.length} player(s) in game ${gameId} (period ${currentPeriodIx}); game state already committed to RESULTS`,
          failedSideEffects.map((r) => (r as PromiseRejectedResult).reason)
        )
      }

      didUpdate = true

      break
    }

    // RESULTS -> PREPARATION
    // if the game is in the results phase (between periods)
    // initialize the next period and move to PREPARATION
    case DB.GameStatus.RESULTS: {
      // if there is no next period, return
      if (!game.activePeriod) {
        log.warn('no next period available')
        return null
      }

      // if (game.activePeriodIx >= game.periods.length) {
      //   const result = await ctx.prisma.$transaction([
      //     ctx.prisma.game.update({
      //       where: {
      //         id: gameId,
      //       },
      //       include: {
      //         periods: {
      //           include: {
      //             segments: true,
      //           },
      //         },
      //       },
      //       data: {
      //         // TODO(JJ): Double-check there is not else to update?
      //         status: DB.GameStatus.COMPLETED,
      //       },
      //     }),
      //   ])

      //   return result
      // }

      const { results, actions } = computePeriodStartResults(
        {
          results: game.activePeriod.previousPeriod[0]?.results,
          players: game.players,
          activePeriodIx: currentPeriodIx,
          game,
          periodFacts: game.activePeriod.facts,
        },
        { services }
      )
      const extras = actions.map((a) => toPlayerActionCreate(ctx, gameId, a))

      finalTransactionResult = await ctx.prisma.$transaction([
        // update the status and active period of the current game
        ctx.prisma.game.update({
          where: {
            id: gameId,
            // optimistic concurrency: only transition if status is unchanged
            status: game.status,
          },
          include: {
            periods: {
              include: {
                segments: true,
              },
            },
          },
          data: {
            status: targetStatus,
            version: {
              increment: 1,
            },
          },
        }),

        // create PERIOD_START results based on the previous PERIOD_END results
        ctx.prisma.period.update({
          where: {
            gameId_index: {
              gameId,
              index: currentPeriodIx,
            },
          },
          data: {
            results: {
              create: results,
            },
          },
        }),

        // reset player readiness
        ctx.prisma.player.updateMany({
          where: { game: { id: gameId } },
          data: { isReady: false },
        }),

        ...extras,
      ])
      didUpdate = true

      break
    }

    default:
      // PREPARATION, PAUSED, COMPLETED, etc.
      log.warn(
        `activateNextPeriod called with unhandled game status: ${game.status} for gameId: ${gameId}`
      )
      return null
  }

  if (didUpdate) {
    // the committed game row: array-form $transaction([game.update, ...]) arms
    // (SCHEDULED, RESULTS) return an array whose [0] is the game.update result;
    // callback-form arms (RUNNING, CONSOLIDATION) return the game directly
    const committedGame = Array.isArray(finalTransactionResult)
      ? finalTransactionResult[0]
      : finalTransactionResult
    assertMachineTarget('activateNextPeriod', {
      gameId,
      fromStatus: game.status,
      event,
      target: targetStatus,
      actual: (committedGame as any)?.status,
    })

    await (publish ?? defaultGamePublisher(ctx))(
      gameId,
      BaseGlobalNotificationType.PERIOD_ACTIVATED
    )
  }
  return finalTransactionResult
}

interface ActivateSegmentArgs {
  gameId: number
}

export async function activateNextSegment(
  { gameId }: ActivateSegmentArgs,
  ctx: Context,
  { services, publish }: CtxWithFacts<any, PrismaClient> & {
    publish?: GamePublisher
  }
) {
  const game = await ctx.prisma.game.findUnique({
    where: { id: gameId },
    include: {
      activePeriod: {
        include: {
          segments: {
            orderBy: { index: 'asc' },
            include: { nextSegment: true },
          },
          results: { include: { player: true } },
          activeSegment: {
            include: {
              nextSegment: true,
              results: { include: { player: true } },
            },
          },
        },
      },
    },
  })

  if (!game?.activePeriod) return null

  if (game.activePeriod.segments.length === 0) {
    throw new Error(
      'Cannot activate segment: no segments have been prepared for the active period. Add at least one segment first.'
    )
  }

  const currentPeriodIx = game.activePeriodIx
  const currentSegmentIx = game.activePeriod.activeSegmentIx
  const nextSegmentIx = currentSegmentIx + 1

  // Drive the transition from the lifecycle machine (see resolveTargetStatus):
  // null -> no valid transition -> no-op; the switch below only runs the
  // side-effects for the validated transition.
  const event = 'ACTIVATE_NEXT_SEGMENT' as const
  const targetStatus = resolveTargetStatus(
    game,
    event,
    gameId,
    'activateNextSegment'
  )
  if (!targetStatus) return null

  // NotificationService.publishGlobalNotification({
  //   type: GlobalNotificationType.SEGMENT_ACTIVATED,
  // })

  let finalTransactionResult
  let didUpdate = false
  switch (game.status) {
    // PREPARATION -> RUNNING
    // PAUSED -> RUNNING
    case DB.GameStatus.PREPARATION:
    case DB.GameStatus.PAUSED: {
      const { results, actions } = computeSegmentStartResults(game, {
        services,
      })
      const extras = actions.map((a) => toPlayerActionCreate(ctx, gameId, a))

      finalTransactionResult = await ctx.prisma.$transaction(
        async (tx) => {
          // const isVeryFirst = currentPeriodIx === 0 && currentSegmentIx === -1
          // if (!isVeryFirst) {

          // }

          const updatedGame = await tx.game.update({
            where: {
              id: gameId,
              // optimistic concurrency: only transition if status is unchanged
              status: game.status,
            },
            include: {
              periods: {
                include: {
                  segments: true,
                },
              },
              players: true,
            },
            data: {
              status: targetStatus,
              version: {
                increment: 1,
              },
              // TODO(JJ): We need this to be updated
              // activeSegmentIx: nextSegmentIx,
            },
          })

          // update the active segment of the current period
          await tx.period.update({
            where: {
              gameId_index: {
                gameId,
                index: currentPeriodIx,
              },
            },
            data: {
              activeSegmentIx: nextSegmentIx,
              activeSegment: {
                connect: {
                  gameId_periodIx_index: {
                    gameId,
                    periodIx: currentPeriodIx,
                    index: nextSegmentIx,
                  },
                },
              },
            },
          })

          // SEGMENT INITIALIZATION
          await tx.periodSegment.update({
            where: {
              gameId_periodIx_index: {
                gameId,
                periodIx: currentPeriodIx,
                index: nextSegmentIx,
              },
            },
            data: {
              results: {
                create: results,
              },
            },
          })

          // reset player readiness
          await tx.player.updateMany({
            where: { game: { id: gameId } },
            data: { isReady: false },
          })

          for (const extra of extras) {
            await extra
          }

          return updatedGame
        },
        { timeout: 120000 }
      )
      didUpdate = true

      break
    }

    // RUNNING -> PAUSED
    // compute the segment results of the current segment and set to paused
    case DB.GameStatus.RUNNING: {
      // return if there is no next segment available
      if (!game.activePeriod?.activeSegment?.nextSegment) {
        return null
      }

      finalTransactionResult = await ctx.prisma.$transaction(
        async (tx) => {
          if (services.Segment.updateDBBeforeActivation) {
            await services.Segment.updateDBBeforeActivation(tx, {
              gameId,
              periodIx: currentPeriodIx,
              segmentIx: currentSegmentIx,
            })
          }

          // NOTE(JJ): The results may have changed
          const gameLocal = await tx.game.findUnique({
            where: { id: gameId },
            include: {
              activePeriod: {
                include: {
                  activeSegment: {
                    include: { results: { include: { player: true } } },
                  },
                },
              },
            },
          })

          const { results, actions } = computeSegmentEndResults(gameLocal, {
            services,
          })
          const extras = actions.map((a) =>
            toPlayerActionCreate(ctx, gameId, a)
          )

          const updatedGame = await tx.game.update({
            where: {
              id: gameId,
              // optimistic concurrency: only transition if status is unchanged
              status: game.status,
            },
            include: {
              periods: {
                include: {
                  segments: true,
                },
              },
              players: true,
            },
            data: {
              status: targetStatus,
              version: {
                increment: 1,
              },
            },
          })
          await tx.periodSegment.update({
            where: {
              gameId_periodIx_index: {
                gameId,
                periodIx: currentPeriodIx,
                index: currentSegmentIx,
              },
            },
            data: {
              results: {
                update: results,
              },
            },
            include: {
              results: true,
            },
          })
          // reset player readiness
          await tx.player.updateMany({
            where: {
              game: {
                id: gameId,
              },
            },
            data: {
              isReady: false,
            },
          })

          for (const extra of extras) {
            await extra
          }

          return updatedGame
        },
        { timeout: 120000 }
      )
      didUpdate = true

      break
    }

    default:
      log.warn(
        `activateNextSegment called with unhandled game status: ${game.status} for gameId: ${gameId}`
      )
      return null
  }
  if (didUpdate) {
    assertMachineTarget('activateNextSegment', {
      gameId,
      fromStatus: game.status,
      event,
      target: targetStatus,
      actual: (finalTransactionResult as any)?.status,
    })

    // segment events only publish once the active period is present (the
    // requireActivePeriod guard), matching the previous inline condition
    await (publish ?? defaultGamePublisher(ctx, true))(
      gameId,
      BaseGlobalNotificationType.SEGMENT_ACTIVATED
    )
  }

  return finalTransactionResult
}

interface FinishGameArgs {
  gameId: number
}

/**
 * Finish a game once its final period has been consolidated: RESULTS ->
 * COMPLETED. Validity is decided by the lifecycle machine (GameTransitions); the
 * FINISH_GAME guard requires `activePeriodIx >= totalPeriods`, which the final
 * period's consolidation establishes. Returns null when the transition is not
 * valid from the current state (e.g. the game is not on its final results).
 */
export async function finishGame(
  { gameId }: FinishGameArgs,
  ctx: Context,
  { publish }: { publish?: GamePublisher } = {}
) {
  const game = await ctx.prisma.game.findUnique({
    where: { id: gameId },
    include: { periods: true },
  })

  if (!game) return null

  const event = 'FINISH_GAME' as const
  const targetStatus = resolveTargetStatus(game, event, gameId, 'finishGame')
  if (!targetStatus) return null

  const updatedGame = await ctx.prisma.game.update({
    where: {
      id: gameId,
      // optimistic concurrency: only transition if status is unchanged
      status: game.status,
    },
    include: { periods: { include: { segments: true } } },
    data: {
      status: targetStatus,
      version: { increment: 1 },
    },
  })

  assertMachineTarget('finishGame', {
    gameId,
    fromStatus: game.status,
    event,
    target: targetStatus,
    actual: updatedGame.status,
  })

  await (publish ?? defaultGamePublisher(ctx))(
    gameId,
    BaseGlobalNotificationType.GAME_STATE_UPDATED
  )

  return updatedGame
}

export async function updatePlayerData<PlayerFactsType>(
  { name, facts }: UpdatePlayerDataArgs<PlayerFactsType>,
  ctx: Context,
  { schema }: { schema: yup.Schema<PlayerFactsType> }
) {
  // if none of the arguments have been provided, no update is performed
  if (none(Boolean, [name, facts])) {
    return null
  }

  let data = {}
  if (name) {
    data['name'] = name
  }

  if (facts) {
    data['facts'] = schema.validateSync(facts, {
      stripUnknown: true,
    })
  }

  const player = await ctx.prisma.player.update({
    where: {
      id: ctx.user.sub,
    },
    data,
    include: {
      game: {
        include: {
          activePeriod: true,
        },
      },
      level: true,
      achievements: {
        include: {
          achievement: true,
        },
      },
    },
  })

  return player
}

export async function getGames(args, ctx: Context) {
  const result = await ctx.prisma.game.findMany({
    orderBy: {
      id: 'desc',
    },
    include: {
      _count: {
        select: { players: true },
      },
      activePeriod: true,
    },
  })
  return result.map((game) => ({
    ...game,
    activeSegmentIx: game.activePeriod?.activeSegmentIx,
  }))
}

export async function getGame(args, ctx: Context) {
  const gameId = args.id ?? ctx.user.gameId

  if (!gameId) {
    return null
  }

  return ctx.prisma.game.findUnique({
    where: {
      id: args.id,
    },
    include: {
      players: {
        include: {
          level: true,
          achievements: true,
        },
        orderBy: {
          number: 'asc',
        },
      },
      periods: {
        orderBy: {
          index: 'asc',
        },
        include: {
          segments: {
            orderBy: {
              index: 'asc',
            },
            include: {
              learningElements: true,
              storyElements: true,
            },
          },
        },
      },
      activePeriod: {
        include: {
          segments: {
            orderBy: {
              index: 'asc',
            },
          },
          activeSegment: true,
        },
      },
    },
  })
}

export async function getGameFromContext(ctx: Context) {
  return ctx.prisma.game.findUnique({
    where: {
      id: ctx.user.gameId,
    },
    include: {
      activePeriod: true,
    },
  })
}

export async function getLearningElements(args, ctx: Context) {
  return ctx.prisma.learningElement.findMany({
    include: {
      options: true,
    },
  })
}

export async function getStoryElements(args, ctx: Context) {
  return ctx.prisma.storyElement.findMany()
}

/**
 * Plain, Prisma-free descriptor of a player action produced by result
 * computation. The compute* cores return these instead of live Prisma promises,
 * so they stay pure and unit-testable; a call-site mapper (`toPlayerActionCreate`)
 * turns each into a `playerAction.create` inside the transaction. See CONTEXT.md
 * ("result descriptor").
 */
export interface ActionDescriptor {
  type: string
  facts: any
  /** segment index the action belongs to, when segment-scoped */
  segment?: number
  playerId: string
  periodIx: number
}

/**
 * Plain descriptor of a period-end domain-event batch for one player. A
 * call-site mapper (`toReceiveEventsThunk`) turns it into a deferred
 * `EventService.receiveEvents` thunk run only after the game-state transaction
 * commits.
 */
export interface EventDescriptor {
  playerId: string
  events: any
  periodIx: number
  gameId: number
  achievementKeys: any
  experience: any
  levelIx: any
}

/**
 * I/O seam: build the Prisma `playerAction.create` for an ActionDescriptor.
 * Lives at the call site (closes over `ctx`) so the compute* cores never touch
 * Prisma.
 */
function toPlayerActionCreate(
  ctx: Context,
  gameId: number,
  d: ActionDescriptor
) {
  return ctx.prisma.playerAction.create({
    data: {
      type: d.type,
      facts: d.facts,
      game: {
        connect: { id: gameId },
      },
      player: {
        connect: { id: d.playerId },
      },
      periodIx: d.periodIx,
      period: {
        connect: {
          gameId_index: {
            gameId,
            index: d.periodIx,
          },
        },
      },
      segmentIx: typeof d.segment === 'number' ? d.segment : undefined,
      segment:
        typeof d.segment === 'number'
          ? {
              connect: {
                gameId_periodIx_index: {
                  gameId,
                  periodIx: d.periodIx,
                  index: d.segment,
                },
              },
            }
          : undefined,
    },
  })
}

/** I/O seam: build the deferred receiveEvents thunk for an EventDescriptor. */
function toReceiveEventsThunk(ctx: Context, d: EventDescriptor) {
  return () =>
    EventService.receiveEvents({
      events: d.events,
      ctx: {
        args: {
          playerId: d.playerId,
          periodIx: d.periodIx,
          gameId: d.gameId,
        },
        user: ctx.user,
        achievements: d.achievementKeys,
        experience: d.experience,
        currentLevelIx: d.levelIx,
      },
      prisma: ctx.prisma,
    })
}

export function computePeriodStartResults(
  { results, players, activePeriodIx, game, periodFacts },
  { services }: { services: any }
): { results: any[]; actions: ActionDescriptor[] } {
  const currentPeriodIx = activePeriodIx
  const nextPeriodIx = currentPeriodIx + 1

  const actions: ActionDescriptor[] = []

  // if the game is running, transform previous results to next
  if (currentPeriodIx >= 0) {
    const result = results
      // ensure that we only work on PERIOD_END results of the preceding period
      .filter((result) => result.type === DB.PlayerResultType.PERIOD_END)
      .map((result) => {
        const { resultFacts: facts, actions: domainActions } =
          services.PeriodResult.start(result.facts, {
            playerRole: result.player?.role ?? result.player.connect?.role,
            gameFacts: game.facts,
            periodFacts,
          })

        if (domainActions && domainActions.length > 0) {
          for (const a of domainActions) {
            actions.push({
              type: a.type,
              facts: a.facts,
              segment: a.segment,
              playerId: result.player.id,
              periodIx: currentPeriodIx,
            })
          }
        }

        return {
          type: DB.PlayerResultType.PERIOD_START,
          periodIx: currentPeriodIx,
          segmentIx: -1,
          facts,
          player: {
            connect: {
              id: result.player.id ?? result.player.connect.id,
            },
          },
          game: {
            connect: {
              id: game.id,
            },
          },
        }
      })

    return {
      results: result,
      actions,
    }
  }

  // if the game has not started yet, generate initial PERIOD_START results
  const result = players.map((player) => {
    const { resultFacts: facts, actions: domainActions } =
      services.PeriodResult.initialize(
        {},
        { playerRole: player.role, gameFacts: game.facts, periodFacts }
      )

    if (domainActions && domainActions.length > 0) {
      for (const a of domainActions) {
        actions.push({
          type: a.type,
          facts: a.facts,
          segment: a.segment,
          playerId: player.id,
          periodIx: nextPeriodIx,
        })
      }
    }

    return {
      type: DB.PlayerResultType.PERIOD_START,
      periodIx: nextPeriodIx,
      segmentIx: -1,
      facts,
      player: {
        connect: {
          id: player.id,
        },
      },
      game: {
        connect: {
          id: game.id,
        },
      },
    }
  })

  return {
    results: result,
    actions,
  }
}

export function computePeriodEndResults(
  {
    segmentEndResults,
    players,
    activeSegmentResults,
    periodFacts,
    periodDecisions,
    segmentFacts,
    activePeriodIx,
    activeSegmentIx,
    game,
  },
  { services }: { services: any }
): { results: any[]; actions: ActionDescriptor[]; events: EventDescriptor[] } {
  const actions: ActionDescriptor[] = []
  // one descriptor per player result; the caller builds the deferred
  // receiveEvents thunks and runs them only AFTER the game-state transaction
  // has committed, so achievement/experience side-effects are not applied when
  // the transaction rolls back
  const events: EventDescriptor[] = []

  const perPlayer = {}
  players.forEach((player) => {
    perPlayer[player.id] = {
      segmentEndResults: segmentEndResults.filter(
        (res) => res.playerId === player.id
      ),
      otherPlayersSegmentEndResults: segmentEndResults.filter(
        (res) => res.playerId !== player.id
      ),
      consolidationDecisions: periodDecisions.find(
        (decision) => decision.playerId === player.id
      ),
    }
  })

  const results = activeSegmentResults
    .filter((result) => result.type === DB.PlayerResultType.SEGMENT_END)
    .map((result, ix, allResults) => {
      const segmentEndResultsLocal =
        perPlayer[result.playerId].segmentEndResults
      const otherPlayersSegmentEndResults =
        perPlayer[result.playerId].otherPlayersSegmentEndResults
      const consolidationDecisions =
        perPlayer[result.playerId].consolidationDecisions
      const {
        resultFacts: facts,
        actions: domainActions,
        events: domainEvents,
      } = services.PeriodResult.end(result.facts, {
        segmentEndResults: segmentEndResultsLocal,
        otherPlayersSegmentEndResults,
        gameFacts: game.facts,
        periodFacts,
        segmentFacts,

        playerRole: result.player.role,
        playerLevel: result.player.levelIx + 1,
        playerExperience: result.player.experience,

        consolidationDecisions,
        periodIx: activePeriodIx,
        segmentIx: activeSegmentIx,
      })

      log.debug(domainActions)

      if (domainActions && domainActions.length > 0) {
        for (const a of domainActions) {
          actions.push({
            type: a.type,
            facts: a.facts,
            segment: a.segment,
            playerId: result.player.id,
            periodIx: activePeriodIx,
          })
        }
      }

      events.push({
        playerId: result.player.id,
        events: domainEvents,
        periodIx: activePeriodIx,
        gameId: game.id,
        achievementKeys: result.player.achievementKeys,
        experience: result.player.experience,
        levelIx: result.player.levelIx,
      })

      return {
        type: DB.PlayerResultType.PERIOD_END,
        periodIx: activePeriodIx,
        facts,
        player: { connect: { id: result.playerId } },
        game: { connect: { id: game.id } },
      }
    })

  return {
    results,
    actions,
    events,
  }
}

export function computeSegmentStartResults(
  game,
  { services }: { services: any }
): { results: any[]; actions: ActionDescriptor[] } {
  const currentSegmentIx = game.activePeriod.activeSegmentIx
  const nextSegmentIx = currentSegmentIx + 1

  const actions: ActionDescriptor[] = []

  // if there was a previous segment, compute the change in results
  if (currentSegmentIx >= 0) {
    const results = game.activePeriod.activeSegment.results
      .filter((result) => result.type === DB.PlayerResultType.SEGMENT_END)
      .reduce((acc, result) => {
        const { resultFacts: facts, actions: domainActions } =
          services.SegmentResult.start(result.facts, {
            playerRole: result.player.role,
            gameFacts: game.facts,
            periodFacts: game.activePeriod.facts,
            segmentFacts: game.activePeriod.activeSegment.facts,
            nextSegmentFacts:
              game.activePeriod.activeSegment.nextSegment?.facts,
            segmentIx: nextSegmentIx,
          })

        if (domainActions && domainActions.length > 0) {
          for (const a of domainActions) {
            actions.push({
              type: a.type,
              facts: a.facts,
              segment: a.segment,
              playerId: result.player.id,
              periodIx: game.activePeriodIx,
            })
          }
        }

        const common = {
          facts,
          periodIx: game.activePeriodIx,
          segmentIx: nextSegmentIx,
          player: {
            connect: {
              id: result.playerId,
            },
          },
          period: {
            connect: {
              id: game.activePeriodId,
            },
          },
          game: {
            connect: {
              id: game.id,
            },
          },
        }
        return [
          ...acc,
          {
            ...common,
            type: DB.PlayerResultType.SEGMENT_START,
          },
          {
            ...common,
            type: DB.PlayerResultType.SEGMENT_END,
          },
        ]
      }, [])

    return {
      results,
      actions,
    }
  }

  // Use first segment of active period and not activeSegment as it's not
  // active yet.
  const activePeriod = game.activePeriod
  if (activePeriod.segments.length === 0) {
    throw new Error(
      'Cannot compute segment start results: no segments exist in the active period.'
    )
  }
  const aboutToBeactiveSegment = activePeriod.segments[0]

  // if it is the first segment, transform PERIOD_START to SEGMENT_START
  const results = activePeriod.results
    .filter((result) => result.type === DB.PlayerResultType.PERIOD_START)
    .reduce((acc, result, ix, allResults) => {
      let { resultFacts: facts } = services.SegmentResult.initialize(
        result.facts,
        {
          playerRole: result.player.role,
          gameFacts: game.facts,
          periodFacts: activePeriod.facts,
          segmentFacts: aboutToBeactiveSegment.facts,
          nextSegmentFacts: aboutToBeactiveSegment.nextSegment?.facts,
          segmentIx: nextSegmentIx,
        }
      )

      const common = {
        facts,
        periodIx: game.activePeriodIx,
        segmentIx: nextSegmentIx,
        player: {
          connect: {
            id: result.playerId,
          },
        },
        period: {
          connect: {
            id: game.activePeriodId,
          },
        },
        game: {
          connect: {
            id: game.id,
          },
        },
      }

      return [
        ...acc,
        {
          ...common,
          type: DB.PlayerResultType.SEGMENT_START,
        },
        {
          ...common,
          type: DB.PlayerResultType.SEGMENT_END,
        },
      ]
    }, [])

  return {
    results,
    actions,
  }
}

export function computeSegmentEndResults(
  game,
  { services }: { services: any }
): { results: any[]; actions: ActionDescriptor[] } {
  const actions: ActionDescriptor[] = []

  // NOTE(JJ): We go through all results of the active segment of each player
  // and update the game facts if needed
  const results = game.activePeriod.activeSegment.results
    .filter((result) => result.type === DB.PlayerResultType.SEGMENT_END)
    .map((result, ix, allResults) => {
      const { resultFacts: facts, actions: domainActions } =
        services.SegmentResult.end(result.facts, {
          playerRole: result.player.role,
          gameFacts: game.facts,
          periodFacts: game.activePeriod.facts,
          segmentFacts: game.activePeriod.activeSegment.facts,
          segmentIx: game.activePeriod.activeSegmentIx,
        })

      if (domainActions && domainActions.length > 0) {
        for (const a of domainActions) {
          actions.push({
            type: a.type,
            facts: a.facts,
            segment: a.segment,
            playerId: result.player.id,
            periodIx: game.activePeriodIx,
          })
        }
      }

      return {
        where: {
          periodIx_segmentIx_playerId_type: {
            periodIx: game.activePeriodIx,
            segmentIx: game.activePeriod.activeSegmentIx,
            playerId: result.playerId,
            type: DB.PlayerResultType.SEGMENT_END,
          },
        },
        data: {
          facts,
          game: {
            connect: {
              id: game.id,
            },
          },
        },
      }
    })

  return {
    results,
    actions,
  }
}
