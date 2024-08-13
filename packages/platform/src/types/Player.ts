import * as DB from '@prisma/client'

import { enumType, objectType } from 'nexus'
import { AchievementInstance } from './Achievement.js'
import { Game, Period, PeriodSegment } from './Game.js'
import { LearningElement } from './LearningElement.js'
import { StoryElement } from './StoryElement.js'

export const PlayerDecisionType = enumType({
  name: 'PlayerDecisionType',
  members: Object.values(DB.PlayerDecisionType),
})

export const PlayerResultType = enumType({
  name: 'PlayerResultType',
  members: Object.values(DB.PlayerResultType),
})

export const PlayerLevel = objectType({
  name: 'PlayerLevel',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.int('index')
    t.nonNull.string('description')
    t.nonNull.int('requiredXP')
  },
})

export const PlayerState = objectType({
  name: 'PlayerState',
  definition(t) {
    t.field('playerResult', {
      type: PlayerResult,
    })
    t.field('currentGame', {
      type: Game,
    })
    t.list.nonNull.field('previousResults', {
      type: PlayerResult,
    })
    t.list.nonNull.field('transactions', {
      type: PlayerAction,
    })
  },
})

export const Player = objectType({
  name: 'Player',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.boolean('isReady')

    t.nonNull.int('number')
    t.nonNull.string('name')
    t.nonNull.string('avatar')
    t.nonNull.string('location')
    t.nonNull.string('color')
    t.nonNull.string('token')
    t.nonNull.boolean('tutorialCompleted')
    t.string('role')
    t.nonNull.int('experience')
    t.nonNull.int('experienceToNext')

    t.nonNull.field('facts', {
      type: 'JSONObject',
    })

    t.nonNull.field('level', {
      type: PlayerLevel,
    })
    t.nonNull.int('levelIx')

    t.nonNull.list.nonNull.string('achievementKeys')
    t.nonNull.list.nonNull.string('achievementIds')
    t.nonNull.list.nonNull.field('achievements', {
      type: AchievementInstance,
    })

    t.nonNull.list.nonNull.field('completedLearningElements', {
      type: LearningElement,
    })
    t.nonNull.list.nonNull.string('completedLearningElementIds')

    t.nonNull.list.nonNull.field('visitedStoryElements', {
      type: StoryElement,
    })
    t.nonNull.list.nonNull.string('visitedStoryElementIds')
  },
})

export const PlayerResult = objectType({
  name: 'PlayerResult',
  definition(t) {
    t.nonNull.id('id')

    t.field('type', {
      type: PlayerResultType,
    })
    t.field('facts', {
      type: 'JSONObject',
    })

    t.nonNull.field('player', {
      type: Player,
    })
    t.nonNull.field('period', {
      type: Period,
    })
    t.field('segment', {
      type: PeriodSegment,
    })
  },
})

export const PlayerAction = objectType({
  name: 'PlayerAction',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.string('type')
    t.field('facts', {
      type: 'JSONObject',
    })

    t.nonNull.field('player', {
      type: Player,
    })

    t.nonNull.field('period', {
      type: Period,
    })
    t.nonNull.int('periodIx')

    t.field('segment', {
      type: PeriodSegment,
    })
    t.int('segmentIx')
  },
})

export const PlayerDecision = objectType({
  name: 'PlayerDecision',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.field('player', {
      type: Player,
    })
    t.nonNull.field('period', {
      type: Period,
    })
    t.nonNull.int('periodIx')

    t.nonNull.field('type', {
      type: PlayerDecisionType,
    })
    t.nonNull.field('facts', {
      type: 'JSONObject',
    })
  },
})
