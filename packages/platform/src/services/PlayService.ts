import * as DB from '@prisma/client'
import {
  CtxWithPrisma,
  LearningElementState,
  BaseUserNotificationType as UserNotificationType,
  BaseGlobalNotificationType,
  Event as PlatformEvent,
} from '../types.js'
import * as EventService from './EventService.js'
import dayjs from 'dayjs'
import log from '../lib/logger.js'
import { withRetry } from 'src/lib/util.js'

type Context = CtxWithPrisma<DB.PrismaClient>

// TODO(JJ): Add type of custom playerArgs type for facts
interface PerformActionArgs<ActionTypes> {
  gameId: number
  periodIx: number
  segmentIx: number
  playerId: string
  actionType: ActionTypes
  facts: any
}

export async function performAction<ActionTypes>(
  args: PerformActionArgs<ActionTypes>,
  ctx: Context,
  { services }: any
) {
  const periodIx_segmentIx_playerId_type = {
    periodIx: args.periodIx,
    segmentIx: args.segmentIx,
    playerId: args.playerId,
    type: DB.PlayerResultType.SEGMENT_END,
  }

  let notificationsToPublish = []
  let globalNotificationToPublish

  // All reads and writes are now in a single atomic transaction.
  // NOTE: must be awaited so that the notification variables below are
  // populated (the transaction callback assigns them) before we publish.
  const res = await ctx.prisma.$transaction(
    async (tx) => {
      const previousResult = await tx.playerResult.findUnique({
        where: {
          periodIx_segmentIx_playerId_type,
        },
        include: {
          game: true,
          segment: true,
          period: true,
          player: true,
        },
      })

      if (!previousResult) {
        console.warn('performAction: No previous result found', {
          periodIx: args.periodIx,
          segmentIx: args.segmentIx,
          playerId: args.playerId,
          actionType: args.actionType,
        })
        return null
      }

      if (previousResult.game.status !== DB.GameStatus.RUNNING) {
        throw new Error('ACTIONS_NOT_ALLOWED')
      }

      const {
        result,
        events,
        notifications,
        globalNotification,
        isDirty,
        extras,
        updatedSegmentFacts,
        updatedPeriodFacts,
        specificFacts,
      } = services.Actions.apply(previousResult.facts, {
        type: args.actionType,
        payload: {
          playerArgs: args.facts,
          segmentFacts: previousResult.segment?.facts,
          periodFacts: previousResult.period.facts,
          gameFacts: previousResult.game.facts,
          periodIx: previousResult.period.index,
          segmentIx: previousResult.segment?.index,
          segmentCount: previousResult.period.segmentCount,
          playerId: previousResult.player.id,
          playerRole: previousResult.player.role,
        },
      })

      // TODO(JJ): This has nothing to do with the results
      // -> there should be another performAction function for specific game
      // properties, like orders in the businessg game
      if (specificFacts) {
        await services.Actions.updateDBAfterApply(tx, specificFacts, {
          gameId: previousResult.game.id,
        })
      }

      notificationsToPublish = notifications ?? []
      globalNotificationToPublish = globalNotification

      await EventService.receiveEvents({
        events,
        ctx: {
          user: ctx.user,
          args,
          achievements: previousResult.player.achievementKeys,
          experience: previousResult.player.experience,
          currentLevelIx: previousResult.player.levelIx,
        },
        prisma: tx, // Use the transaction client
      })

      if (!isDirty) {
        return null
      }

      // Update player result
      const updatedResult = await tx.playerResult.update({
        where: {
          periodIx_segmentIx_playerId_type,
        },
        data: {
          facts: result,
        },
        include: {
          period: true,
        },
      })

      // Create player action
      await tx.playerAction.create({
        data: {
          periodIx: args.periodIx,
          period: {
            connect: {
              gameId_index: {
                gameId: args.gameId,
                index: args.periodIx,
              },
            },
          },
          segmentIx: args.segmentIx,
          segment: {
            connect: {
              gameId_periodIx_index: {
                gameId: args.gameId,
                periodIx: args.periodIx,
                index: args.segmentIx,
              },
            },
          },
          game: {
            connect: {
              id: args.gameId,
            },
          },
          player: {
            connect: {
              id: args.playerId,
            },
          },
          type: args.actionType as any,
          facts: {
            ...args.facts,
            ...extras,
          },
        },
      })

      // TODO(JJ): Maybe remove and only allow game facts to be updated
      if (updatedSegmentFacts && previousResult.segment?.id) {
        await tx.periodSegment.update({
          where: { id: previousResult.segment.id },
          data: { facts: updatedSegmentFacts },
        })
      }

      if (updatedPeriodFacts) {
        await tx.period.update({
          where: { id: previousResult.period.id },
          data: { facts: updatedPeriodFacts },
        })
      }

      return updatedResult
    },
    {
      // Use Serializable isolation level for the strongest guarantees
      // This prevents phantom reads and other concurrency issues.
      isolationLevel: DB.Prisma.TransactionIsolationLevel.Serializable,
      // Set an appropriate timeout
      // Prevents long-running transactions from blocking other operations.
      timeout: 10000, // 10 seconds
    }
  )

  if (globalNotificationToPublish) {
    EventService.publishGlobalNotification(globalNotificationToPublish)
    log.info(
      `Published ${globalNotificationToPublish.type} for game ${args.gameId}`,
      globalNotificationToPublish.facts
    )
  }

  // After transaction completes successfully, publish notifications
  if (notificationsToPublish.length > 0) {
    EventService.publishUserNotification(ctx, notificationsToPublish)
  }

  return res
}

