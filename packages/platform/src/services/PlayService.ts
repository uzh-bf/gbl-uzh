import * as DB from '@prisma/client'
import {
  CtxWithPrisma,
  LearningElementState,
  BaseUserNotificationType as UserNotificationType,
} from '../types'
import * as EventService from './EventService'

type Context = CtxWithPrisma<DB.PrismaClient>

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

  const previousResult = await ctx.prisma.playerResult.findUnique({
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

  if (!previousResult) return null

  if (previousResult.game.status !== DB.GameStatus.RUNNING) {
    throw new Error('ACTIONS_NOT_ALLOWED')
  }

  const { result, events, notifications, isDirty, extras } =
    services.Actions.apply(previousResult.facts, {
      type: args.actionType,
      payload: {
        playerArgs: args.facts,
        segmentFacts: previousResult.segment?.facts,
        periodFacts: previousResult.period.facts,
      },
    })

  EventService.publishUserNotification(ctx, notifications)

  await EventService.receiveEvents({
    events,
    ctx: {
      user: ctx.user,
      args,
      achievements: previousResult.player.achievementKeys,
      experience: previousResult.player.experience,
      currentLevelIx: previousResult.player.levelIx,
    },
    prisma: ctx.prisma,
  })

  if (!isDirty) {
    return previousResult
  }

  const [updatedResult, _] = await ctx.prisma.$transaction([
    ctx.prisma.playerResult.update({
      where: {
        periodIx_segmentIx_playerId_type,
      },
      data: {
        facts: result,
      },
      include: {
        period: true,
      },
    }),
    ctx.prisma.playerAction.create({
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
    }),
  ])

  return updatedResult
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
            include: {
              learningElements: true,
              storyElements: true,
            },
          },
        },
      },
      periods: {
        include: {
          segments: {
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

  const previousResults = ctx.prisma.playerResult.findMany({
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
        periodIx: currentGame.activePeriodIx,
        segmentIx: currentGame.activePeriod.activeSegmentIx,
        playerId: args.playerId,
        type: DB.PlayerResultType.SEGMENT_END,
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

  const transactions = ctx.prisma.playerAction.findMany({
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
      level: true,
      achievements: {
        include: {
          achievement: true,
        },
      },
    },
  })
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
            select: {
              activePeriodIx: true,
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
  return ctx.prisma.player.update({
    where: {
      id: ctx.user.sub,
    },
    data: {
      isReady: args.isReady,
    },
  })
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

  if (!currentGame?.activePeriod?.activeSegment) return null

  await ctx.prisma.periodSegment.update({
    where: {
      id: currentGame.activePeriod.activeSegment.id,
    },
    data: {
      countdownExpiresAt: new Date(Date.now() + args.seconds * 1000),
    },
  })

  return true
}
