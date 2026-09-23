import type { TRPCCreateRouterOptions } from '@trpc/server'
import { createTRPCRouter } from './init.js'
import { createAuthRouter } from './routers/auth.js'
import { createGameRouter } from './routers/game.js'
import { createLearningRouter } from './routers/learning.js'
import { createPeriodRouter } from './routers/period.js'
import { createPlayRouter } from './routers/play.js'
import { createEventsRouter } from './routers/events.js'
import { createResultsRouter } from './routers/results.js'
import { createSegmentRouter } from './routers/segment.js'
import { createStoryRouter } from './routers/story.js'

export type PlatformRouterServices = Record<string, unknown>
export type PlatformRouterSchemas = Record<string, unknown>

type PlatformRoleAssigner = (ix: number, facts: unknown) => unknown

type RouterDeps<TExtensions extends TRPCCreateRouterOptions> = {
  services?: PlatformRouterServices
  schemas?: {
    ActionFactsSchema?: unknown
    GameFactsSchema?: unknown
    PeriodFactsSchema?: unknown
    PeriodSegmentFactsSchema?: unknown
    PlayerFactsSchema?: unknown
  }
  roleAssigner?: PlatformRoleAssigner
  // Game-specific routers merged at the top level. Kept generic so their
  // procedures stay part of the game's AppRouter type.
  extensions?: TExtensions
}

export function createPlatformRouter<
  TExtensions extends TRPCCreateRouterOptions = Record<never, never>,
>({
  services = {},
  schemas = {},
  roleAssigner,
  extensions = {} as TExtensions,
}: RouterDeps<TExtensions> = {}) {
  return createTRPCRouter({
    auth: createAuthRouter(),
    game: createGameRouter({ services, schemas, roleAssigner }),
    period: createPeriodRouter({ services, schemas }),
    segment: createSegmentRouter({ services, schemas }),
    play: createPlayRouter({ services, schemas }),
    learning: createLearningRouter(),
    events: createEventsRouter(),
    story: createStoryRouter(),
    results: createResultsRouter(),
    ...extensions,
  })
}
