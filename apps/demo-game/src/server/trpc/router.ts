import { createPlatformRouter } from '@gbl-uzh/platform'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { allocationSchema } from '../../lib/allocation'
import {
  GameFactsSchema,
  PeriodFactsSchema,
  PeriodSegmentFactsSchema,
  PlayerFactsSchema,
} from '../../types'

import * as services from '../../services'
import { marketRouter } from './market'

export const appRouter = createPlatformRouter({
  services,
  schemas: {
    // Validates the performAction payload at the tRPC boundary so bad player
    // input fails as BAD_REQUEST before it reaches the ActionsReducer.
    ActionFactsSchema: allocationSchema,
    GameFactsSchema,
    PeriodFactsSchema,
    PeriodSegmentFactsSchema,
    PlayerFactsSchema,
  },
  extensions: {
    market: marketRouter,
  },
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
