import { z } from 'zod'
import * as DB from '@prisma/client'

export const idSchema = z.string().trim().min(1)
export const gameIdSchema = z.number().int().positive()
export const optionalGameIdSchema = gameIdSchema.optional()
export const playerResultTypeSchema = z.nativeEnum(DB.PlayerResultType)

export type JsonRecord = Record<string, JsonValue>
export type JsonValue = string | number | boolean | null | JsonValue[] | JsonRecord

export const jsonObjectSchema: z.ZodType<JsonRecord> = z.lazy(() =>
  z.record(jsonValueSchema)
)
export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    jsonObjectSchema,
    z.array(jsonValueSchema),
  ])
)
