import * as DB from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { filter, none, repeat } from 'ramda'
import { standardDeviation } from '../lib/util.js'
import * as yup from 'yup'
import log from '../lib/logger.js'
import {
  CtxWithFacts,
  CtxWithFactsAndSchema,
  CtxWithPrisma,
  UpdatePlayerDataArgs,
} from '../types.js'
import * as EventService from './EventService.js'

type Context = CtxWithPrisma<PrismaClient>

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
  }: { schema: yup.Schema<TFacts>; roleAssigner?: (ix: number) => any }
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
            role: roleAssigner ? roleAssigner(ix) : undefined,
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
  const { resultFacts: initializedFacts, updatedGameFacts } =
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
    })

  console.log(
    game.periods[0]?.facts,
    game.periods[0]?.segments[0]?.facts,
    initializedFacts
  )

  const transactions: any[] = [
    // create or update the facts and settings of a game period
    ctx.prisma.period.upsert({
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
    }),
  ]

  if (updatedGameFacts) {
    transactions.push(
      ctx.prisma.game.update({
        where: { id: gameId },
        data: { facts: updatedGameFacts },
      })
    )
  }

  const [updatedPeriod, _] = await ctx.prisma.$transaction(transactions)

  return updatedPeriod
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
        take: 1,
      },
    },
  })

  if (!period) return null

  const index = (period.segments[0]?.index ?? -1) + 1

  const { resultFacts: initializedFacts, updatedGameFacts } =
    services.Segment.initialize(validatedFacts, {
      gameFacts: game.facts,
      periodFacts: period.facts,
      previousSegmentFacts: period.segments[0]?.facts,
      segmentIx: index,
      segmentCount: period.segmentCount,
      periodIx,
    })

  const transactions: any[] = [
    // create or update the facts and settings of a period segment
    ctx.prisma.periodSegment.upsert({
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
    }),
  ]

  if (updatedGameFacts) {
    transactions.push(
      ctx.prisma.game.update({
        where: {
          id: gameId,
        },
        data: {
          facts: updatedGameFacts,
        },
      })
    )
  }

  const [updatedSegment, _] = await ctx.prisma.$transaction(transactions)
  return updatedSegment
}

interface ActivateNextPeriodArgs {
  gameId: number
}

