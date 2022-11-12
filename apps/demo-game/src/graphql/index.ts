import {
  generateBaseMutations,
  generateBaseQueries,
  generateBaseSubscriptions,
} from '@gbl-uzh/platform/dist/nexus'
import * as reducers from '../reducers'

export * from '@gbl-uzh/platform/dist/nexus'
export * from './types'

export const Query = generateBaseQueries()
export const Mutation = generateBaseMutations({
  roleAssigner: (ix) => null,
  reducers,
})
export const Subscription = generateBaseSubscriptions()
