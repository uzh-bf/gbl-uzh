import { enumType, objectType } from 'nexus'
import * as DB from '../generated/prisma/client.js'

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
    t.field('namesByRole', {
      type: 'JSONObject',
    })
    t.nonNull.string('description')
    t.field('descriptionsByRole', {
      type: 'JSONObject',
    })
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

    t.field('conditions', {
      type: 'JSON',
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
