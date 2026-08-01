import * as DB from '@prisma/client'

import { enumType, objectType } from 'nexus'
import { LearningElement } from './LearningElement.js'
import { Player, PlayerAction, PlayerResult } from './Player.js'
import { StoryElement } from './StoryElement.js'

export const GameStatus = enumType({
  name: 'GameStatus',
  members: Object.values(DB.GameStatus),
})

export interface GenerateBaseGameOpts {
  resolveNextAutoContinueAt?: (
    parent: any,
    args: any,
    ctx: any,
    info: any
  ) => Date | null | Promise<Date | null>
}

/**
 * Factory that returns the base `Game` objectType with an optional
 * custom resolver for `nextAutoContinueAt`. Games that don't need the
 * field get a default `() => null` resolver.
 */
export function generateBaseGame(opts?: GenerateBaseGameOpts) {
  return objectType({
    name: 'Game',
    definition(t) {
      t.nonNull.id('id')

      t.nonNull.field('status', {
        type: GameStatus,
      })
      t.nonNull.string('name')
      t.nonNull.int('version')
      t.int('activePeriodIx')
      t.field('activePeriod', {
        type: Period,
      })

      t.int('activeSegmentIx')

      t.nonNull.int('playerCount', {
        async resolve(game, _args, ctx) {
          if (typeof game._count?.players === 'number') {
            return game._count.players
          }

          if (Array.isArray(game.players)) {
            return game.players.length
          }

          return ctx.prisma.player.count({
            where: { gameId: game.id },
          })
        },
      })

      t.nonNull.list.nonNull.field('players', {
        type: Player,
      })
      t.nonNull.list.nonNull.field('periods', {
        type: Period,
      })

      t.nonNull.field('facts', {
        type: 'JSONObject',
      })

      t.nullable.field('nextAutoContinueAt', {
        type: 'DateTime',
        resolve: opts?.resolveNextAutoContinueAt ?? (() => null),
      })
    },
  })
}

export const Game = generateBaseGame()

export const Period = objectType({
  name: 'Period',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.int('index')
    t.int('activeSegmentIx')
    t.field('activeSegment', {
      type: PeriodSegment,
    })

    t.nonNull.list.nonNull.field('actions', {
      type: PlayerAction,
    })
    t.nonNull.list.nonNull.field('results', {
      type: PlayerResult,
    })
    t.nonNull.list.nonNull.field('segments', {
      type: PeriodSegment,
    })

    t.nonNull.field('facts', {
      type: 'JSONObject',
    })
    t.int('segmentCount')
  },
})

export const PeriodSegment = objectType({
  name: 'PeriodSegment',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.int('index')
    t.nonNull.int('periodIx')

    t.field('countdownExpiresAt', {
      type: 'DateTime',
    })

    t.int('countdownDurationMs')

    t.nonNull.list.nonNull.field('actions', {
      type: PlayerAction,
    })
    t.nonNull.list.nonNull.field('results', {
      type: PlayerResult,
    })
    t.nonNull.list.nonNull.field('learningElements', {
      type: LearningElement,
    })
    t.nonNull.list.nonNull.field('storyElements', {
      type: StoryElement,
    })

    t.nonNull.field('facts', {
      type: 'JSONObject',
    })
  },
})
