import { catalogs, type Language } from './catalogs'
import { lessons, levels, stories } from './originalContent'

type Field =
  | 'title'
  | 'content'
  | 'question'
  | 'option'
  | 'feedback'
  | 'motivation'
  | 'description'

/** Only translate a seeded field while its database text still matches the original. */
export function contentText(
  language: Language,
  kind: 'story' | 'lesson' | 'level',
  id: string | number,
  field: Field,
  original: string
): string {
  const catalog = catalogs[language].content
  if (kind === 'level') {
    const level = levels.find((record) => record.index === id)
    return level && field === 'description' && level.description === original
      ? (catalog.levels[`level${level.index}`] ?? original)
      : original
  }
  if (kind === 'story') {
    if (
      (field !== 'title' && field !== 'content') ||
      !Object.hasOwn(stories, id)
    )
      return original
    const storyId = id as keyof typeof stories
    return stories[storyId][field] === original
      ? catalog.stories[storyId][field]
      : original
  }
  const lesson = lessons.find((record) => record.id === id)
  if (!lesson) return original
  const translated = catalog.lessons[lesson.id]
  if (field === 'option') {
    const index = lesson.options.indexOf(original)
    return translated?.options[`choice${index + 1}`] ?? original
  }
  if (
    field === 'description' ||
    field === 'content' ||
    lesson[field] !== original
  )
    return original
  return translated?.[field] ?? original
}
