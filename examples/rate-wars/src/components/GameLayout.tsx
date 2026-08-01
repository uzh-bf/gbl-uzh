import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  CycleCountdown,
  getCountdownNotification,
  Layout,
  LearningActivitiesList,
  LearningActivityModal,
  PlayerDisplay,
  shouldRefetchGameResult,
  StoryElements,
  useLearningActivities,
} from '@gbl-uzh/ui'
import { Card, CardContent, Switch } from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AttemptLearningElementDocument,
  GlobalEventsDocument,
  LearningElementDocument,
  MarkStoryElementDocument,
  ResultDocument,
  UpdateReadyStateDocument,
} from 'src/graphql/generated/ops'
import { useToast } from './ui/use-toast'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data, refetch: refetchResult } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const [updateReadyState, { loading }] = useMutation(UpdateReadyStateDocument)

  const [countdownNotifications, setCountdownNotifications] = useState({
    '60': false,
    '180': false,
  })
  const previousCountdownSeconds = useRef<number | null>(null)

  const { toast } = useToast()

  const completedLearningElementIds =
    data?.result?.playerResult?.player?.completedLearningElementIds || []
  const periods = data?.result?.currentGame?.periods || []
  const learningElements =
    data?.result?.currentGame?.activePeriod?.activeSegment?.learningElements ||
    []

  const {
    activeLearningId,
    setActiveLearningId,
    learningElementState,
    activeLearningOptions,
    setActiveLearningOptions,
    learningElementData,
    attemptingLearning,
    handleAttemptLearning,
    completedLearningElements,
    openLearningElements,
  } = useLearningActivities({
    learningElementDocument: LearningElementDocument,
    attemptLearningElementDocument: AttemptLearningElementDocument,
    resultDocument: ResultDocument,
    completedLearningElementIds,
    activeSegmentLearningElements: learningElements,
    allPeriods: periods,
    toast,
  })

  const [markStoryElement] = useMutation(MarkStoryElementDocument, {
    refetchQueries: [ResultDocument],
  })

  const currentGameId = parseInt(data?.result?.currentGame?.id)

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
    onError: (err) => {
      console.error('Player Cockpit: Subscription error:', err)
    },
  })

  const strExpiresAt = data?.result?.currentGame?.activePeriod?.activeSegment
    ?.countdownExpiresAt as string | null
  const countdownDurationMs = data?.result?.currentGame?.activePeriod
    ?.activeSegment?.countdownDurationMs as number | null

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

    setCountdownNotifications({ '60': false, '180': false })
  }, [strExpiresAt, countdownDurationMs])

  if (!data?.self) return null

  const playerInfo = {
    name: data.self.name,
    color: data.self.facts?.color,
    location: data.self.facts?.location,
    level: data.self.level?.index ?? 0,
    xp: data.self.experience,
    xpMax: data.self.experienceToNext,
    achievements: data.self.achievements,
    imgPathAvatar: data.self.facts?.avatar,
    imgPathLocation: `/locations/${data.self.facts?.location}.svg`,
    onClick: () => {},
  }
  const sidebar = (
    <div id="sidebar" className="flex flex-col justify-between">
      <Card className="mb-4">
        <CardContent>
          <PlayerDisplay
            name={playerInfo.name}
            color={playerInfo.color}
            location={playerInfo.location}
            level={playerInfo.level}
            achievements={playerInfo.achievements as any}
            imgPathAvatar={playerInfo.imgPathAvatar}
            imgPathLocation={playerInfo.imgPathLocation}
            onClick={playerInfo.onClick}
          />
          <div className="flex items-center justify-between">
            {data?.self && (
              <div data-cy="ready-switch">
                <Switch
                  className={{
                    root: 'text-xs font-bold text-gray-600',
                  }}
                  disabled={!data.self || loading}
                  id="isReady"
                  checked={data.self.isReady}
                  label="Ready?"
                  onCheckedChange={async () => {
                    await updateReadyState({
                      variables: {
                        isReady: !data.self.isReady,
                      },
                    })
                  }}
                />
              </div>
            )}

            {countdownDurationMs !== null && expiresAtDate !== null && (
              <CycleCountdown
                expiresAt={expiresAtDate}
                totalDuration={countdownDurationMs / 1000}
                onUpdate={(secondsLeft) => {
                  const previousSecondsLeft = previousCountdownSeconds.current
                  previousCountdownSeconds.current = secondsLeft
                  if (previousSecondsLeft === null) return

                  const notification = getCountdownNotification(
                    secondsLeft,
                    previousSecondsLeft,
                    countdownNotifications
                  )
                  if (!notification) return

                  toast({
                    title: 'Countdown Update',
                    description: `Less than ${notification.friendlyMinutes} min remaining! Please press ready.`,
                  })
                  setCountdownNotifications((prevState) => ({
                    ...prevState,
                    [notification.secondsKey]: true,
                  }))
                }}
                onExpire={() => console.log('Countdown expired')}
                className="text-xs font-bold text-gray-600"
              />
            )}
          </div>
          <LearningActivitiesList
            openElements={openLearningElements}
            completedElements={completedLearningElements}
            onElementClick={(id) => setActiveLearningId(id)}
          />
        </CardContent>
      </Card>
    </div>
  )

  const activeSegment = data?.result?.currentGame?.activePeriod?.activeSegment

  return (
    <>
      <StoryElements
        key={activeSegment?.id}
        activeStoryElements={activeSegment?.storyElements || []}
        visitedStoryElementIds={
          data?.result?.playerResult?.player?.visitedStoryElementIds || []
        }
        playerRole={data.self.role}
        onMarkElementVisited={async (elementId) => {
          await markStoryElement({
            variables: { elementId },
          })
        }}
      />
      <Layout tabs={tabs} playerInfo={playerInfo} sidebar={sidebar}>
        {children}
      </Layout>
      <LearningActivityModal
        open={!!activeLearningId}
        onClose={() => setActiveLearningId(null)}
        element={learningElementData?.learningElement?.element}
        state={learningElementState}
        activeElements={activeLearningOptions}
        setActiveElements={setActiveLearningOptions}
        onSubmit={handleAttemptLearning}
        loading={attemptingLearning}
      />
    </>
  )
}

const tabs = [
  { name: 'Welcome', href: '/play/welcome' },
  { name: 'Cockpit', href: '/play/cockpit' },
]
