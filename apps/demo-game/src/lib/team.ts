import type { ResultQuery } from '../graphql/generated/ops'
import { FIRST_GAME_YEAR } from './constants'
import { buildHistory } from './results'

type Game = NonNullable<NonNullable<ResultQuery['result']>['currentGame']>
export type TeamStory =
  Game['periods'][number]['segments'][number]['storyElements'][number]
export type StorySequence = {
  id: string
  year: number
  quarter: number
  stories: TeamStory[]
}
export type StoryEntry = {
  story: TeamStory
  sequence: StorySequence
  index: number
}

export const sortStories = (stories: readonly TeamStory[]) =>
  [...stories].sort((a, b) => a.title.localeCompare(b.title))

export function storyLibrary(data: ResultQuery): StoryEntry[] {
  const game = data.result?.currentGame
  if (!game) return []
  const ended = new Set(
    (data.result?.previousResults ?? [])
      .filter((row) => row.type === 'PERIOD_END')
      .map((row) => row.period.id)
  )
  const seen = new Set<string>()
  const entries: StoryEntry[] = []
  for (const period of [...game.periods].sort((a, b) => a.index - b.index)) {
    const releasedThrough =
      period.id === game.activePeriod?.id
        ? game.activePeriod.activeSegmentIx
        : period.activeSegmentIx
    for (const segment of [...period.segments].sort(
      (a, b) => a.index - b.index
    )) {
      if (!ended.has(period.id) && segment.index > (releasedThrough ?? -1))
        continue
      const sequence: StorySequence = {
        id: segment.id,
        year: FIRST_GAME_YEAR + period.index,
        quarter: segment.index + 1,
        stories: sortStories(segment.storyElements),
      }
      sequence.stories.forEach((story, index) => {
        if (seen.has(story.id)) return
        seen.add(story.id)
        entries.push({ story, sequence, index })
      })
    }
  }
  return entries.sort(
    (a, b) =>
      b.sequence.year - a.sequence.year ||
      b.sequence.quarter - a.sequence.quarter ||
      a.story.title.localeCompare(b.story.title)
  )
}

export function teamStatistics(data: ResultQuery) {
  const history = buildHistory(data)
  const last = history.quarters.at(-1)
  const start =
    last?.value != null && last.gain != null ? last.value - last.gain : null
  const rate = start !== null && start > 0 ? last.gain / start : null
  return {
    value: history.value,
    lastQuarter: Number.isFinite(rate) ? rate : null,
  }
}

export function learningXP(reward: unknown): number | null {
  const xp =
    reward && typeof reward === 'object' && 'xp' in reward ? reward.xp : null
  return typeof xp === 'number' && Number.isFinite(xp) && xp >= 0 ? xp : null
}