export async function activateNextPeriod(
  { gameId }: ActivateNextPeriodArgs,
  ctx: Context,
  { services }: CtxWithFacts<any, PrismaClient>
) {
  log.info('activating next period')

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

  // NotificationService.publishGlobalNotification({
  //   type: GlobalNotificationType.PERIOD_ACTIVATED,
  // })

  switch (game.status) {
    // SCHEDULED -> PREPARATION
    // if the game is scheduled, initialize period results and move to PREPARATION
    case DB.GameStatus.SCHEDULED: {
      const { results, extras, gameFactsToUpdate } = computePeriodStartResults(
        {
          results: undefined,
          players: game.players,
          activePeriodIx: currentPeriodIx,
          game,
          periodFacts: game.periods?.[0]?.facts,
        },
        ctx,
        { services }
      )

      // update the status and active period of the current game
      // and prepare PERIOD_START results
      const gameData: any = {
        status: DB.GameStatus.PREPARATION,
        activePeriodIx: nextPeriodIx,
        activePeriod: {
          connect: { gameId_index: { gameId, index: nextPeriodIx } },
        },
      }
      if (Object.keys(gameFactsToUpdate).length > 0) {
        gameData.facts = gameFactsToUpdate
      }

      const result = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          where: {
            id: gameId,
          },
          include: {
            periods: {
              include: {
                segments: true,
              },
            },
          },
          data: gameData,
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

      return result
    }

    // RUNNING -> CONSOLIDATION
    // if the final segment is running, go on with consolidation of the period
    // compute the results of the last segment and update the game status
    case DB.GameStatus.RUNNING: {
      if (!game.activePeriod?.activeSegment || !currentSegmentIx) return null

      const { results, extras, gameFactsToUpdate } = computeSegmentEndResults(
        game,
        ctx,
        {
          services,
        }
      )

      // TODO(JJ): Check if we need to update the game facts as well
      // update period facts when starting consolidation
      const { resultFacts: consolidatedFacts } = services.Period.consolidate(
        game.activePeriod.facts,
        {
          gameFacts: game.facts,
          previousSegmentFacts: game.activePeriod.activeSegment.facts as any,
          periodIx: currentPeriodIx,
        }
      )

      const gameData: any = { status: DB.GameStatus.CONSOLIDATION }
      if (Object.keys(gameFactsToUpdate).length > 0) {
        gameData.facts = gameFactsToUpdate
      }

      const result = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          data: gameData,
          include: {
            periods: {
              include: {
                segments: true,
              },
            },
          },
          where: {
            id: gameId,
          },
        }),

        ctx.prisma.period.update({
          where: {
            gameId_index: {
              gameId,
              index: currentPeriodIx,
            },
          },
          data: {
            facts: consolidatedFacts,
          },
        }),

        ctx.prisma.periodSegment.update({
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
        }),

        ...extras,
      ])

      return result
    }

    // CONSOLIDATION -> RESULTS
    // compute period end results and move to the results phase
    case DB.GameStatus.CONSOLIDATION: {
      if (!game.activePeriod?.activeSegment) return null

      const { results, extras, promises, gameFactsToUpdate } =
        await computePeriodEndResults(
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
          ctx,
          { services }
        )

      await Promise.all(promises)

      // TODO(JJ): The error happens here for the last consolidation
      // - there are no more periods
      // - we prob. need to change the nextPeriodIx if it the last period
      // suggestion
      // - maybe setting game.activePeriod to undefined is enough
      // - In the DB.GameStatus.RESULTS case set the new status
      // to completed when we are done
      // - we prob. need to update the game to completed state
      // - maybe we would like to add a button that finishes the game?
      //    => it's better not imo, but open for discussion
      // -> Discuss with RS

      // const lastPeriodIx = game.periods.length - 1
      let periodIx = nextPeriodIx

      // let data: any = {
      //   status: DB.GameStatus.RESULTS,
      // }
      // if (nextPeriodIx <= lastPeriodIx) {
      //   // periodIx = lastPeriodIx
      //   data.activePeriodIx = periodIx
      //   data.activePeriod = {
      //     connect: {
      //       gameId_index: {
      //         gameId,
      //         index: periodIx,
      //       },
      //     },
      //   }
      // }

      const gameData: any = {
        status: DB.GameStatus.RESULTS,
        activePeriodIx: periodIx,
        activePeriod: {
          connect: { gameId_index: { gameId, index: periodIx } },
        },
      }
      if (Object.keys(gameFactsToUpdate).length > 0) {
        gameData.facts = gameFactsToUpdate
      }

      // TODO(JJ): Check with RS
      // - when updating the game with the nextPeriodIx it crashes
      const result = await ctx.prisma.$transaction([
        // update the status and active period of the current game
        ctx.prisma.game.update({
          where: {
            id: gameId,
          },
          include: {
            periods: {
              include: {
                segments: true,
              },
            },
          },
          data: gameData,
        }),

        // create PERIOD_END results based on the previous SEGMENT_END results
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
          include: {
            results: true,
          },
        }),

        ...extras,
      ])

      return result
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

      const { results, extras, gameFactsToUpdate } = computePeriodStartResults(
        {
          results: game.activePeriod.previousPeriod[0]?.results,
          players: game.players,
          activePeriodIx: currentPeriodIx,
          game,
          periodFacts: game.activePeriod.facts,
        },
        ctx,
        { services }
      )

      const gameData: any = { status: DB.GameStatus.PREPARATION }
      if (Object.keys(gameFactsToUpdate).length > 0) {
        gameData.facts = gameFactsToUpdate
      }

      const result = await ctx.prisma.$transaction([
        // update the status and active period of the current game
        ctx.prisma.game.update({
          where: {
            id: gameId,
          },
          include: {
            periods: {
              include: {
                segments: true,
              },
            },
          },
          data: gameData,
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

        ...extras,
      ])

      return result
    }

    default:
      // PREPARATION, PAUSED, COMPLETED, etc.
      return null
  }
}