export async function performActionWithRetry<ActionTypes>(
  args: PerformActionArgs<ActionTypes>,
  ctx: Context,
  { services }: any,
  maxRetries: number = 3
) {
  let retries = 0
  let lastError: unknown
  while (retries < maxRetries) {
    try {
      return await performAction(args, ctx, { services })
    } catch (error: any) {
      if (
        error instanceof DB.Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2025' || error.code === 'P2034')
      ) {
        lastError = error
        retries++
        // Wait a bit before retrying
        await new Promise((res) => setTimeout(res, 50 + Math.random() * 50))
        continue
      }
      throw error // Re-throw if it's not a concurrency issue
    }
  }
  // keep the underlying Prisma error as the cause so the concurrency code that
  // exhausted the retries is not lost when this surfaces to the caller
  throw new Error(
    `Failed to perform action after ${maxRetries} retries`,
    { cause: lastError }
  )
}

interface SaveDecisionsArgs {
  decisionType: DB.PlayerDecisionType
  facts: any
}

export async function saveDecisions(args: SaveDecisionsArgs, ctx: Context) {
  const game = await ctx.prisma.game.findUnique({
    where: {
      id: ctx.user.gameId,
    },
    include: {
      activePeriod: {
        include: {
          activeSegment: true,
        },
      },
    },
  })

  if (!game?.activePeriod) return null

  if (args.decisionType !== game.status) {
    throw new Error('INVALID_DECISION')
  }

  const periodIx = game.activePeriod.index

  const savedDecision = ctx.prisma.playerDecision.upsert({
    where: {
      playerId_periodIx_type: {
        periodIx,
        playerId: ctx.user.sub,
        type: args.decisionType,
      },
    },
    create: {
      facts: args.facts,
      type: args.decisionType,
      periodIx,
      period: {
        connect: {
          gameId_index: {
            gameId: game.id,
            index: periodIx,
          },
        },
      },
      game: {
        connect: {
          id: game.id,
        },
      },
      player: {
        connect: {
          id: ctx.user.sub,
        },
      },
    },
    update: {
      facts: args.facts,
    },
  })

  return savedDecision
}

interface GetPlayerResultArgs {
  gameId: number
  playerId: string
}

/**
 * Pure visibility rule for `getPlayerResult`: what a player may see at their
 * current period/segment. Future periods (index > activePeriodIx) and future
 * segments of the active period (index > activeSegmentIx) are filtered out, and
 * the result type to fetch is resolved — PERIOD_START only before the very first
 * segment of the first period (the `activeSegmentIx === -1` sentinel), otherwise
 * SEGMENT_END. Plain arrays in, plain data out, no mutation — so the rule and
 * the `-1` sentinel live in one testable place. Generic over the element types
 * so the rich Prisma rows pass through unchanged at the call site. See
 * CONTEXT.md ("visibility filter").
 */
export function filterVisiblePeriods<
  P extends { index: number },
  S extends { index: number }
>(
  periods: P[],
  activePeriod: { segments: S[] },
  activePeriodIx: number,
  activeSegmentIx: number
): { filteredPeriods: P[]; filteredActiveSegments: S[]; resultType: DB.PlayerResultType } {
  const filteredPeriods = periods.filter(
    (period) => period.index <= activePeriodIx
  )
  const filteredActiveSegments = activePeriod.segments.filter(
    (segment) => segment.index <= activeSegmentIx
  )
  const resultType =
    activePeriodIx === 0 && activeSegmentIx === -1
      ? DB.PlayerResultType.PERIOD_START
      : DB.PlayerResultType.SEGMENT_END

  return { filteredPeriods, filteredActiveSegments, resultType }
}

