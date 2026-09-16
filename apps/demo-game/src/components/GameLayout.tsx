import { useMutation, useSubscription } from '@apollo/client'
import {
  getCountdownNotification,
  LearningActivitiesList,
  LearningActivityModal,
  PlayerDisplay,
  shouldRefetchGameResult,
  StoryElements,
  useLearningActivities,
} from '@gbl-uzh/ui'
import { Button, Switch } from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef } from 'react'
import {
  AttemptLearningElementDocument,
  GlobalEventsDocument,
  LearningElementDocument,
  MarkStoryElementDocument,
  ResultDocument,
  type ResultQuery,
} from 'src/graphql/generated/ops'
import { avatarNames, cantonNames } from '~/lib/teamIdentity'
import styles from './cockpit/Cockpit.module.css'
import CompactCountdown from './cockpit/CompactCountdown'
import { useToast } from './ui/use-toast'

const tabs = ['Cockpit', 'Market', 'History', 'Team']
// The reference timeline starts in 2026; each platform period is one year.
const FIRST_GAME_YEAR = 2026

function parseFacts(raw: unknown): Record<string, any> {
  try {
    let value = raw
    for (let i = 0; i < 2 && typeof value === 'string'; i++)
      value = JSON.parse(value)
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : {}
  } catch {
    return {}
  }
}