interface ActivateSegmentArgs {
  gameId: number
}

export async function activateNextSegment(
  { gameId }: ActivateSegmentArgs,
  ctx: Context,
  { services }: CtxWithFacts<any, PrismaClient>
) {
  const game = await ctx.prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      activePeriod: {
        include: {
          segments: {
            include: {
              nextSegment: true,
            },
          },
          results: {
            include: {
              player: true,
            },
          },
          activeSegment: {
            include: {
              nextSegment: true,
              results: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!game?.activePeriod) return null

  const currentPeriodIx = game.activePeriodIx
  const currentSegmentIx = game.activePeriod.activeSegmentIx
  const nextSegmentIx = currentSegmentIx + 1

  // NotificationService.publishGlobalNotification({
  //   type: GlobalNotificationType.SEGMENT_ACTIVATED,
  // })

  switch (game.status) {
    // PREPARATION -> RUNNING
    // PAUSED -> RUNNING
    case DB.GameStatus.PREPARATION:
    case DB.GameStatus.PAUSED: {
      const { results, extras, gameFactsToUpdate } = computeSegmentStartResults(
        game,
        ctx,
        {
          services,
        }
      )

      const gameData: any = { status: DB.GameStatus.RUNNING }
      if (Object.keys(gameFactsToUpdate).length > 0) {
        gameData.facts = gameFactsToUpdate
      }

      const result = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          where: {
            id: gameId,
          },
          include: {
            periods: {
              include: {
                segments: true,
              },
            },
            players: true,
          },
          data: gameData,
        }),

        // update the active segment of the current period
        ctx.prisma.period.update({
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
        }),

        // SEGMENT INITIALIZATION
        ctx.prisma.periodSegment.update({
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
        }),

        ...extras,
      ])

      return result
    }

    // RUNNING -> PAUSED
    // compute the segment results of the current segment and set to paused
    case DB.GameStatus.RUNNING: {
      // return if there is no next segment available
      if (!game.activePeriod?.activeSegment?.nextSegment) {
        return null
      }

      const { results, extras, gameFactsToUpdate } = computeSegmentEndResults(
        game,
        ctx,
        {
          services,
        }
      )

      const gameData: any = { status: DB.GameStatus.PAUSED }
      if (Object.keys(gameFactsToUpdate).length > 0) {
        gameData.facts = gameFactsToUpdate
      }

      const result = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          where: { id: gameId },
          include: {
            periods: {
              include: {
                segments: true,
              },
            },
            players: true,
          },
          data: gameData,
        }),

        ctx.prisma.periodSegment.update({
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
        }),

        // reset player readiness
        ctx.prisma.player.updateMany({
          where: {
            game: {
              id: gameId,
            },
          },
          data: {
            isReady: false,
          },
        }),

        ...extras,
      ])

      return result
    }

    default:
      return null
  }
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

function mapAction({ ctx, gameId, activePeriodIx, playerId }) {
  return (action) =>
    ctx.prisma.playerAction.create({
      data: {
        type: action.type,
        facts: action.facts,
        game: {
          connect: { id: gameId },
        },
        player: {
          connect: { id: playerId },
        },
        periodIx: activePeriodIx,
        period: {
          connect: {
            gameId_index: {
              gameId,
              index: activePeriodIx,
            },
          },
        },
        segmentIx:
          typeof action.segment === 'number' ? action.segment : undefined,
        segment:
          typeof action.segment === 'number'
            ? {
                connect: {
                  gameId_periodIx_index: {
                    gameId,
                    periodIx: activePeriodIx,
                    index: action.segment,
                  },
                },
              }
            : undefined,
      },
    })
}

