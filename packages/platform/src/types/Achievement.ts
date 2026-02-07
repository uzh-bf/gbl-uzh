import * as DB from '@prisma/client'
import { enumType, objectType } from 'nexus'

export const AchievementFrequency = enumType({
  name: 'AchievementFrequency',
  members: Object.values(DB.AchievementFrequency),
})

export const AchievementScope = enumType({
  name: 'AchievementScope',
  members: Object.values(DB.AchievementScope),
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

    t.nonNull.field('scope', {
      type: AchievementScope,
    })

    t.nonNull.list.nonNull.int('activePeriods')

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
    t.nonNull.int('periodIx')
    t.nonNull.field('achievement', {
      type: Achievement,
    })
  },
})
