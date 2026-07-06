import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  GameSidebar,
  LearningActivitiesList,
  LearningElementDisplay,
  type LearningElementState,
  Layout,
  StoryElements,
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

  const [activeLearningId, setActiveLearningId] = useState<string | null>(null)
  const [learningElementState, setLearningElementState] = useState<LearningState>(null)
  const [activeLearningOptions, setActiveLearningOptions] = useState<number[]>([])

  const { data: learningElementData, loading: learningElementLoading } = useQuery(
    LearningElementDocument,
    {
      variables: { id: activeLearningId ?? '' },
      skip: !activeLearningId,
    }
  )

  useEffect(() => {
    if (learningElementData?.learningElement) {
      setLearningElementState(learningElementData.learningElement.state as LearningState)
      try {
        if (learningElementData.learningElement.solution) {
          setActiveLearningOptions(JSON.parse(learningElementData.learningElement.solution))
        } else {
          setActiveLearningOptions([])
        }
      } catch {
        setActiveLearningOptions([])
      }
    } else {
      setLearningElementState(null)
      setActiveLearningOptions([])
    }
  }, [learningElementData, activeLearningId])

  const [attemptLearningElement, { loading: attemptingLearning }] = useMutation(
    AttemptLearningElementDocument,
    {
      refetchQueries: [ResultDocument, LearningElementDocument],
    }
  )

  const [countdownNotifications, setCountdownNotifications] = useState({
    '60': false,
    '180': false,
  })

  const { toast } = useToast()

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

  const completedLearningElementIds =
    data?.result?.playerResult?.player?.completedLearningElementIds ?? []
  const allPeriods = data?.result?.currentGame?.periods ?? []
  const currentLearningElements =
    data?.result?.currentGame?.activePeriod?.activeSegment?.learningElements ?? []

  const completedLearningElements = useMemo(() => {
    const seen = new Set<string>()
    return allPeriods
      .flatMap((period: any) =>
        (period.segments || []).flatMap((segment: any) => segment.learningElements || [])
      )
      .filter((elem: any) => completedLearningElementIds.includes(elem.id))
      .filter((elem: any) => {
        if (seen.has(elem.id)) return false
        seen.add(elem.id)
        return true
      })
  }, [allPeriods, completedLearningElementIds])

  const openLearningElements = useMemo(
    () => (currentLearningElements || []).filter(
      (elem: any) => !completedLearningElementIds.includes(elem.id)
    ),
    [currentLearningElements, completedLearningElementIds]
  )

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

  const handleAttemptLearning = async () => {
    if (!activeLearningId) return
    try {
      const result = await attemptLearningElement({
        variables: {
          elementId: activeLearningId,
          selection: JSON.stringify(activeLearningOptions),
        },
      })
      const resData = result.data?.attemptLearningElement
      if (resData) {
        if (resData.pointsAchieved === resData.pointsMax) {
          setLearningElementState('SOLVED')
        } else {
          setLearningElementState('ATTEMPTED')
          toast({
            title: 'Wrong answer',
            description: 'Try again!',
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

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
