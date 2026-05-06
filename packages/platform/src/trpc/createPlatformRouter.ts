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

type RouterDeps = {
  services?: PlatformRouterServices
  schemas?: {
    GameFactsSchema?: unknown
    PeriodFactsSchema?: unknown
    PeriodSegmentFactsSchema?: unknown
    PlayerFactsSchema?: unknown
  }
  roleAssigner?: PlatformRoleAssigner
  extensions?: Record<string, unknown>
}

export function createPlatformRouter({
  services = {},
  schemas = {},
  roleAssigner,
  extensions = {},
}: RouterDeps = {}) {
  return createTRPCRouter({
    auth: createAuthRouter(),
    game: createGameRouter({ services, schemas, roleAssigner }),
    period: createPeriodRouter({ services, schemas }),
    segment: createSegmentRouter({ services, schemas }),
    play: createPlayRouter({ schemas }),
    learning: createLearningRouter(),
    events: createEventsRouter(),
    story: createStoryRouter(),
    results: createResultsRouter(),
    ...extensions,
  })
}
