import { objectType } from 'nexus'
import { Player } from './Player'

export const LearningAnswerOption = objectType({
  name: 'LearningAnswerOption',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.string('content')
    t.nonNull.boolean('correct')
  },
})

export const LearningElementState = objectType({
  name: 'LearningElementState',
  definition(t) {
    t.id('id')

    t.field('element', {
      type: LearningElement,
    })

    t.string('state')

    t.string('solution')
  },
})

export const LearningElementAttempt = objectType({
  name: 'LearningElementAttempt',
  definition(t) {
    t.id('id')

    t.int('pointsAchieved')
    t.int('pointsMax')

    t.field('element', {
      type: LearningElement,
    })

    t.field('player', {
      type: Player,
    })
  },
})

export const LearningElement = objectType({
  name: 'LearningElement',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.string('title')
    t.nonNull.string('question')
    t.field('reward', {
      type: 'JSONObject',
    })
    t.string('motivation')

    t.nonNull.list.nonNull.field('options', {
      type: LearningAnswerOption,
    })
    t.string('feedback')
  },
})
