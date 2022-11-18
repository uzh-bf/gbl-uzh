import {
  generateBaseMutations,
  generateBaseQueries,
  generateBaseSubscriptions,
} from '@gbl-uzh/platform/dist/nexus'
import * as reducers from '../reducers'
import { PeriodFactsSchema, PeriodSegmentFactsSchema, PeriodFactsInput, PeriodSegmentFactsInput } from './types'
import type {PeriodFacts, PeriodSegmentFacts} from './types'

export * from '@gbl-uzh/platform/dist/nexus'
export * from './types'

export const Query = generateBaseQueries()
export const Mutation = generateBaseMutations<PeriodFacts, PeriodSegmentFacts>({
  roleAssigner: (ix) => null,
  reducers,
  schemas: {
    PeriodFactsSchema,
    PeriodSegmentFactsSchema
  },
  inputTypes: {
    PeriodFactsInput,
    PeriodSegmentFactsInput 
  }
})
export const Subscription = generateBaseSubscriptions()
