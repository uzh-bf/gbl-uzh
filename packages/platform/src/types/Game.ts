import * as DB from '@prisma/client'

import { enumType, objectType } from 'nexus'
import { LearningElement } from './LearningElement'
import { Player, PlayerAction, PlayerResult } from './Player'
import { StoryElement } from './StoryElement'

export const GameStatus = enumType({
  name: 'GameStatus',
  members: Object.values(DB.GameStatus),
})

export const Game = objectType({
  name: 'Game',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.field('status', {
      type: GameStatus,
    })
    t.nonNull.string('name')
    t.int('activePeriodIx')
    t.field('activePeriod', {
      type: Period,
    })

    t.nonNull.list.nonNull.field('players', {
      type: Player,
    })
    t.nonNull.list.nonNull.field('periods', {
      type: Period,
    })
  },
})

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
