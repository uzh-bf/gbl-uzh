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

export * from '../../../apps/demo-game/src/graphql/types/Period'
export * from './types/Game'
export * from './types/LearningElement'
export * from './types/Mutation'
export * from './types/Player'
export * from './types/Query'
export * from './types/Subscription'