function GameLayout({
  children,
  action,
  data,
  refetchResult,
  allocationView,
  readyControl,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  data: ResultQuery
  refetchResult: () => Promise<unknown>
  allocationView?: 'editing' | 'submitted' | 'ready'
  readyControl: {
    disabled: boolean
    onChange: (isReady: boolean) => Promise<void>
  }
}) {
  const { self, result } = data
  const currentGame = result?.currentGame
  const activePeriod = currentGame?.activePeriod
  const activeSegment = activePeriod?.activeSegment
  const player = result?.playerResult?.player
  const router = useRouter()
  const tab =
    typeof router.query.tab === 'string' &&
    tabs.some((name) => name.toLowerCase() === router.query.tab)
      ? router.query.tab
      : 'cockpit'
  const [markStoryElement] = useMutation(MarkStoryElementDocument, {
    refetchQueries: [ResultDocument],
  })

  const { toast } = useToast()

  const countdownNotifications = useRef({
    '60': false,
    '180': false,
  })
  const previousCountdownSeconds = useRef<number | null>(null)

  const {
    activeLearningId,
    setActiveLearningId,
    learningElementState,
    activeLearningOptions,
    setActiveLearningOptions,
    learningElementData,
    learningElementLoading,
    attemptingLearning,
    handleAttemptLearning,
    completedLearningElements,
    openLearningElements,
  } = useLearningActivities({
    learningElementDocument: LearningElementDocument,
    attemptLearningElementDocument: AttemptLearningElementDocument,
    resultDocument: ResultDocument,
    completedLearningElementIds: player?.completedLearningElementIds ?? [],
    activeSegmentLearningElements: activeSegment?.learningElements ?? [],
    allPeriods: currentGame?.periods ?? [],
    toast,
  })

  const currentGameId = parseInt(currentGame?.id)

  useSubscription(GlobalEventsDocument, {
    skip: !currentGameId,
    onData: ({ data: subData }) => {
      if (subData?.data?.eventsGlobal) {
        const event = subData.data.eventsGlobal
        if (shouldRefetchGameResult(event, currentGameId)) {
          refetchResult()
        }
      }
    },
  })

  const strExpiresAt = activeSegment?.countdownExpiresAt as string | null
  const countdownDurationMs = activeSegment?.countdownDurationMs as
    number | null

  const expiresAtDate = useMemo(() => {
    return strExpiresAt ? dayjs(strExpiresAt).toDate() : null
  }, [strExpiresAt])

  useEffect(() => {
    if (!strExpiresAt) return

    const dateExpiresAt = dayjs(strExpiresAt)
    const secondsRemaining = dateExpiresAt.diff(dayjs(), 's')
    previousCountdownSeconds.current = secondsRemaining

    if (secondsRemaining > 0) {
      toast({
        title: 'Countdown set/updated!',
        description: `${secondsRemaining} seconds remaining! Please press ready once you are done playing.`,
      })
    }

    countdownNotifications.current = { '60': false, '180': false }
  }, [strExpiresAt, countdownDurationMs, toast])

  if (!self || !currentGame) {
    return null
  }

  const facts = parseFacts(self.facts)
  const playerInfo = {
    name: self.name,
    color: facts.color,
    location: facts.location,
    level: self.level?.index ?? 0,
    achievements: self.achievements,
    imgPathAvatar: facts.avatar,
    imgPathLocation: `/locations/${facts.location}.svg`,
  }
  const segmentIndex = activePeriod?.activeSegment?.index
  const segmentCount =
    currentGame.periods.find((period) => period.id === activePeriod?.id)
      ?.segmentCount ?? 0
  const running = currentGame.status === 'RUNNING'
  const done =
    segmentIndex == null
      ? 0
      : running
        ? segmentIndex
        : ['PAUSED', 'CONSOLIDATION', 'RESULTS'].includes(currentGame.status)
          ? segmentIndex + 1
          : 0
  const status = {
    RUNNING: 'Allocation open',
    PAUSED: 'Allocation closed',
    CONSOLIDATION: 'Allocation closed',
    RESULTS: 'Period results',
    PREPARATION: 'Preparing',
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
  }[currentGame.status]
  const initials =
    self.name
      ?.trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'T'
  const avatarKey = String(facts.avatar ?? '')
    .split('/')
    .pop()
    ?.split('.')[0]
  const handleCountdownUpdate = (secondsLeft: number) => {
    const previousSecondsLeft = previousCountdownSeconds.current
    previousCountdownSeconds.current = secondsLeft
    if (previousSecondsLeft === null) return
    const notification = getCountdownNotification(
      secondsLeft,
      previousSecondsLeft,
      countdownNotifications.current
    )
    if (!notification) return
    toast({
      title: 'Countdown Update',
      description: `Less than ${notification.friendlyMinutes} min remaining! Please press ready.`,
    })
    countdownNotifications.current[notification.secondsKey] = true
  }

  return (
    <>
      <StoryElements
        key={activeSegment?.id}
        activeStoryElements={activeSegment?.storyElements ?? []}
        visitedStoryElementIds={player?.visitedStoryElementIds ?? []}
        playerRole={self.role}
        onMarkElementVisited={async (id) => {
          await markStoryElement({
            variables: {
              elementId: id,
            },
          })
        }}
      />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.badge} aria-hidden="true">
            {initials}
          </div>
          <div className={styles.identity}>
            <strong>{self.name}</strong>
            <p>
              {allocationView === 'submitted' || allocationView === 'ready' ? (
                `${FIRST_GAME_YEAR + (activePeriod?.index ?? 0)} · Quarter ${(segmentIndex ?? 0) + 1}`
              ) : (
                <>
                  {avatarNames[avatarKey] ?? 'Team'} · HQ{' '}
                  {cantonNames[facts.location] ?? facts.location ?? '—'}
                </>
              )}
            </p>
          </div>
          <div className={styles.clock}>
            {expiresAtDate && Number.isFinite(expiresAtDate.getTime()) ? (
              <CompactCountdown
                expiresAt={expiresAtDate}
                onUpdate={handleCountdownUpdate}
              />
            ) : (
              <span aria-label="No countdown">—</span>
            )}
          </div>
        </header>
        <section
          className={styles.progress}
          aria-label="Game progress"
          data-game-status={currentGame.status}
        >
          <div className={styles.progressHeading}>
            <h2>
              {activePeriod
                ? `${FIRST_GAME_YEAR + activePeriod.index}${segmentIndex == null ? '' : ` · Quarter ${segmentIndex + 1} of ${segmentCount}`}`
                : 'Waiting for the game'}
            </h2>
            {!running && <span>{status}</span>}
          </div>
          {segmentCount > 0 && (
            <>
              <div className={styles.segments} aria-hidden="true">
                {Array.from({ length: segmentCount }, (_, index) => (
                  <span
                    key={index}
                    className={styles.segment}
                    data-state={
                      running && index === segmentIndex
                        ? 'active'
                        : index < done
                          ? 'done'
                          : 'upcoming'
                    }
                  />
                ))}
              </div>
              {!running && (
                <p>
                  {done} {done === 1 ? 'quarter' : 'quarters'} done ·{' '}
                  {Math.max(0, segmentCount - done)} to come
                </p>
              )}
            </>
          )}
        </section>
        <main className={styles.body}>
          <div
            hidden={tab !== 'cockpit'}
            className={running ? undefined : styles.report}
          >
            {children}
          </div>
          <section hidden={tab !== 'market'} className={styles.tabPanel}>
            <h1>Market</h1>
          </section>
          <section hidden={tab !== 'history'} className={styles.tabPanel}>
            <h1>History</h1>
          </section>
          <section hidden={tab !== 'team'} className={styles.tabPanel}>
            <h1>Team</h1>
            <PlayerDisplay {...playerInfo} />
            <div className={styles.teamActivities}>
              <LearningActivitiesList
                openElements={openLearningElements}
                completedElements={completedLearningElements}
                onElementClick={(id) => setActiveLearningId(id)}
              />
            </div>
          </section>
        </main>
        <div className={styles.bottom}>
          {tab === 'cockpit' && (
            <div className={styles.footer}>
              {action}
              <div
                className={styles.ready}
                data-cy="ready-switch"
                data-ready={self.isReady}
                data-disabled={readyControl.disabled}
              >
                <label htmlFor="isReady" className={styles.readyLabel}>
                  Ready
                </label>
                <Switch
                  id="isReady"
                  checked={self.isReady}
                  disabled={readyControl.disabled}
                  size="lg"
                  className={{
                    element: styles.readyTrack,
                    thumb: styles.readyThumb,
                  }}
                  onCheckedChange={readyControl.onChange}
                />
              </div>
            </div>
          )}
          <nav className={styles.nav} aria-label="Player navigation">
            {tabs.map((name) => (
              <Link
                key={name}
                href={`/play/cockpit?tab=${name.toLowerCase()}`}
                shallow
                aria-current={tab === name.toLowerCase() ? 'page' : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <LearningActivityModal
        open={!!activeLearningId}
        onClose={() => setActiveLearningId(null)}
        element={learningElementData?.learningElement?.element}
        state={learningElementState}
        activeElements={activeLearningOptions}
        setActiveElements={setActiveLearningOptions}
        onSubmit={handleAttemptLearning}
        loading={attemptingLearning || learningElementLoading}
        returnButton={
          <Button onClick={() => setActiveLearningId(null)}>Close</Button>
        }
      />
    </>
  )
}

export default GameLayout
