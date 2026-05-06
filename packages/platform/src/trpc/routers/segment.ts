import { adminProcedure, createTRPCRouter } from '../init.js'
import { gameIdSchema, idSchema, jsonObjectSchema } from '../schemas.js'
import * as GameService from '../../services/GameService.js'
import { throwAsTRPCError } from '../errors.js'
import { z } from 'zod'

type RouterDeps = {
  services?: Record<string, unknown>
  schemas?: {
    PeriodSegmentFactsSchema?: any
  }
}

type SegmentElementRef = {
  id: string
  title: string
}

function toStoryElementRef(raw: unknown): SegmentElementRef | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as { id?: unknown; title?: unknown }
  if (typeof item.id !== 'string' || typeof item.title !== 'string') return null
  return { id: item.id, title: item.title }
}

type SegmentDto = {
  id: number
  index: number
  countdownExpiresAt: string | Date | null
  countdownDurationMs: number | null
  facts: unknown
  learningElements: SegmentElementRef[]
  storyElements: SegmentElementRef[]
}

function toSegmentDto(
  segment:
    | {
        id?: number
        index?: number
        countdownExpiresAt?: string | Date | null
        countdownDurationMs?: number | null
        facts?: unknown
        learningElements?: unknown
        storyElements?: unknown
      }
    | null
    | undefined
): SegmentDto | null {
  if (!segment || typeof segment.id !== 'number') return null

  return {
    id: segment.id,
    index: segment.index ?? 0,
    countdownExpiresAt: segment.countdownExpiresAt ?? null,
    countdownDurationMs: segment.countdownDurationMs ?? null,
    facts: segment.facts,
    learningElements: Array.isArray(segment.learningElements)
      ? segment.learningElements
          .map((item) => toStoryElementRef(item))
          .filter((item): item is SegmentElementRef => item !== null)
      : [],
    storyElements: Array.isArray(segment.storyElements)
      ? segment.storyElements
          .map((item) => toStoryElementRef(item))
          .filter((item): item is SegmentElementRef => item !== null)
      : [],
  }
}

export function createSegmentRouter({
  services = {},
  schemas = {},
}: RouterDeps = {}) {
  const addInput = z.object({
    gameId: gameIdSchema,
    periodIx: z.number().int().nonnegative(),
    facts: jsonObjectSchema,
    learningElements: z.array(idSchema).optional(),
    storyElements: z.array(idSchema).optional(),
  })

  return createTRPCRouter({
    add: adminProcedure.input(addInput).mutation(async ({ input, ctx }) => {
      try {
        const segment = await GameService.addPeriodSegment(
          {
            gameId: input.gameId,
            periodIx: input.periodIx,
            facts: input.facts,
            learningElements: input.learningElements,
            storyElements: input.storyElements,
          } as Parameters<typeof GameService.addPeriodSegment>[0],
          ctx as any,
          {
            schema: schemas.PeriodSegmentFactsSchema,
            services: services as any,
          } as any
        )

        const mappedSegment = toSegmentDto(segment as any)
        return mappedSegment
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),
  })
}