export async function getPlayerResult(args: GetPlayerResultArgs, ctx: Context) {
  const currentGame = await ctx.prisma.game.findUnique({
    where: {
      id: args.gameId,
    },
    include: {
      activePeriod: {
        include: {
          activeSegment: {
            include: {
              learningElements: true,
              storyElements: true,
            },
          },
          segments: {
            orderBy: { index: 'asc' },
            include: {
              learningElements: true,
              storyElements: true,
            },
          },
        },
      },
      periods: {
        orderBy: { index: 'asc' },
        include: {
          segments: {
            orderBy: { index: 'asc' },
            include: {
              learningElements: true,
              storyElements: true,
            },
          },
        },
      },
    },
  })

  if (!currentGame?.activePeriod) return null

  // segmentCount from DB is used as-is (not overwritten with segments.length)
  // so the timeline can correctly forecast remaining segments

  // Filter up to the active period (and active segment) - future periods and
  // segments should not be visible to the user. The rule + the -1 sentinel for
  // the result type live in filterVisiblePeriods.
  // Final RESULTS uses activePeriodIx as a marker; the relation is the period.
  const activePeriodIx = currentGame.activePeriod.index
  const activeSegmentIx = currentGame.activePeriod.activeSegmentIx

  const { filteredPeriods, filteredActiveSegments, resultType } =
    filterVisiblePeriods(
      currentGame.periods,
      currentGame.activePeriod,
      activePeriodIx,
      activeSegmentIx
    )
  currentGame.periods = filteredPeriods
  currentGame.activePeriod.segments = filteredActiveSegments
  // mirror the filtered active-period segments into the periods array entry
  const activePeriodInList = currentGame.periods.find(
    (period) => period.index === activePeriodIx
  )
  if (activePeriodInList) {
    activePeriodInList.segments = filteredActiveSegments
  }

  const previousResults = await ctx.prisma.playerResult.findMany({
    orderBy: {
      id: 'asc',
    },
    where: {
      playerId: args.playerId,
      periodIx: {
        lte: currentGame.activePeriod.index,
      },
    },
    include: {
      period: true,
      segment: true,
    },
  })

  const playerResult = await ctx.prisma.playerResult.findUnique({
    where: {
      periodIx_segmentIx_playerId_type: {
        periodIx: activePeriodIx,
        segmentIx: currentGame.activePeriod.activeSegmentIx,
        playerId: args.playerId,
        type: resultType,
      },
    },
    include: {
      period: true,
      player: {
        include: {
          completedLearningElements: true,
          visitedStoryElements: true,
        },
      },
    },
  })

  const transactions = await ctx.prisma.playerAction.findMany({
    where: {
      player: {
        id: args.playerId,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return {
    currentGame,
    playerResult,
    previousResults,
    transactions,
  }
}

interface GetPlayerDataArgs {
  playerId: string
}

export async function getPlayerData(args: GetPlayerDataArgs, ctx: Context) {
  return ctx.prisma.player.findUnique({
    where: {
      id: args.playerId,
    },
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
}

interface GetPlayerDecisionArgs {
  gameId: number
  playerId: string
}

export async function getPlayerDecision(
  args: GetPlayerDecisionArgs,
  ctx: Context
) {
  const currentGame = await ctx.prisma.game.findUnique({
    where: { id: args.gameId },
  })
  if (!currentGame) return null

  const decision = await ctx.prisma.playerDecision.findUnique({
    where: {
      playerId_periodIx_type: {
        playerId: args.playerId,
        periodIx: currentGame.activePeriodIx,
        type: 'CONSOLIDATION',
      },
    },
  })
  return decision
}

interface GetLearningElementArgs {
  id: string
}

export async function getLearningElement(
  args: GetLearningElementArgs,
  ctx: Context
) {
  const playerWithLearningElements = await ctx.prisma.player.findUnique({
    where: {
      id: ctx.user.sub,
    },
    include: {
      completedLearningElements: {
        where: {
          id: args.id,
        },
      },
    },
  })

  if (!playerWithLearningElements) return null

  const elementSolved =
    playerWithLearningElements.completedLearningElements.length > 0

  const element = await ctx.prisma.learningElement.findUnique({
    where: {
      id: args.id,
    },
    include: {
      options: true,
    },
  })

  if (!element) return null

  return {
    id: args.id,
    element: {
      ...element,
      feedback: elementSolved ? element.feedback : null,
    },
    state: elementSolved
      ? LearningElementState.SOLVED
      : LearningElementState.NEW,
    solution: elementSolved
      ? JSON.stringify(
          element.options.flatMap((option, ix) => (option.correct ? [ix] : []))
        )
      : null,
  }
}

interface AttemptLearningElementArgs {
  elementId: string
  selection: string
}

export async function attemptLearningElement(
  args: AttemptLearningElementArgs,
  ctx: Context
) {
  const learningElement = await ctx.prisma.learningElement.findUnique({
    where: { id: args.elementId },
    include: { options: true },
  })

  if (!learningElement) return null

  try {
    const selectedOptions = JSON.parse(args.selection)

    const pointsAchieved = learningElement.options.reduce((acc, option, ix) => {
      if (option.correct && selectedOptions.includes(ix)) {
        return acc + 1
      }
      if (!option.correct && !selectedOptions.includes(ix)) {
        return acc + 1
      }
      return acc
    }, 0)

    const pointsMax = learningElement.options.length

    let updatedPlayer
    if (pointsAchieved === pointsMax) {
      updatedPlayer = await ctx.prisma.player.update({
        where: {
          id: ctx.user.sub,
        },
        data: {
          completedLearningElements: {
            connect: {
              id: args.elementId,
            },
          },
          completedLearningElementIds: {
            push: args.elementId,
          },
        },
        include: {
          game: {
            include: {
              activePeriod: true,
            },
          },
        },
      })

      await EventService.receiveEvents({
        events: [
          {
            type: UserNotificationType.LEARNING_ELEMENT_SOLVED,
            facts: {
              elementId: args.elementId,
            },
          },
        ],
        ctx: {
          user: ctx.user,
          args: {
            gameId: ctx.user.gameId,
            periodIx: updatedPlayer.game.activePeriodIx,
            playerId: ctx.user.sub,
          },
          achievements: updatedPlayer.achievementKeys,
          experience: updatedPlayer.experience,
          currentLevelIx: updatedPlayer.levelIx,
        },
        prisma: ctx.prisma,
      })
    } else {
      EventService.publishUserNotification(ctx, [
        {
          type: UserNotificationType.LEARNING_ELEMENT_INCORRECT,
        },
      ])
    }

    return {
      id: args.elementId,

      pointsAchieved,
      pointsMax,

      element: {
        id: args.elementId,
        feedback: learningElement.feedback,
      },

      player: updatedPlayer,
    }
  } catch (e) {
    console.warn(e)
    return null
  }
}

interface MarkStoryElementArgs {
  elementId: string
}

export async function markStoryElement(
  args: MarkStoryElementArgs,
  ctx: Context
) {
  const storyElement = await ctx.prisma.storyElement.findUnique({
    where: { id: args.elementId },
  })

  if (!storyElement) return null

  return ctx.prisma.player.update({
    where: {
      id: ctx.user.sub,
    },
    data: {
      visitedStoryElements: {
        connect: {
          id: args.elementId,
        },
      },
      visitedStoryElementIds: {
        push: args.elementId,
      },
    },
  })
}

interface GetPlayerTransactionsArgs {}

export async function getPlayerTransactions(
  args: GetPlayerTransactionsArgs,
  ctx: Context
) {
  const playerActions = ctx.prisma.playerAction.findMany({
    where: {
      player: {
        id: ctx.user.sub,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return playerActions
}

interface SpecificResultsArgs {
  gameId: number
  type: DB.PlayerResultType
}

export async function getSpecificResults(
  args: SpecificResultsArgs,
  ctx: Context
) {
  const playerResults = await ctx.prisma.playerResult.findMany({
    where: {
      gameId: args.gameId,
      type: args.type,
    },
    orderBy: [
      { period: { index: 'asc' } },
      { segment: { index: 'asc' } },
      { player: { name: 'asc' } },
    ],
    include: {
      period: true,
      player: true,
    },
  })

  return playerResults
}

export async function getPlayerResults(args, ctx: Context) {
  const playerResults = await ctx.prisma.playerResult.findMany({
    where: {
      gameId: ctx.user.gameId,
    },
    include: {
      period: true,
      player: true,
      segment: true,
    },
  })

  return playerResults
}

export async function getPastResults(args, ctx: Context) {
  const currentGame = await ctx.prisma.game.findUnique({
    where: { id: ctx.user.gameId },
  })

  if (!currentGame) return null

  const playerResults = await ctx.prisma.playerResult.findMany({
    where: {
      gameId: ctx.user.gameId,
      periodIx: {
        lt: currentGame.activePeriodIx,
      },
      type: 'PERIOD_END',
    },
    include: {
      period: true,
      player: {
        include: {
          level: true,
        },
      },
    },
  })

  return playerResults
}

export async function updateReadyState(args, ctx: Context) {
  const updatedPlayer = await ctx.prisma.player.update({
    where: {
      id: ctx.user.sub,
    },
    data: {
      isReady: args.isReady,
    },
  })

  if (typeof ctx.user.gameId === 'number') {
    const gameState = await EventService.getGameRealtimeState(
      ctx.prisma,
      ctx.user.gameId
    )
    const eventToPublish: PlatformEvent<BaseGlobalNotificationType> = {
      type: BaseGlobalNotificationType.GAME_STATE_UPDATED,
      facts: EventService.buildGameRealtimeFacts(ctx.user.gameId, gameState, {
        playerId: updatedPlayer.id,
        isReady: updatedPlayer.isReady,
      }),
    }
    EventService.publishGlobalNotification(eventToPublish)
    log.info(
      `Published ${eventToPublish.type} for game ${ctx.user.gameId}`,
      eventToPublish.facts
    )
  }

  return updatedPlayer
}

export async function addCountdown(args, ctx: Context) {
  const currentGame = await ctx.prisma.game.findUnique({
    where: { id: args.gameId },
    include: {
      activePeriod: {
        include: {
          activeSegment: true,
        },
      },
    },
  })

  if (!currentGame?.activePeriod?.activeSegment) {
    log.warn(
      `addCountdown: No active period or segment for game ${args.gameId}`
    )
    return null // Or false, depending on expected return type
  }

  const countdownDurationMs = args.seconds * 1000
  const newExpiresAt = dayjs().add(countdownDurationMs, 'ms').toDate()
  const [, updatedGame] = await ctx.prisma.$transaction([
    ctx.prisma.periodSegment.update({
      where: {
        id: currentGame.activePeriod.activeSegment.id,
      },
      data: {
        countdownExpiresAt: newExpiresAt,
        countdownDurationMs,
      },
    }),
    ctx.prisma.game.update({
      where: { id: args.gameId },
      data: {
        version: {
          increment: 1,
        },
      },
      select: EventService.realtimeGameStateSelect,
    }),
  ])

  const eventToPublish: PlatformEvent<BaseGlobalNotificationType> = {
    type: BaseGlobalNotificationType.COUNTDOWN_UPDATED,
    facts: EventService.buildGameRealtimeFacts(args.gameId, updatedGame, {
      periodId: currentGame.activePeriod.id,
      segmentId: currentGame.activePeriod.activeSegment.id,
      countdownExpiresAt: newExpiresAt.toISOString(),
      countdownDurationMs,
    }),
  }
  EventService.publishGlobalNotification(eventToPublish)
  log.info(
    `Published ${eventToPublish.type} for game ${args.gameId}`,
    eventToPublish.facts
  )

  return true
}

export async function toggleSwitch(args, ctx: Context) {
  const currentGame = await ctx.prisma.game.findUnique({
    where: { id: args.gameId },
    include: {
      activePeriod: {
        include: {
          activeSegment: true,
        },
      },
    },
  })

  if (!currentGame?.activePeriod?.activeSegment) {
    log.warn(
      `toggleSwitch: No active period or segment for game ${args.gameId}`
    )
    return null // Or false, depending on expected return type
  }

  const updatedGame = await ctx.prisma.game.update({
    where: { id: args.gameId },
    data: {
      facts: { ...(currentGame.facts as any), toggle: args.toggle },
      version: {
        increment: 1,
      },
    },
    select: EventService.realtimeGameStateSelect,
  })

  const eventToPublish: PlatformEvent<BaseGlobalNotificationType> = {
    type: BaseGlobalNotificationType.SWITCH_TOGGLED,
    facts: EventService.buildGameRealtimeFacts(args.gameId, updatedGame, {
      periodId: currentGame.activePeriod.id,
      segmentId: currentGame.activePeriod.activeSegment.id,
      toggle: args.toggle,
    }),
  }
  EventService.publishGlobalNotification(eventToPublish)
  log.info(
    `Published ${eventToPublish.type} for game ${args.gameId}`,
    eventToPublish.facts
  )

  return args.toggle
}
