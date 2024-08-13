import * as DB from '@prisma/client'
import { DateTimeResolver, JSONObjectResolver } from 'graphql-scalars'
import { asNexusMethod, enumType, objectType } from 'nexus'

export const JsonScalar = asNexusMethod(JSONObjectResolver, 'json')
export const DateScalar = asNexusMethod(DateTimeResolver, 'date')

export const UserRole = enumType({
  name: 'UserRole',
  members: Object.values(DB.UserRole),
})

export const Event = objectType({
  name: 'Event',
  definition(t) {
    t.string('type')
  },
})

export * from './types/Game.js'
export * from './types/LearningElement.js'
export * from './types/Mutation.js'
export * from './types/Player.js'
export * from './types/Query.js'
export * from './types/Subscription.js'
