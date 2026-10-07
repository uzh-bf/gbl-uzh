import * as DB from '../../generated/prisma/client.js'
import { z } from 'zod'

export const storyElementDtoSchema = z
  .object({
    id: z.string(),
    type: z.nativeEnum(DB.StoryElementType),
    title: z.string(),
    content: z.string().nullable(),
    contentRole: z.unknown(),
  })
  .strict()

export type StoryElementDto = z.infer<typeof storyElementDtoSchema>

export const questAchievementDtoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    namesByRole: z.unknown(),
    description: z.string(),
    descriptionsByRole: z.unknown(),
    image: z.string().nullable(),
    when: z.nativeEnum(DB.AchievementFrequency),
    scope: z.nativeEnum(DB.AchievementScope),
    activePeriods: z.array(z.number().int()),
    reward: z.unknown(),
  })
  .strict()

export type QuestAchievementDto = z.infer<typeof questAchievementDtoSchema>

function hasEnumValue<T extends Record<string, string>>(
  values: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(values).includes(value as T[keyof T])
}

export function toStoryElementDto(
  source: Record<string, unknown> | null | undefined
): StoryElementDto | null {
  if (!source) return null

  const id = source.id
  const type = source.type
  const title = source.title

  if (
    typeof id !== 'string' ||
    !hasEnumValue(DB.StoryElementType, type) ||
    typeof title !== 'string'
  ) {
    return null
  }

  return {
    id,
    type,
    title,
    content: typeof source.content === 'string' ? source.content : null,
    contentRole: source.contentRole ?? null,
  }
}

export function toQuestAchievementDto(
  source: Record<string, unknown> | null | undefined
): QuestAchievementDto | null {
  if (!source) return null

  const id = source.id
  const name = source.name
  const description = source.description
  const when = source.when
  const scope = source.scope
  const activePeriods = source.activePeriods

  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof description !== 'string' ||
    !hasEnumValue(DB.AchievementFrequency, when) ||
    !hasEnumValue(DB.AchievementScope, scope) ||
    !Array.isArray(activePeriods) ||
    !activePeriods.every(
      (period): period is number =>
        typeof period === 'number' && Number.isInteger(period)
    )
  ) {
    return null
  }

  return {
    id,
    name,
    namesByRole: source.namesByRole ?? null,
    description,
    descriptionsByRole: source.descriptionsByRole ?? null,
    image: typeof source.image === 'string' ? source.image : null,
    when,
    scope,
    activePeriods,
    reward: source.reward ?? null,
  }
}
