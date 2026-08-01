import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  CycleCountdown,
  Layout,
  LearningActivitiesList,
  LearningActivityModal,
  PlayerDisplay,
  shouldRefetchGameResult,
  StoryElements,
  useLearningActivities,
} from '@gbl-uzh/ui'
import { Button, Card, CardContent } from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import { useMemo } from 'react'
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

  const self = data?.self

  if (!data?.result) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  const isReady = self?.isReady ?? false

  const playerInfo = {
    name: self?.name || '',
    color: self?.facts?.color || 'White',
    location: self?.facts?.location || 'ZH',
    level: self?.level?.index ?? 0,
    xp: self?.experience ?? 0,
    xpMax: self?.experienceToNext ?? 100,
    achievements: (self?.achievements || []) as any,
    imgPathAvatar: self?.facts?.avatar || '',
    imgPathLocation: self?.facts?.location
      ? `/locations/${self.facts.location}.svg`
      : '',
    onClick: () => {},
  }

  const sidebar = (
    <div id="sidebar" className="flex w-80 flex-col justify-between">
      <Card className="mb-4">
        <CardContent className="space-y-4 pt-6">
          <PlayerDisplay
            name={playerInfo.name}
            color={playerInfo.color}
            location={playerInfo.location}
            level={playerInfo.level}
            achievements={playerInfo.achievements}
            imgPathAvatar={playerInfo.imgPathAvatar}
            imgPathLocation={playerInfo.imgPathLocation}
            onClick={playerInfo.onClick}
          />
          <div className="flex items-center justify-between border-t pt-4">
            {self && (
              <div data-cy="ready-switch" className="flex items-center gap-2">
                <span className="text-sm font-medium">Ready?</span>
                <Button
                  variant={isReady ? 'success' : 'default'}
                  disabled={loading}
                  onClick={async () => {
                    try {
                      await updateReadyState({
                        variables: {
                          isReady: !isReady,
                        },
                      })
                      refetchResult()
                    } catch (e: any) {
                      toast({
                        title: 'Error updating ready state',
                        description: e.message,
                        variant: 'destructive',
                      })
                    }
                  }}
                >
                  {isReady ? 'Ready' : 'Set Ready'}
                </Button>
              </div>
            )}

            {countdownDurationMs !== null && expiresAtDate !== null && (
              <CycleCountdown
                expiresAt={expiresAtDate}
                totalDuration={countdownDurationMs / 1000}
              />
            )}
            <LearningActivitiesList
              openElements={openLearningElements}
              completedElements={completedLearningElements}
              onElementClick={(id) => setActiveLearningId(id)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const tabs = [
    { name: 'Welcome', href: '/play/welcome' },
    { name: 'Cockpit', href: '/play/cockpit' },
  ]

  const activeSegment = data?.result?.currentGame?.activePeriod?.activeSegment

  return (
    <>
      <StoryElements
        key={activeSegment?.id}
        activeStoryElements={activeSegment?.storyElements || []}
        visitedStoryElementIds={
          data?.result?.playerResult?.player?.visitedStoryElementIds || []
        }
        playerRole={self?.role}
        onMarkElementVisited={async (elementId) => {
          await markStoryElement({
            variables: { elementId },
          })
        }}
      />
      <Layout tabs={tabs} playerInfo={playerInfo} sidebar={sidebar}>
        <div className="flex-1 space-y-6">{children}</div>
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
