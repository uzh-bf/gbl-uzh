import {
  DateTimeResolver,
  JSONObjectResolver,
  JSONResolver,
} from 'graphql-scalars'
import { asNexusMethod, enumType, objectType } from 'nexus'
import * as DB from './generated/prisma/client.js'

/**
 * @deprecated This module is retained only for published GraphQL compatibility.
 * New games compose createPlatformRouter and host /api/trpc instead.
 */

export const JsonScalar = asNexusMethod(JSONObjectResolver, 'json')
export const JsonValueScalar = asNexusMethod(JSONResolver, 'jsonValue')
export const DateScalar = asNexusMethod(DateTimeResolver, 'date')

export const UserRole = enumType({
  name: 'UserRole',
  members: Object.values(DB.UserRole),
})

export const Event = objectType({
  name: 'Event',
  definition(t) {
    t.string('type')
    t.string('sub')
    t.field('facts', { type: 'JSONObject' })
  },
})

export * from './types/Game.js'
export * from './types/LearningElement.js'
export * from './types/Mutation.js'
export * from './types/Player.js'
export * from './types/Query.js'
export * from './types/Subscription.js'
