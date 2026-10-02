import {
  GameSidebar,
  getCountdownNotification,
  Layout,
  LearningActivitiesList,
  LearningActivityModal,
  shouldRefetchGameResult,
  StoryElements,
} from '@gbl-uzh/ui'
import { Button } from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { useLearningActivities } from '~/hooks/useLearningActivities'
import { getFacts } from '~/lib/facts'
import { trpc } from '~/lib/trpc'
import { useToast } from './ui/use-toast'

const tabs = [
  { name: 'Welcome', href: '/play/welcome' },
  { name: 'Cockpit', href: '/play/cockpit' },
]

function getAchievementReward(value: unknown): { xp?: number } | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const xp = (value as Record<string, unknown>).xp
    return { xp: typeof xp === 'number' ? xp : undefined }
  }
  return null
}

function toStoryElementData(
  elements: readonly {
    id: string
    title: string
    type?: string
    content?: string | null
    contentRole?: unknown
  }[]
) {
  return elements.map((element) => ({
    id: element.id,
    title: element.title,
    type: (element.type ?? 'GENERIC') as 'GENERIC' | 'ROLE_BASED',
    content: element.content,
    contentRole:
      element.contentRole && typeof element.contentRole === 'object'
        ? (element.contentRole as Record<string, unknown>)
        : null,
  }))
}

function GameLayout({ children }: { children: React.ReactNode }) {
  const utils = trpc.useUtils()
  const { data: resultData } = trpc.play.result.useQuery()
  const { data: selfData } = trpc.play.self.useQuery()
  const { toast } = useToast()

  const updateReadyState = trpc.play.updateReadyState.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.play.result.invalidate(),
        utils.play.self.invalidate(),
      ])
    },
    onError: (err) => {
      toast({
        title: 'Could not update your ready state',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const markStoryElement = trpc.story.markVisited.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.play.result.invalidate(),
        utils.play.self.invalidate(),
      ])
    },
    onError: (err) => {
      toast({
        title: 'Could not mark the story element as read',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const [countdownNotifications, setCountdownNotifications] = useState({
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
    completedLearningElementIds: selfData?.completedLearningElementIds ?? [],
    activeSegmentLearningElements:
      resultData?.currentGame?.activePeriod?.activeSegment?.learningElements ??
      [],
    allPeriods: resultData?.currentGame?.periods ?? [],
    toast,
  })

  const currentGameId = resultData?.currentGame?.id
  trpc.events.global.useSubscription(undefined, {
    enabled: Boolean(currentGameId),
    onData(event) {
      if (!currentGameId) return
      if (shouldRefetchGameResult(event, currentGameId)) {
        Promise.all([
          utils.play.result.invalidate(),
          utils.play.self.invalidate(),
        ]).catch((error) => {
          console.error('GameLayout: Failed to refresh result:', error)
        })
      }
    },
    onError: (err) => {
      console.error('GameLayout: Subscription error:', err)
    },
  })

  const expiresAtDate =
    resultData?.currentGame?.activePeriod?.activeSegment?.countdownExpiresAt ??
    null
  const countdownDurationMs =
    resultData?.currentGame?.activePeriod?.activeSegment?.countdownDurationMs ??
    null
  const expiresAtKey = expiresAtDate?.getTime() ?? null

  useEffect(() => {
    if (!expiresAtDate) return

    const secondsRemaining = dayjs(expiresAtDate).diff(dayjs(), 's')
    previousCountdownSeconds.current = secondsRemaining
    if (secondsRemaining > 0) {
      toast({
        title: 'Countdown set/updated!',
        description: `${secondsRemaining} seconds remaining! Please press ready once you are done playing.`,
      })
    }
    setCountdownNotifications({ '60': false, '180': false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAtKey, countdownDurationMs])

  if (!selfData || !resultData?.currentGame) return null

  const selfFacts = getFacts(selfData.facts)
  const playerColor =
    typeof selfFacts.color === 'string' ? selfFacts.color : 'Red'
  const playerLocation =
    typeof selfFacts.location === 'string' ? selfFacts.location : 'ZH'
  const playerAvatar =
    typeof selfFacts.avatar === 'string'
      ? selfFacts.avatar
      : '/avatars/avatar_placeholder.png'

  const achievements = selfData.achievements.map((entry) => ({
    id: entry.id,
    count: entry.count,
    achievement: {
      id: entry.achievement.id,
      name: entry.achievement.name,
      description: entry.achievement.description,
      image: entry.achievement.image,
      reward: getAchievementReward(entry.achievement.reward),
    },
  }))

  const playerInfo = {
    name: selfData.name,
    color: playerColor,
    location: playerLocation,
    level: selfData.level.index,
    xp: selfData.experience,
    xpMax: selfData.experienceToNext,
    achievements,
    imgPathAvatar: playerAvatar,
    imgPathLocation: `/locations/${playerLocation}.svg`,
  }

  const sidebar = (
    <GameSidebar
      playerInfo={playerInfo}
      readySwitch={{
        checked: selfData.isReady,
        disabled: updateReadyState.isPending,
        onCheckedChange: () => {
          updateReadyState.mutate({ isReady: !selfData.isReady })
        },
      }}
      countdown={
        countdownDurationMs !== null && expiresAtDate !== null
          ? {
              expiresAt: expiresAtDate,
              totalDuration: countdownDurationMs / 1000,
              onUpdate: (secondsLeft) => {
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
                setCountdownNotifications((previous) => ({
                  ...previous,
                  [notification.secondsKey]: true,
                }))
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

  const activeSegment = resultData.currentGame.activePeriod?.activeSegment
  return (
    <>
      <StoryElements
        key={activeSegment?.id}
        activeStoryElements={toStoryElementData(
          activeSegment?.storyElements ?? []
        )}
        visitedStoryElementIds={selfData.visitedStoryElementIds ?? []}
        playerRole={selfData.role ?? undefined}
        onMarkElementVisited={async (id) => {
          await markStoryElement
            .mutateAsync({ elementId: id })
            .catch(() => undefined)
        }}
      />
      <Layout tabs={tabs} playerInfo={playerInfo} sidebar={sidebar}>
        {children}
      </Layout>
      <LearningActivityModal
        open={!!activeLearningId}
        onClose={() => setActiveLearningId(null)}
        element={learningElementData?.element}
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
