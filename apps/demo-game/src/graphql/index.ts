import {
  generateBaseMutations,
  generateBaseQueries,
  generateBaseSubscriptions,
} from '@gbl-uzh/platform/dist/nexus'
import type { GameFacts } from '../../src/types/Game'
import type { PeriodFacts, PeriodSegmentFacts } from '../../src/types/Period'
import * as services from '../services'
import {
  GameFactsInput,
  GameFactsSchema,
  PeriodFactsInput,
  PeriodFactsSchema,
  PeriodSegmentFactsInput,
  PeriodSegmentFactsSchema,
  PlayerFacts,
  PlayerFactsSchema,
} from '../types'
export * from '@gbl-uzh/platform/dist/nexus'

export const Query = generateBaseQueries()
export const Mutation = generateBaseMutations<
  GameFacts,
  PeriodFacts,
  PeriodSegmentFacts,
  PlayerFacts
>({
  services,
  schemas: {
    GameFactsSchema,
    PeriodFactsSchema,
    PeriodSegmentFactsSchema,
    PlayerFactsSchema,
  },
  inputTypes: {
    GameFactsInput,
    PeriodFactsInput,
    PeriodSegmentFactsInput,
  },
})
export const Subscription = generateBaseSubscriptions()
