import { cn } from '@gbl-uzh/ui'
import { BookOpen, ChevronRight, Lightbulb } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import type { ResultQuery } from '~/graphql/generated/ops'
import { playerAmount, playerPercent } from '~/lib/results'
import { learningXP, teamStatistics, type StoryEntry } from '~/lib/team'

type Activity = { id: string; title: string; reward?: unknown }

export default function TeamPanel({
  data,
  stories,
  openActivities,
  completedActivities,
  openedIds,
  onLearning,
  onStory,
}: {
  data: ResultQuery
  stories: StoryEntry[]
  openActivities: readonly Activity[]
  completedActivities: readonly Activity[]
  openedIds: ReadonlySet<string>
  onLearning: (id: string) => void
  onStory: (entry: StoryEntry) => void
}) {
  const self = data.self
  const stats = teamStatistics(data)
  const completedIds = new Set(
    completedActivities.map((activity) => activity.id)
  )
  const visited = new Set(self?.visitedStoryElementIds ?? [])
  const experience = Math.max(0, self?.experience ?? 0)
  const threshold = self?.experienceToNext ?? 0
  const progress =
    threshold > 0 ? Math.min(100, (experience / threshold) * 100) : 0
  return (
    <section data-cy="team-panel">
      <div className="border-player-border mobile:px-app-4 mobile:py-app-4 border-b min-[601px]:px-[32px] min-[601px]:py-[28px]">
        <div className="mobile:mb-app-4 mobile:gap-app-2 mobile:app-body mb-[16px] flex flex-wrap justify-between gap-[8px] min-[601px]:text-[26px]">
          <span className="font-semibold">Level {self?.level?.index ?? 0}</span>
          <span className="text-player-muted">
            {experience} / {threshold > 0 ? threshold : '—'} XP
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Experience"
          aria-valuemin={0}
          aria-valuemax={threshold > 0 ? threshold : 100}
          aria-valuenow={threshold > 0 ? Math.min(experience, threshold) : 0}
          aria-valuetext={`${experience} XP${threshold > 0 ? ` of ${threshold}` : ''}`}
          className="bg-player-progress h-[12px] overflow-hidden rounded-[6px] min-[601px]:h-[16px]"
        >
          <div
            className="bg-player-primary h-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <dl className="border-player-border m-0 grid grid-cols-2 border-b">
        <Statistic
          title="Value"
          value={playerAmount(stats.value)}
          testId="team-value"
        />
        <Statistic
          title="Last quarter"
          value={playerPercent(stats.lastQuarter)}
          testId="team-last-quarter"
          color={
            stats.lastQuarter > 0
              ? 'text-player-success'
              : stats.lastQuarter < 0
                ? 'text-player-error'
                : undefined
          }
        />
      </dl>
      <SectionHeading title="Learning Activities" />
      <ul className="m-0 list-none p-0">
        {[...openActivities, ...completedActivities].map((activity) => {
          const completed = completedIds.has(activity.id)
          const state = completed
            ? 'Solved'
            : openedIds.has(activity.id)
              ? 'Open'
              : 'New'
          const xp = learningXP(activity.reward)
          return (
            <ContentRow
              key={activity.id}
              title={activity.title}
              description={`Quiz${xp !== null ? ` · ${xp} XP` : ''}`}
              state={state}
              onClick={() => onLearning(activity.id)}
              icon={<Lightbulb size={26} className="mobile:size-app-icon" />}
            />
          )
        })}
        {!openActivities.length && !completedActivities.length && (
          <Empty>No learning activities available yet.</Empty>
        )}
      </ul>
      <SectionHeading title="Story Elements" note="Read any time" />
      <ul className="m-0 list-none p-0">
        {stories.map((entry) => (
          <ContentRow
            key={entry.story.id}
            title={entry.story.title}
            description={`Card ${entry.index + 1} of ${entry.sequence.stories.length} · ${entry.sequence.year} · Q${entry.sequence.quarter}`}
            state={visited.has(entry.story.id) ? 'Read' : 'New'}
            onClick={() => onStory(entry)}
            icon={<BookOpen size={26} className="mobile:size-app-icon" />}
          />
        ))}
        {!stories.length && (
          <Empty>Stories will appear when a quarter begins.</Empty>
        )}
      </ul>
    </section>
  )
}

function Statistic({
  title,
  value,
  color,
  testId,
}: {
  title: string
  value: string
  color?: string
  testId: string
}) {
  return (
    <div className="border-player-border mobile:px-app-4 mobile:py-app-4 min-w-0 px-[16px] py-[20px] first:border-r min-[601px]:p-[32px]">
      <dt className="text-player-muted mobile:app-caption font-semibold tracking-[1px] uppercase min-[601px]:text-[22px]">
        {title}
      </dt>
      <dd
        data-cy={testId}
        className={cn(
          'mobile:mt-app-2 mobile:app-value m-0 mt-[8px] font-bold [overflow-wrap:anywhere] tabular-nums min-[601px]:text-[40px]',
          color
        )}
      >
        {value}
      </dd>
    </div>
  )
}
function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="border-player-border mobile:gap-app-2 mobile:px-app-4 mobile:pt-app-4 mobile:pb-app-4 flex flex-wrap items-center justify-between gap-[8px] border-b min-[601px]:px-[32px] min-[601px]:pt-[36px] min-[601px]:pb-[22px]">
      <h2 className="text-player-muted mobile:app-caption m-0 font-semibold tracking-[1px] uppercase min-[601px]:text-[24px]">
        {title}
      </h2>
      {note && (
        <span className="text-player-muted mobile:app-caption min-[601px]:text-[24px]">
          {note}
        </span>
      )}
    </div>
  )
}
function ContentRow({
  title,
  description,
  state,
  icon,
  onClick,
}: {
  title: string
  description: string
  state: string
  icon: ReactNode
  onClick: () => void
}) {
  const descriptionId = useId()
  const stateId = useId()
  return (
    <li className="border-player-border border-b last:border-b-0">
      <button
        type="button"
        aria-label={title}
        aria-describedby={`${descriptionId} ${stateId}`}
        onClick={onClick}
        className="focus-visible:outline-player-primary hover:bg-player-feedback mobile:gap-app-3 mobile:px-app-4 mobile:py-app-4 flex w-full items-center text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] min-[601px]:gap-[20px] min-[601px]:px-[32px] min-[601px]:py-[26px]"
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-[40px] shrink-0 place-items-center rounded-[12px] min-[601px]:size-[52px]',
            state === 'New'
              ? 'bg-player-warning-surface text-player-warning'
              : 'bg-player-progress text-player-primary'
          )}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="mobile:app-body block leading-[1.2] font-semibold [overflow-wrap:anywhere] min-[601px]:text-[28px]">
            {title}
          </span>
          <span
            id={descriptionId}
            className="text-player-muted mobile:mt-app-1 mobile:app-caption mt-[4px] block min-[601px]:text-[24px]"
          >
            {description}
          </span>
        </span>
        <span
          id={stateId}
          className="text-player-body mobile:app-caption font-semibold min-[601px]:text-[24px]"
        >
          {state}
        </span>
        <ChevronRight
          aria-hidden="true"
          className="text-player-muted size-[20px] shrink-0 min-[601px]:size-[26px]"
        />
      </button>
    </li>
  )
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <li className="text-player-muted mobile:px-app-4 mobile:py-app-4 mobile:app-body py-[24px] min-[601px]:px-[32px] min-[601px]:text-[24px]">
      {children}
    </li>
  )
}
