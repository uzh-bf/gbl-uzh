import { createPlatformRouter } from '@gbl-uzh/platform'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import {
  GameFactsSchema,
  PeriodFactsSchema,
  PeriodSegmentFactsSchema,
  PlayerFactsSchema,
  RateDecisionSchema,
} from '../../types'

import * as services from '../../services'

export const appRouter = createPlatformRouter({
  services,
  schemas: {
    ActionFactsSchema: RateDecisionSchema,
    GameFactsSchema,
    PeriodFactsSchema,
    PeriodSegmentFactsSchema,
    PlayerFactsSchema,
  },
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
