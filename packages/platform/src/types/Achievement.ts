import * as DB from '@prisma/client'
import { enumType, objectType } from 'nexus'

export const AchievementFrequency = enumType({
  name: 'AchievementFrequency',
  members: Object.values(DB.AchievementFrequency),
})

export const Achievement = objectType({
  name: 'Achievement',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.string('name')
    t.nonNull.string('description')
    t.string('image')

    t.nonNull.field('when', {
      type: AchievementFrequency,
    })

    t.field('reward', {
      type: 'JSONObject',
    })
  },
})

export const AchievementInstance = objectType({
  name: 'AchievementInstance',
  definition(t) {
    t.nonNull.int('id')

    t.nonNull.int('count')
    t.nonNull.field('achievement', {
      type: Achievement,
    })
  },
})