export function computePeriodStartResults(
  { results, players, activePeriodIx, game, periodFacts },
  ctx,
  { services }
) {
  const currentPeriodIx = activePeriodIx
  const nextPeriodIx = currentPeriodIx + 1

  let extras: any[] = []
  // TODO(JJ): Maybe we should initialize it with game.facts?
  let gameFactsToUpdate: any = {}

  // if the game is running, transform previous results to next
  if (currentPeriodIx >= 0) {
    const result = results
      // ensure that we only work on PERIOD_END results of the preceding period
      .filter((result) => result.type === DB.PlayerResultType.PERIOD_END)
      .map((result, ix, allResults) => {
        const {
          resultFacts: facts,
          actions,
          updatedGameFacts,
        } = services.PeriodResult.start(result.facts, {
          playerRole: result.player?.role ?? result.player.connect?.role,
          gameFacts: game.facts,
          periodFacts,
        })

        if (updatedGameFacts) {
          gameFactsToUpdate = {
            ...gameFactsToUpdate,
            ...updatedGameFacts,
          }
        }

        if (actions && actions.length > 0) {
          const mapper = mapAction({
            ctx,
            gameId: game.id,
            activePeriodIx: currentPeriodIx,
            playerId: result.player.id,
          })

          extras = [...extras, ...actions.map(mapper)]
        }

        return {
          type: DB.PlayerResultType.PERIOD_START,
          periodIx: currentPeriodIx,
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
      extras,
      gameFactsToUpdate,
    }
  }

  // if the game has not started yet, generate initial PERIOD_START results
  const result = players.map((player, ix, allPlayers) => {
    const {
      resultFacts: facts,
      actions,
      updatedGameFacts,
    } = services.PeriodResult.initialize(
      {},
      { playerRole: player.role, gameFacts: game.facts, periodFacts }
    )

    if (updatedGameFacts) {
      gameFactsToUpdate = {
        ...gameFactsToUpdate,
        ...updatedGameFacts,
      }
    }

    if (actions && actions.length > 0) {
      const mapper = mapAction({
        ctx,
        gameId: game.id,
        activePeriodIx: nextPeriodIx,
        playerId: player.id,
      })

      extras = [...extras, ...actions.map(mapper)]
    }

    return {
      type: DB.PlayerResultType.PERIOD_START,
      periodIx: nextPeriodIx,
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
    extras,
    gameFactsToUpdate,
  }
}

export async function computePeriodEndResults(
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
  ctx: Context,
  { services }
) {
  let extras: any[] = []
  let promises: Promise<any>[] = []
  let gameFactsToUpdate: any = {}

  const perPlayer = {}
  players.forEach((player) => {
    perPlayer[player.id] = {
      segmentEndResults: segmentEndResults.filter(
        (res) => res.playerId === player.id
      ),
      consolidationDecisions: periodDecisions.find(
        (decision) => decision.playerId === player.id
      ),
    }
  })

  const results = activeSegmentResults
    .filter((result) => result.type === DB.PlayerResultType.SEGMENT_END)
    .map((result, ix, allResults) => {
      const segmentEndResults = perPlayer[result.playerId].segmentEndResults
      const consolidationDecisions =
        perPlayer[result.playerId].consolidationDecisions
      const {
        resultFacts: facts,
        actions,
        events,
        updatedGameFacts,
      } = services.PeriodResult.end(result.facts, {
        segmentEndResults,
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

      log.debug(actions)

      if (updatedGameFacts) {
        gameFactsToUpdate = {
          ...gameFactsToUpdate,
          ...updatedGameFacts,
        }
      }

      if (actions && actions.length > 0) {
        const mapper = mapAction({
          ctx,
          gameId: game.id,
          activePeriodIx,
          playerId: result.player.id,
        })

        extras = [...extras, ...actions.map(mapper)]
      }

      promises = [
        ...promises,
        EventService.receiveEvents({
          events,
          ctx: {
            args: {
              playerId: result.player.id,
              periodIx: activePeriodIx,
              gameId: game.id,
            },
            user: ctx.user,
            achievements: result.player.achievementKeys,
            experience: result.player.experience,
            currentLevelIx: result.player.levelIx,
          },
          prisma: ctx.prisma,
        }),
      ]

      return {
        type: DB.PlayerResultType.PERIOD_END,
        periodIx: activePeriodIx,
        facts,
        player: {
          connect: {
            id: result.playerId,
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
    extras,
    results,
    promises,
    gameFactsToUpdate,
  }
}

export function computeSegmentStartResults(game, ctx, { services }) {
  const currentSegmentIx = game.activePeriod.activeSegmentIx
  const nextSegmentIx = currentSegmentIx + 1

  let extras: any[] = []
  let gameFactsToUpdate: any = {}

  // if there was a previous segment, compute the change in results
  if (currentSegmentIx >= 0) {
    const results = game.activePeriod.activeSegment.results
      .filter((result) => result.type === DB.PlayerResultType.SEGMENT_END)
      .reduce((acc, result, ix, allResults) => {
        const {
          resultFacts: facts,
          actions,
          updatedGameFacts,
        } = services.SegmentResult.start(result.facts, {
          playerRole: result.player.role,
          gameFacts: game.facts,
          periodFacts: game.activePeriod.facts,
          segmentFacts: game.activePeriod.activeSegment.facts,
          nextSegmentFacts: game.activePeriod.activeSegment.nextSegment?.facts,
          segmentIx: nextSegmentIx,
        })

        if (updatedGameFacts) {
          gameFactsToUpdate = {
            ...gameFactsToUpdate,
            ...updatedGameFacts,
          }
        }

        if (actions && actions.length > 0) {
          const mapper = mapAction({
            ctx,
            gameId: game.id,
            activePeriodIx: game.activePeriodIx,
            playerId: result.player.id,
          })

          extras = [...extras, ...actions.map(mapper)]
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
      extras,
      gameFactsToUpdate,
    }
  }

  // Use first segment of active period and not activeSegment as it's not
  // active yet.
  const activePeriod = game.activePeriod
  const aboutToBeactiveSegment = activePeriod.segments[0]

  // if it is the first segment, transform PERIOD_START to SEGMENT_START
  const results = activePeriod.results
    .filter((result) => result.type === DB.PlayerResultType.PERIOD_START)
    .reduce((acc, result, ix, allResults) => {
      let { resultFacts: facts, updatedGameFacts } =
        services.SegmentResult.initialize(result.facts, {
          playerRole: result.player.role,
          gameFacts: game.facts,
          periodFacts: activePeriod.facts,
          segmentFacts: aboutToBeactiveSegment.facts,
          nextSegmentFacts: aboutToBeactiveSegment.nextSegment?.facts,
          segmentIx: nextSegmentIx,
        })

      if (updatedGameFacts) {
        gameFactsToUpdate = {
          ...gameFactsToUpdate,
          ...updatedGameFacts,
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
    extras,
    gameFactsToUpdate,
  }
}

export function computeSegmentEndResults(game, ctx, { services }) {
  let extras: any[] = []
  let gameFactsToUpdate: any = {}

  // NOTE(JJ): We go through all results of the active segment of each player
  // and update the game facts if needed
  const results = game.activePeriod.activeSegment.results
    .filter((result) => result.type === DB.PlayerResultType.SEGMENT_END)
    .map((result, ix, allResults) => {
      const {
        resultFacts: facts,
        actions,
        updatedGameFacts,
      } = services.SegmentResult.end(result.facts, {
        playerRole: result.player.role,
        gameFacts: game.facts,
        periodFacts: game.activePeriod.facts,
        segmentFacts: game.activePeriod.activeSegment.facts,
        segmentIx: game.activePeriod.activeSegmentIx,
      })

      if (updatedGameFacts) {
        gameFactsToUpdate = {
          ...gameFactsToUpdate,
          ...updatedGameFacts,
        }
      }

      if (actions && actions.length > 0) {
        const mapper = mapAction({
          ctx,
          gameId: game.id,
          activePeriodIx: game.activePeriodIx,
          playerId: result.player.id,
        })

        extras = [...extras, ...actions.map(mapper)]
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
    extras,
    gameFactsToUpdate,
  }
}
