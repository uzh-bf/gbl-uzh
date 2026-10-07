import { createPlatformRouter } from '@gbl-uzh/platform'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { allocationSchema } from '../../lib/allocation'
import { redactUnrevealedRolls } from '../../lib/market'
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
  // Players must not receive dice or returns before the admin reveals them.
  playerFacts: { segment: redactUnrevealedRolls },
  extensions: {
    market: marketRouter,
  },
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
