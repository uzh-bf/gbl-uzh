import { adminProcedure, createTRPCRouter } from '../init.js'
import { gameIdSchema, jsonObjectSchema } from '../schemas.js'
import * as GameService from '../../services/GameService.js'
import { throwAsTRPCError } from '../errors.js'
import { z } from 'zod'

type RouterDeps = {
  services?: Record<string, unknown>
  schemas?: {
    PeriodFactsSchema?: any
  }
}

type PeriodElementRef = {
  id: string
  title: string
}

function toStoryElementRef(raw: unknown): PeriodElementRef | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as { id?: unknown; title?: unknown }
  if (typeof item.id !== 'string' || typeof item.title !== 'string') return null
  return { id: item.id, title: item.title }
}

type PeriodDto = {
  id: number
  index: number
  activeSegmentIx: number | null
  facts: unknown
  segments: {
    id: number
    index: number
    countdownExpiresAt: string | Date | null
    countdownDurationMs: number | null
    facts: unknown
    learningElements: PeriodElementRef[]
    storyElements: PeriodElementRef[]
  }[]
  segmentCount: number | null
}

function toPeriodDto(period: {
  id?: number
  index?: number
  activeSegmentIx?: number | null
  facts?: unknown
  segmentCount?: number | null
  segments?: unknown
} | null): PeriodDto | null {
  if (!period || typeof period.id !== 'number') return null

    return {
    id: period.id,
    index: period.index ?? 0,
    activeSegmentIx:
      period.activeSegmentIx === null ? null : period.activeSegmentIx ?? null,
    facts: period.facts,
    segments: Array.isArray(period.segments)
      ? period.segments.map((segment: any) => ({
          id: segment.id,
          index: segment.index ?? 0,
          countdownExpiresAt: segment.countdownExpiresAt ?? null,
          countdownDurationMs: segment.countdownDurationMs ?? null,
          facts: segment.facts,
          learningElements: Array.isArray(segment.learningElements)
            ? segment.learningElements
                .map((item: any) => toStoryElementRef(item))
                .filter(
                  (item): item is PeriodElementRef => item !== null
                )
            : [],
          storyElements: Array.isArray(segment.storyElements)
            ? segment.storyElements
                .map((item: any) => toStoryElementRef(item))
                .filter((item): item is PeriodElementRef => item !== null)
            : [],
        }))
      : [],
    segmentCount:
      period.segmentCount === null || period.segmentCount === undefined
        ? null
        : period.segmentCount,
  }
}

export function createPeriodRouter({
  services = {},
  schemas = {},
}: RouterDeps = {}) {
  const addInput = z.object({
    gameId: gameIdSchema,
    facts: jsonObjectSchema,
    segmentCount: z.number().int().positive(),
  })

  return createTRPCRouter({
    add: adminProcedure.input(addInput).mutation(async ({ input, ctx }) => {
      try {
        const period = await GameService.addGamePeriod(
          input as any,
          ctx as any,
          {
            schema: schemas.PeriodFactsSchema,
            services: services as any,
          }
        )

        return toPeriodDto(period as any)
      } catch (error) {
        throwAsTRPCError(error)
      }
    }),
  })
}
