import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { none, repeat } from 'ramda'
import * as yup from 'yup'
import { GameStatus, PlayerResultType } from '../generated/ops'
import { CtxWithFacts, CtxWithFactsAndSchema, CtxWithPrisma } from '../types'
import * as EventService from './EventService'

type Context = CtxWithPrisma<PrismaClient>

interface CreateGameArgs {
  name: string
  playerCount: number
}

export async function createGame(
  { name, playerCount }: CreateGameArgs,
  ctx: Context,
  { roleAssigner }: { roleAssigner: (ix: number) => any }
) {
  return ctx.prisma.game.create({
    data: {
      name,
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
            role: roleAssigner(ix),
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
}

export async function addGamePeriod<TFacts>(
  { gameId, facts }: AddGamePeriodArgs<TFacts>,
  ctx: Context,
  { schema, reducers }: CtxWithFactsAndSchema<TFacts, PrismaClient>
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

  const index = game.periods[0]?.index + 1 || 0

  const { result: initializedFacts } = reducers.Period.apply(validatedFacts, {
    type: reducers.Period.ActionTypes.PERIOD_INITIALIZE,
    payload: {
      periodFacts: validatedFacts,
      previousPeriodFacts: game.periods[0]?.facts as any,
      previousSegmentFacts: game.periods[0]?.segments[0]?.facts as any,
      periodIx: index,
    },
  })

  // create or update the facts and settings of a game period
  return ctx.prisma.period.upsert({
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
  { schema, reducers }: CtxWithFactsAndSchema<TFacts, PrismaClient>
) {
  const validatedFacts = schema.validateSync(facts)

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

  const index = period.segments[0]?.index + 1 || 0

  const { result: initializedFacts } = reducers.Segment.apply(validatedFacts, {
    type: reducers.Segment.ActionTypes.SEGMENT_INITIALIZE,
    payload: {
      periodFacts: period.facts,
      previousSegmentFacts: period.segments[0]?.facts,
      segmentIx: index,
      segmentCount: 4,
      periodIx,
    },
  })

  // create or update the facts and settings of a period segment
  return ctx.prisma.periodSegment.upsert({
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
}

interface ActivateNextPeriodArgs {
  gameId: number
}

export async function activateNextPeriod(
  { gameId }: ActivateNextPeriodArgs,
  ctx: Context,
  { reducers }: CtxWithFacts<any, PrismaClient>
) {
  // get the current game and as well as the results of the initially active period
  // these will be used by the model to compute the starting situation of the next period
  const game = await ctx.prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      players: true,
      periods: true,
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

  const currentPeriodIx = game.activePeriodIx
  const currentSegmentIx = game.activePeriod?.activeSegmentIx
  const nextPeriodIx = currentPeriodIx + 1

  // NotificationService.publishGlobalNotification({
  //   type: GlobalNotificationType.PERIOD_ACTIVATED,
  // })

  switch (game.status) {
    // SCHEDULED -> PREPARATION
    // if the game is scheduled, initialize period results and move to PREPARATION
    case GameStatus.Scheduled: {
      const { results, extras } = computePeriodStartResults(
        {
          results: undefined,
          players: game.players,
          activePeriodIx: currentPeriodIx,
          gameId: game.id,
          periodFacts: game.periods?.[0].facts,
        },
        ctx,
        { reducers }
      )

      // update the status and active period of the current game
      // and prepare PERIOD_START results
      const result = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          where: {
            id: gameId,
          },
          data: {
            status: GameStatus.Preparation,
            activePeriodIx: nextPeriodIx,
            activePeriod: {
              connect: {
                gameId_index: {
                  gameId,
                  index: nextPeriodIx,
                },
              },
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

      return result
    }

    // RUNNING -> CONSOLIDATION
    // if the final segment is running, go on with consolidation of the period
    // compute the results of the last segment and update the game status
    case GameStatus.Running: {
      if (!game.activePeriod?.activeSegment || !currentSegmentIx) return null

      const { results, extras } = computeSegmentEndResults(game, ctx, {
        reducers,
      })

      // update period facts when starting consolidation
      const { result: consolidatedFacts } = reducers.Period.apply(
        game.activePeriod.facts,
        {
          type: reducers.Period.ActionTypes.PERIOD_CONSOLIDATE,
          payload: {
            previousSegmentFacts: game.activePeriod.activeSegment.facts as any,
            periodIx: currentPeriodIx,
          },
        }
      )

      const result = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          data: {
            status: GameStatus.Consolidation,
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
    case GameStatus.Consolidation: {
      if (!game.activePeriod?.activeSegment) return null

      const { results, extras, promises } = await computePeriodEndResults(
        {
          segmentResults: game.activePeriod.activeSegment.results,
          segmentFacts: game.activePeriod.activeSegment.facts,
          periodFacts: game.activePeriod.facts,
          periodDecisions: game.activePeriod.decisions,
          activePeriodIx: currentPeriodIx,
          gameId: game.id,
        },
        ctx,
        { reducers }
      )

      await Promise.all(promises)

      const result = await ctx.prisma.$transaction([
        // update the status and active period of the current game
        ctx.prisma.game.update({
          where: {
            id: gameId,
          },
          data: {
            status: GameStatus.Results,
            activePeriodIx: nextPeriodIx,
            activePeriod: {
              connect: {
                gameId_index: {
                  gameId,
                  index: nextPeriodIx,
                },
              },
            },
          },
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
    case GameStatus.Results: {
      // if there is no next period, return
      if (!game.activePeriod?.nextPeriod) {
        return null
      }

      const { results, extras } = computePeriodStartResults(
        {
          results: game.activePeriod.previousPeriod[0].results,
          players: game.players,
          activePeriodIx: currentPeriodIx,
          gameId: game.id,
          periodFacts: game.activePeriod.facts,
        },
        ctx,
        { reducers }
      )

      const result = await ctx.prisma.$transaction([
        // update the status and active period of the current game
        ctx.prisma.game.update({
          where: {
            id: gameId,
          },
          data: {
            status: GameStatus.Preparation,
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
  { reducers }: CtxWithFacts<any, PrismaClient>
) {
  const game = await ctx.prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      players: true,
      periods: true,
      segments: true,
      activePeriod: {
        include: {
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
    case GameStatus.Preparation:
    case GameStatus.Paused: {
      const { results, extras } = computeSegmentStartResults(game, ctx, {
        reducers,
      })

      const result = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          where: {
            id: gameId,
          },
          data: {
            status: GameStatus.Running,
          },
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

      try {
        await ctx.prisma.player.updateMany({
          where: {
            game: {
              id: gameId,
            },
          },
          data: {
            isReady: false,
          },
        })
      } catch (e) {
        console.error(e)
      }

      return result
    }

    // RUNNING -> PAUSED
    // compute the segment results of the current segment and set to paused
    case GameStatus.Running: {
      // return if there is no next segment available
      if (!game.activePeriod?.activeSegment?.nextSegment) {
        return null
      }

      const { results, extras } = computeSegmentEndResults(game, ctx, {
        reducers,
      })

      const result = await ctx.prisma.$transaction([
        ctx.prisma.game.update({
          where: { id: gameId },
          data: {
            status: GameStatus.Paused,
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
              update: results,
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

    default:
      return null
  }
}

const PlayerFactsSchema = yup.object({
  location: yup.string().default('Zurich'),
})

export interface PlayerFacts extends yup.InferType<typeof PlayerFactsSchema> {}

interface UpdatePlayerDataArgs {
  name?: string
  avatar?: string
  color?: string
  facts: PlayerFacts
}

export async function updatePlayerData(
  { name, avatar, color, facts }: UpdatePlayerDataArgs,
  ctx: Context
) {
  // if none of the arguments have been provided, no update is performed
  if (none(Boolean, [name, avatar, color, facts])) {
    return null
  }

  let data = {}
  if (name) {
    data['name'] = name
  }
  if (avatar) {
    data['avatar'] = avatar
  }
  if (color) {
    data['color'] = color
  }
  if (facts) {
    data['facts'] = PlayerFactsSchema.validateSync(facts, {
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
  return ctx.prisma.game.findMany()
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
          segments: true,
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
  { results, players, activePeriodIx, gameId, periodFacts },
  ctx,
  { reducers }
) {
  const currentPeriodIx = activePeriodIx
  const nextPeriodIx = currentPeriodIx + 1

  let extras: any[] = []

  // if the game is running, transform previous results to next
  if (currentPeriodIx >= 0) {
    const result = results
      // ensure that we only work on PERIOD_END results of the preceding period
      .filter((result) => result.type === PlayerResultType.PeriodEnd)
      .map((result, ix, allResults) => {
        const { result: facts, actions } = reducers.PeriodResult.apply(result, {
          type: reducers.PeriodResult.ActionTypes.PERIOD_RESULTS_START,
          payload: {
            playerRole: result.player.role ?? result.player.connect.role,
            initialCash: periodFacts.initialCash,
          },
        })

        const mapper = mapAction({
          ctx,
          gameId,
          activePeriodIx: currentPeriodIx,
          playerId: result.player.id,
        })

        if (actions && actions.length > 0) {
          extras = [...extras, ...actions.map(mapper)]
        }

        return {
          type: PlayerResultType.PeriodStart,
          periodIx: currentPeriodIx,
          facts,
          player: {
            connect: {
              id: result.player.id ?? result.player.connect.id,
            },
          },
          game: {
            connect: {
              id: gameId,
            },
          },
        }
      })

    return {
      results: result,
      extras,
    }
  }

  // if the game has not started yet, generate initial PERIOD_START results
  const result = players.map((player, ix, allPlayers) => {
    const { result: facts, actions } = reducers.PeriodResult.apply(
      {},
      {
        type: reducers.PeriodResult.ActionTypes.PERIOD_RESULTS_INITIALIZE,
        payload: {
          playerRole: player.role,
          initialCash: periodFacts.initialCash,
        },
      }
    )

    const mapper = mapAction({
      ctx,
      gameId,
      activePeriodIx: nextPeriodIx,
      playerId: player.id,
    })

    if (actions && actions.length > 0) {
      extras = [...extras, ...actions.map(mapper)]
    }

    return {
      type: PlayerResultType.PeriodStart,
      periodIx: nextPeriodIx,
      facts,
      player: {
        connect: {
          id: player.id,
        },
      },
      game: {
        connect: {
          id: gameId,
        },
      },
    }
  })

  return {
    results: result,
    extras,
  }
}

export async function computePeriodEndResults(
  {
    segmentResults,
    periodFacts,
    periodDecisions,
    segmentFacts,
    activePeriodIx,
    gameId,
  },
  ctx: Context,
  { reducers }
) {
  let extras: any[] = []
  let promises: Promise<any>[] = []

  const results = segmentResults
    .filter((result) => result.type === PlayerResultType.SegmentEnd)
    .map((result, ix, allResults) => {
      const consolidationDecisions = periodDecisions.find(
        (decision) => decision.playerId === result.playerId
      )

      const {
        result: facts,
        actions,
        events,
      } = reducers.PeriodResult.apply(result.facts, {
        type: reducers.PeriodResult.ActionTypes.PERIOD_RESULTS_END,
        payload: {
          interestRate: periodFacts.interestRate,
          spotPrice: segmentFacts.spotPrice,
          futuresPrice: segmentFacts.futuresPrice,
          randomSeed: periodFacts.randomSeed,
          initialSpotPrice: periodFacts.initialSpotPrice,
          playerRole: result.player.role,
          playerLevel: result.player.levelIx + 1,
          playerExperience: result.player.experience,
          storageCostPerItem: periodFacts.storageCostPerItem,
          trendE: periodFacts.trendE,
          trendGap: periodFacts.trendGap,
          consolidationDecisions,
          cashInflowTotal: segmentFacts.cashInflowTotal,
          periodIx: activePeriodIx,
        },
      })

      const mapper = mapAction({
        ctx,
        gameId,
        activePeriodIx,
        playerId: result.player.id,
      })

      if (actions && actions.length > 0) {
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
              gameId,
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
        type: PlayerResultType.PeriodEnd,
        periodIx: activePeriodIx,
        facts,
        player: {
          connect: {
            id: result.playerId,
          },
        },
        game: {
          connect: {
            id: gameId,
          },
        },
      }
    })

  return {
    extras,
    results,
    promises,
  }
}

export function computeSegmentStartResults(game, ctx, { reducers }) {
  const currentSegmentIx = game.activePeriod.activeSegmentIx
  const nextSegmentIx = currentSegmentIx + 1

  let extras: any[] = []

  // if there was a previous segment, compute the change in results
  if (currentSegmentIx >= 0) {
    const results = game.activePeriod.activeSegment.results
      .filter((result) => result.type === PlayerResultType.SegmentEnd)
      .reduce((acc, result, ix, allResults) => {
        const { result: facts, actions } = reducers.SegmentResult.apply(
          result.facts,
          {
            type: reducers.SegmentResult.ActionTypes.SEGMENT_RESULTS_START,
            payload: {
              playerRole: result.player.role,
              interestRate: game.activePeriod.facts.interestRate,
              futuresPriceNext:
                game.activePeriod.activeSegment.nextSegment.facts.futuresPrice,
              futuresPriceCurrent:
                game.activePeriod.activeSegment.facts.futuresPrice,
              spotPriceNext:
                game.activePeriod.activeSegment.nextSegment.facts.spotPrice,
              segmentIx: nextSegmentIx,
              cashInflow:
                game.activePeriod.activeSegment.nextSegment.facts.cashInflow,
            },
          }
        )

        const mapper = mapAction({
          ctx,
          gameId: game.id,
          activePeriodIx: game.activePeriodIx,
          playerId: result.player.id,
        })

        if (actions && actions.length > 0) {
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
            type: PlayerResultType.SegmentStart,
          },
          {
            ...common,
            type: PlayerResultType.SegmentEnd,
          },
        ]
      }, [])

    return {
      results,
      extras,
    }
  }

  // if it is the first segment, transform PERIOD_START to SEGMENT_START
  const results = game.activePeriod.results
    .filter((result) => result.type === PlayerResultType.PeriodStart)
    .reduce((acc, result, ix, allResults) => {
      const { result: facts } = reducers.SegmentResult.apply(result.facts, {
        type: reducers.SegmentResult.ActionTypes.SEGMENT_RESULTS_INITIALIZE,
        payload: {
          cashBalance: result.facts.cashBalance,
          storageAmount: result.facts.storageAmount,
          spotPrice: game.activePeriod.facts.initialSpotPrice,
          playerRole: result.player.role,
        },
      })

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
          type: PlayerResultType.SegmentStart,
        },
        {
          ...common,
          type: PlayerResultType.SegmentEnd,
        },
      ]
    }, [])

  return {
    results,
    extras,
  }
}

export function computeSegmentEndResults(game, ctx, { reducers }) {
  let extras: any[] = []

  const results = game.activePeriod.activeSegment.results
    .filter((result) => result.type === PlayerResultType.SegmentEnd)
    .map((result, ix, allResults) => {
      const { result: facts, actions } = reducers.SegmentResult.apply(
        result.facts,
        {
          type: reducers.SegmentResult.ActionTypes.SEGMENT_RESULTS_END,
          payload: {
            storageCostPerItem: game.activePeriod.facts.storageCostPerItem,
            segmentIx: game.activePeriod.activeSegmentIx,
          },
        }
      )

      const mapper = mapAction({
        ctx,
        gameId: game.id,
        activePeriodIx: game.activePeriodIx,
        playerId: result.player.id,
      })

      if (actions && actions.length > 0) {
        extras = [...extras, ...actions.map(mapper)]
      }

      return {
        where: {
          periodIx_segmentIx_playerId_type: {
            periodIx: game.activePeriodIx,
            segmentIx: game.activePeriod.activeSegmentIx,
            playerId: result.playerId,
            type: PlayerResultType.SegmentEnd,
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
  }
}