import { UserRole } from '@gbl-uzh/platform'
import {
  generateBaseMutations,
  generateBaseQueries,
  generateBaseSubscriptions,
} from '@gbl-uzh/platform/dist/nexus'
import * as reducers from '../reducers'
import type { PeriodFacts, PeriodSegmentFacts } from './types'
import {
  PeriodFactsInput,
  PeriodFactsSchema,
  PeriodSegmentFactsInput,
  PeriodSegmentFactsSchema,
} from './types'
export * from '@gbl-uzh/platform/dist/nexus'
export * from './types'

export const Query = generateBaseQueries()
export const Mutation = generateBaseMutations<PeriodFacts, PeriodSegmentFacts>({
  roleAssigner: (ix) => UserRole.PLAYER,
  reducers,
  schemas: {
    PeriodFactsSchema,
    PeriodSegmentFactsSchema,
  },
  inputTypes: {
    PeriodFactsInput,
    PeriodSegmentFactsInput,
  },
})
export const Subscription = generateBaseSubscriptions()
