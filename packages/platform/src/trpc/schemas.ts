import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import * as DB from '../generated/prisma/client.js'

// Game-specific yup facts schemas are injected through createPlatformRouter.
// The services validate against them unconditionally, so a missing schema is a
// router misconfiguration and must surface as such instead of a TypeError.
export function requireFactsSchema<T>(schema: T | undefined, name: string): T {
  if (!schema) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `createPlatformRouter: schemas.${name} is required for this procedure`,
    })
  }

  return schema
}

export const idSchema = z.string().trim().min(1)
export const gameIdSchema = z.number().int().positive()
export const optionalGameIdSchema = gameIdSchema.optional()
export const playerResultTypeSchema = z.nativeEnum(DB.PlayerResultType)

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | JsonRecord
export interface JsonRecord {
  [key: string]: JsonValue
}

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.record(jsonValueSchema),
    z.array(jsonValueSchema),
  ])
)
export const jsonObjectSchema: z.ZodType<JsonRecord> = z.record(jsonValueSchema)
