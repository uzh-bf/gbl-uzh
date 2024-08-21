import {
  generateBaseMutations,
  generateBaseQueries,
  generateBaseSubscriptions,
} from '@gbl-uzh/platform/dist/nexus'
import type { PeriodFacts, PeriodSegmentFacts } from '../../src/types/Period'
import * as services from '../services'
import {
  PeriodFactsInput,
  PeriodFactsSchema,
  PeriodSegmentFactsInput,
  PeriodSegmentFactsSchema,
  PlayerFacts,
  PlayerFactsSchema,
} from '../types'
export * from '@gbl-uzh/platform/dist/nexus'
export * from '../types'

export const Query = generateBaseQueries()
export const Mutation = generateBaseMutations<
  PeriodFacts,
  PeriodSegmentFacts,
  PlayerFacts
>({
  services,
  schemas: {
    PeriodFactsSchema,
    PeriodSegmentFactsSchema,
    PlayerFactsSchema,
  },
  inputTypes: {
    PeriodFactsInput,
    PeriodSegmentFactsInput,
  },
})
export const Subscription = generateBaseSubscriptions()
