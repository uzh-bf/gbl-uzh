import { createPlatformRouter } from '@gbl-uzh/platform'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import {
  GameFactsSchema,
  PeriodFactsSchema,
  PeriodSegmentFactsSchema,
  PlayerFactsSchema,
} from '../../types'

import * as services from '../../services'

export const appRouter = createPlatformRouter({
  services,
  schemas: {
    GameFactsSchema,
    PeriodFactsSchema,
    PeriodSegmentFactsSchema,
    PlayerFactsSchema,
  },
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
