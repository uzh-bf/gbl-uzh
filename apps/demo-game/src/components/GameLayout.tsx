import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  GameSidebar,
  LearningActivitiesList,
  LearningElementDisplay,
  type LearningElementState,
  Layout,
  StoryElements,
  useLearningActivities,
} from '@gbl-uzh/ui'
import { Button, Modal } from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import {
  AttemptLearningElementDocument,
  GlobalEventsDocument,
  LearningElementDocument,
  MarkStoryElementDocument,
  ResultDocument,
  UpdateReadyStateDocument,
} from 'src/graphql/generated/ops'
import { useToast } from './ui/use-toast'

enum BaseGlobalNotificationType {
  PERIOD_ACTIVATED = 'PERIOD_ACTIVATED',
  SEGMENT_ACTIVATED = 'SEGMENT_ACTIVATED',
  COUNTDOWN_UPDATED = 'COUNTDOWN_UPDATED',
}

const tabs = [
  { name: 'Welcome', href: '/play/welcome' },
  { name: 'Cockpit', href: '/play/cockpit' },
]

type LearningState = LearningElementState | null

function GameLayout({ children }: { children: React.ReactNode }) {
  const { data, refetch: refetchResult } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const [updateReadyState, { loading }] = useMutation(UpdateReadyStateDocument)
  const [markStoryElement] = useMutation(MarkStoryElementDocument, {
    refetchQueries: [ResultDocument],
  })

  const { toast } = useToast()

  const [countdownNotifications, setCountdownNotifications] = useState({
    '60': false,
    '180': false,
  })

  const completedLearningElementIds =
    data?.result?.playerResult?.player?.completedLearningElementIds ?? []
  const allPeriods = data?.result?.currentGame?.periods ?? []
  const currentLearningElements =
    data?.result?.currentGame?.activePeriod?.activeSegment?.learningElements ?? []

  const {
    activeLearningId,
    setActiveLearningId,
    learningElementState,
    setLearningElementState,
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
    completedLearningElementIds,
    activeSegmentLearningElements: currentLearningElements,
    allPeriods,
    toast,
  })

  const currentGameId = parseInt(data?.result?.currentGame?.id)

  useSubscription(GlobalEventsDocument, {
    skip: !currentGameId,
    onData: ({ data: subData }) => {
      if (subData?.data?.eventsGlobal) {
        const event = subData.data.eventsGlobal
        if (
          event.type === BaseGlobalNotificationType.COUNTDOWN_UPDATED &&
          event.facts?.gameId === currentGameId
        ) {
          refetchResult()
        } else if (
          (event?.type === BaseGlobalNotificationType.PERIOD_ACTIVATED ||
            event?.type === BaseGlobalNotificationType.SEGMENT_ACTIVATED) &&
          event?.facts?.gameId === currentGameId
        ) {
          refetchResult()
        }
      }
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

    if (secondsRemaining > 0) {
      toast({
        title: 'Countdown set/updated!',
        description: `${secondsRemaining} seconds remaining! Please press ready once you are done playing.`,
      })
    }

    setCountdownNotifications({ '60': false, '180': false })
  }, [strExpiresAt, countdownDurationMs])



  if (!data?.self || !data?.result?.currentGame) {
    return null
  }

  const playerInfo = {
    name: data.self.name,
    color: data.self.facts.color,
    location: data.self.facts.location,
    level: data.self.level.index,
    xp: data.self.experience,
    xpMax: data.self.experienceToNext,
    achievements: data.self.achievements,
    imgPathAvatar: data.self.facts.avatar,
    imgPathLocation: `/locations/${data.self.facts.location}.svg`,
  }

  const sidebar = (
    <GameSidebar
      playerInfo={playerInfo}
      readySwitch={
        data?.self
          ? {
              checked: data.self.isReady,
              disabled: loading,
              onCheckedChange: async () => {
                await updateReadyState({
                  variables: {
                    isReady: !data.self.isReady,
                  },
                })
              },
            }
          : undefined
      }
      countdown={
        countdownDurationMs !== null && expiresAtDate !== null
          ? {
              expiresAt: expiresAtDate,
              totalDuration: countdownDurationMs / 1000,
              onUpdate: (secondsLeft) => {
                const minutesRemainingThreshold = [1, 3]
                minutesRemainingThreshold.forEach((minute) => {
                  const secondsThreshold = minute * 60
                  if (
                    secondsLeft <= secondsThreshold &&
                    secondsLeft > secondsThreshold - 1
                  ) {
                    const secondsKey = String(secondsThreshold)
                    if (!countdownNotifications[secondsKey]) {
                      const friendlyMinutes = Math.ceil(secondsLeft / 60)
                      toast({
                        title: 'Countdown Update',
                        description: `Less than ${friendlyMinutes} min remaining! Please press ready.`,
                      })
                      setCountdownNotifications((prevState) => ({
                        ...prevState,
                        [secondsKey]: true,
                      }))
                    }
                  }
                })
              },
              onExpire: () => {},
            }
          : undefined
      }
    >
      <LearningActivitiesList
        openElements={openLearningElements}
        completedElements={completedLearningElements}
        onElementClick={(id) => setActiveLearningId(id)}
      />
    </GameSidebar>
  )

  const activeSegment = data?.result?.currentGame?.activePeriod?.activeSegment



  return (
    <>
      <StoryElements
        activeStoryElements={activeSegment?.storyElements ?? []}
        visitedStoryElementIds={data?.result?.playerResult?.player?.visitedStoryElementIds ?? []}
        playerRole={data.self.role}
        onMarkElementVisited={async (id) => {
          await markStoryElement({
            variables: {
              elementId: id,
            },
          })
        }}
      />
      <Layout tabs={tabs} playerInfo={playerInfo} sidebar={sidebar}>
        {children}
      </Layout>
      <Modal
        className={{ content: 'max-w-4xl overflow-y-auto' }}
        open={!!activeLearningId}
        onClose={() => setActiveLearningId(null)}
        title="Learning Activity"
      >
        {learningElementData?.learningElement && (
          <LearningElementDisplay
            title={learningElementData.learningElement.element.title}
            question={learningElementData.learningElement.element.question}
            options={learningElementData.learningElement.element.options}
            state={learningElementState || 'UNATTEMPTED'}
            pointsText={
              learningElementData.learningElement.element.reward
                ? `Awards ${learningElementData.learningElement.element.reward}XP`
                : undefined
            }
            feedback={learningElementData.learningElement.element.feedback}
            motivation={learningElementData.learningElement.element.motivation}
            activeElements={activeLearningOptions}
            onOptionClick={(idx) => {
              setActiveLearningOptions((prev) => {
                if (prev.includes(idx)) {
                  return prev.filter((i) => i !== idx)
                }
                return [idx]
              })
            }}
            onSubmit={handleAttemptLearning}
            loading={attemptingLearning || learningElementLoading}
            returnButton={
              <Button onClick={() => setActiveLearningId(null)}>
                Close
              </Button>
            }
          />
        )}
      </Modal>
    </>
  )
}

export default GameLayout
