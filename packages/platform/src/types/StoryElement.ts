import * as DB from '@prisma/client'

import { enumType, objectType } from 'nexus'

export const StoryElementType = enumType({
  name: 'StoryElementType',
  members: Object.values(DB.StoryElementType),
})

export const StoryElement = objectType({
  name: 'StoryElement',
  definition(t) {
    t.nonNull.id('id')

    t.nonNull.field('type', {
      type: StoryElementType,
    })
    t.nonNull.string('title')

    t.string('content')
    t.field('contentRole', {
      type: 'JSONObject',
    })

    t.field('reward', {
      type: 'JSONObject',
    })
  },
})
