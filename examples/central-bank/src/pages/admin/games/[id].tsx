import { faCalendar, faPauseCircle } from '@fortawesome/free-regular-svg-icons'
import {
  faCheck,
  faPause,
  faPlus,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Button,
  FormikNumberField,
  FormikTextField,
  H3,
  H4,
  Modal,
} from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { GameStatus } from 'src/generated/prisma/enums'
import { twMerge } from 'tailwind-merge'

import {
  computePeriodStatus,
  computeSegmentStatus,
  PlayerCompact,
  STATUS,
} from '@gbl-uzh/ui'
import { useEffect, useRef, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@uzh-bf/design-system'

import { FormikMultiSelectField } from '~/components/fields/FormikMultiSelectField'
import { useToast } from '~/components/ui/use-toast'
import { getFacts } from '~/lib/facts'
import { trpc } from '~/lib/trpc'
import type { PeriodFacts, PeriodSegmentFacts } from '~/types/Period'
const DEFAULT_SEED = 1
const DEFAULT_TARGET_INFLATION = 2.0
const DEFAULT_NATURAL_UNEMPLOYMENT = 5.0
const DEFAULT_LAMBDA = 1.0
const DEFAULT_INITIAL_INFLATION = 4.0
const DEFAULT_INITIAL_UNEMPLOYMENT = 4.0
const DEFAULT_INITIAL_GROWTH = 3.0

function ManageGame() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false)

  const gameId = Number(router.query.id)
  const hasGameId = Number.isFinite(gameId)

  const {
    data: game,
    error: gameError,
    isLoading: gameLoading,
  } = trpc.game.byId.useQuery(
    { id: hasGameId ? gameId : 0 },
    { enabled: hasGameId, refetchInterval: hasGameId ? 15000 : false }
  )

  const {
    data: learningElementsData = [],
    isLoading: learningElementsLoading,
    error: learningElementsError,
  } = trpc.learning.list.useQuery(undefined, { enabled: hasGameId })

  const {
    data: storyElementsData = [],
    isLoading: storyElementsLoading,
    error: storyElementsError,
  } = trpc.story.list.useQuery(undefined, { enabled: hasGameId })

  const { toast } = useToast()

  async function invalidateGameById() {
    if (!hasGameId) return
    await utils.game.byId.invalidate({ id: gameId })
  }

  function scrollToActivePeriod() {
    document
      .querySelector('#active-period')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const nextPeriod = trpc.game.activateNextPeriod.useMutation({
    async onSuccess() {
      scrollToActivePeriod()
      await invalidateGameById()
    },
    onError: (error) => {
      toast({
        title: 'Could not advance the game',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const nextSegment = trpc.game.activateNextSegment.useMutation({
    async onSuccess() {
      scrollToActivePeriod()
      await invalidateGameById()
    },
    onError: (error) => {
      toast({
        title: 'Could not advance the game',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const addGamePeriod = trpc.period.add.useMutation({
    async onSuccess() {
      setIsPeriodModalOpen(false)
      await invalidateGameById()
    },
    onError: (error) => {
      toast({
        title: 'Could not add the period',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const addPeriodSegment = trpc.segment.add.useMutation({
    async onSuccess() {
      setIsSegmentModalOpen(false)
      await invalidateGameById()
    },
    onError: (error) => {
      toast({
        title: 'Could not add the segment',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const addCountdown = trpc.game.addCountdown.useMutation({
    async onSuccess() {
      await invalidateGameById()
      toast({
        title: 'Countdown added',
        description: 'Players were notified.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Countdown failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const wasAllReady = useRef(false)
  useEffect(() => {
    if (game?.status !== GameStatus.RUNNING) {
      wasAllReady.current = false
      return
    }

    const allPlayersReady = game.players.every((player) => player.isReady)
    if (allPlayersReady && !wasAllReady.current) {
      wasAllReady.current = true
      toast({
        title: 'All players are ready!',
        description: 'All players are ready to continue.',
      })

      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch((error) => {
        console.error('Error playing notification sound:', error)
      })
    } else if (!allPlayersReady) {
      wasAllReady.current = false
    }
  }, [game?.players, game?.status, toast])

  async function activateNextPeriod() {
    if (!hasGameId) return
    await nextPeriod.mutateAsync({ gameId })
  }

  async function activateNextSegment() {
    if (!hasGameId) return
    await nextSegment.mutateAsync({ gameId })
  }

  function getButton() {
    if (!game) return null
    const activePeriod = game.activePeriod
    const segments = activePeriod?.segments ?? []
    const activeSegmentIx = activePeriod?.activeSegmentIx ?? -1

    switch (game.status) {
      case GameStatus.PREPARATION: {
        const atLastSegment = activeSegmentIx >= segments.length - 1
        if (!atLastSegment) {
          return (
            <Button
              disabled={nextSegment.isPending}
              onClick={activateNextSegment}
            >
              Next Segment
            </Button>
          )
        }
        const disabled = game.periods.length === 0 || segments.length === 0
        return (
          <Button disabled={disabled} onClick={activateNextPeriod}>
            Start Period
          </Button>
        )
      }
      case GameStatus.SCHEDULED:
        if (!activePeriod) {
          const disabled =
            game.periods.length === 0 || game.periods[0].segments.length === 0
          return (
            <Button disabled={disabled} onClick={activateNextPeriod}>
              Start Period
            </Button>
          )
        }
        return <Button onClick={activateNextPeriod}>Start Segment</Button>
      case GameStatus.RUNNING: {
        if (!activePeriod) return null
        const atLastSegment =
          activeSegmentIx >= segments.length - 1 &&
          activePeriod.segmentCount === segments.length
        if (atLastSegment) {
          return (
            <Button
              disabled={nextPeriod.isPending}
              onClick={activateNextPeriod}
            >
              Consolidate
            </Button>
          )
        }
        // The next segment may not exist yet even while the period is running.
        // Keep the transition disabled until the admin adds that segment.
        const disabled = activePeriod.activeSegmentIx === segments.length - 1
        return (
          <Button
            disabled={nextSegment.isPending || disabled}
            onClick={activateNextSegment}
          >
            Segment Results
          </Button>
        )
      }
      case GameStatus.PAUSED: {
        const atLastSegment = activeSegmentIx >= segments.length - 1
        return (
          <Button
            disabled={nextSegment.isPending || atLastSegment}
            onClick={activateNextSegment}
          >
            Next Segment
          </Button>
        )
      }
      case GameStatus.CONSOLIDATION:
        return (
          <Button disabled={nextPeriod.isPending} onClick={activateNextPeriod}>
            Period Results
          </Button>
        )
      case GameStatus.RESULTS: {
        const anotherPeriod = game.activePeriodIx > game.periods.length - 1
        return (
          <Button disabled={anotherPeriod} onClick={activateNextPeriod}>
            Next Period
          </Button>
        )
      }
      case GameStatus.COMPLETED:
        return <Button disabled>Completed</Button>
      default:
        return null
    }
  }

  if (gameError) return <div>{gameError.message}</div>
  if (gameLoading || !game) return <div>loading...</div>

  const learningElementsAll = learningElementsData.map((element) => ({
    label: element.id,
    value: element.id,
  }))
  const storyElementsAll = storyElementsData.map((element) => ({
    label: element.id,
    value: element.id,
  }))

  return (
    <div className="p-4" data-cy="game-detail" data-game-status={game.status}>
      <div>
        <div className="mb-4 flex flex-col gap-2 overflow-x-auto md:flex-row">
          {game.periods.map((period, ix) => {
            const periodStatus = computePeriodStatus(game, ix)

            const isPeriodPlanned = periodStatus === STATUS.SCHEDULED
            const isPeriodPaused = periodStatus === STATUS.PAUSED
            const isPeriodActive = periodStatus === STATUS.ACTIVE
            const isPeriodCompleted =
              periodStatus === STATUS.COMPLETED ||
              periodStatus === STATUS.RESULTS

            const scenario = getFacts(period.facts)
              .scenario as PeriodFacts['scenario']
            const targetInflation = scenario.targetInflation
            const naturalUnemployment = scenario.naturalUnemployment
            const lambda = scenario.lambda
            const initialInflation = scenario.initialInflation
            const initialUnemployment = scenario.initialUnemployment
            const initialGrowth = scenario.initialGrowth
            const seed = scenario.seed

            return (
              <div
                className="flex flex-row gap-2"
                key={period.id}
                id={isPeriodActive ? 'active-period' : undefined}
                data-cy={`period-${ix}`}
              >
                <div
                  className={twMerge(
                    'flex flex-1 flex-col gap-1 rounded border p-2',
                    isPeriodPaused && 'border-orange-300 bg-orange-100',
                    isPeriodActive && 'border-green-300 bg-green-50',
                    isPeriodCompleted && 'bg-gray-100 text-gray-400'
                  )}
                >
                  <div className="mb-4 flex flex-col items-start justify-between">
                    <div className="flex flex-row gap-2">
                      <div>
                        {isPeriodPlanned && (
                          <FontAwesomeIcon icon={faCalendar} />
                        )}
                        {isPeriodPaused && <FontAwesomeIcon icon={faPause} />}
                        {isPeriodActive && <FontAwesomeIcon icon={faSync} />}
                        {isPeriodCompleted && (
                          <FontAwesomeIcon icon={faCheck} />
                        )}
                      </div>
                      <div className="font-bold">Period {period.index + 1}</div>
                      {isPeriodActive && <div>{game.status}</div>}
                    </div>
                    <div className="mt-2 flex w-full flex-row gap-2 text-sm">
                      <div className="flex w-1/2 flex-col gap-1">
                        <div className="flex justify-between">
                          <span>Seed:</span>
                          <span className="font-semibold">{seed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Inflation:</span>
                          <span className="font-semibold">
                            {targetInflation}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Natural Unemp.:</span>
                          <span className="font-semibold">
                            {naturalUnemployment}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lambda:</span>
                          <span className="font-semibold">{lambda}</span>
                        </div>
                      </div>
                      <div className="flex w-1/2 flex-col gap-1 border-l pl-4">
                        <div className="flex justify-between">
                          <span>Init Inflation:</span>
                          <span className="font-semibold">
                            {initialInflation}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Init Unemp.:</span>
                          <span className="font-semibold">
                            {initialUnemployment}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Init Growth:</span>
                          <span className="font-semibold">
                            {initialGrowth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-row gap-1">
                    {Array.apply(null, Array(period.segmentCount ?? 0)).map(
                      (_, ix) => {
                        const segment = period.segments[ix]
                        const segmentStatus = computeSegmentStatus(
                          game,
                          period,
                          ix
                        )

                        const isSegmentActive =
                          periodStatus === STATUS.ACTIVE &&
                          segmentStatus === STATUS.ACTIVE
                        const isSegmentCompleted =
                          periodStatus === STATUS.COMPLETED ||
                          segmentStatus === STATUS.COMPLETED

                        const segmentFacts = getFacts(
                          segment?.facts
                        ) as Partial<PeriodSegmentFacts>
                        const roll = segmentFacts.roll
                        const shock = segmentFacts.shock

                        return (
                          <div
                            className={twMerge(
                              'flex-initial rounded border p-2 text-center',
                              (!segment || isSegmentCompleted) &&
                                'bg-gray-100 text-gray-400',
                              isSegmentActive && 'border-green-600 bg-green-100'
                            )}
                            key={ix}
                            data-cy={`period-${period.index}-segment-${ix}`}
                          >
                            <div className="flex flex-row items-center gap-2">
                              <div>
                                {!isSegmentActive && !isSegmentCompleted && (
                                  <FontAwesomeIcon icon={faCalendar} />
                                )}
                                {isSegmentActive && (
                                  <FontAwesomeIcon icon={faSync} />
                                )}
                                {isSegmentCompleted && (
                                  <FontAwesomeIcon icon={faCheck} />
                                )}
                              </div>
                              {
                                <div>
                                  Segment{' '}
                                  {segment?.index !== undefined
                                    ? segment.index + 1
                                    : ''}
                                </div>
                              }
                            </div>
                            <div className="my-2">
                              <div className="flex flex-row gap-2">
                                <div className="text-sm">
                                  Story: {segment?.storyElements?.length ?? 0}
                                </div>
                                <div className="text-sm">
                                  Learn:{' '}
                                  {segment?.learningElements?.length ?? 0}
                                </div>
                              </div>
                            </div>

                            {segment && (
                              <div className="bg-muted/20 flex flex-col rounded border border-gray-300 p-2 text-left text-xs">
                                <div className="flex justify-between">
                                  <span>Roll:</span>
                                  <span className="font-mono font-bold">
                                    {roll}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shock:</span>
                                  <span className="font-mono font-bold">
                                    {(shock ?? 0) > 0 ? `+${shock}` : shock}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      }
                    )}
                    {!isPeriodCompleted && game.periods.length - 1 === ix && (
                      <Formik
                        initialValues={{
                          periodIx: -1,
                          storyElements: [],
                          learningElements: [],
                        }}
                        onSubmit={async (variables, { resetForm }) => {
                          await addPeriodSegment.mutateAsync({
                            gameId,
                            periodIx: variables.periodIx,
                            facts: {},
                            storyElements: variables.storyElements,
                            learningElements: variables.learningElements,
                          })
                          resetForm()
                        }}
                      >
                        {(newSegmentForm) => {
                          if (storyElementsLoading) {
                            return <div>Loading story elements...</div>
                          }
                          if (storyElementsError) {
                            return (
                              <div>
                                Error loading story elements:{' '}
                                {storyElementsError.message}
                              </div>
                            )
                          }

                          if (learningElementsLoading) {
                            return <div>Loading learning elements...</div>
                          }
                          if (learningElementsError) {
                            return (
                              <div>
                                Error loading learning elements:{' '}
                                {learningElementsError.message}
                              </div>
                            )
                          }

                          return (
                            <Modal
                              open={isSegmentModalOpen}
                              onClose={() => setIsSegmentModalOpen(false)}
                              trigger={
                                <Button
                                  disabled={
                                    period.segmentCount ===
                                    period.segments.length
                                  }
                                  className={{
                                    root: 'h-full w-12 font-bold text-gray-500',
                                  }}
                                  onClick={() => setIsSegmentModalOpen(true)}
                                  aria-label="Add segment"
                                  data={{ cy: 'add-segment' }}
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </Button>
                              }
                              title="Add Segment"
                              onSecondaryAction={() => {
                                newSegmentForm.resetForm()
                                setIsSegmentModalOpen(false)
                              }}
                              secondaryLabel="Discard"
                              onPrimaryAction={async () => {
                                await newSegmentForm.setFieldValue(
                                  'periodIx',
                                  period.index
                                )
                                await newSegmentForm.submitForm()
                              }}
                              primaryLabel="Submit"
                            >
                              <div className="flex w-1/2 flex-col gap-2">
                                <FormikMultiSelectField
                                  name="storyElements"
                                  label="Story Elements"
                                  options={storyElementsAll}
                                  placeholderCmdSearch="Search story elements..."
                                />
                                <FormikMultiSelectField
                                  name="learningElements"
                                  label="Learning Elements"
                                  options={learningElementsAll}
                                  placeholderCmdSearch="Search learning elements..."
                                />
                              </div>
                            </Modal>
                          )
                        }}
                      </Formik>
                    )}
                  </div>
                </div>
                <div
                  className={twMerge(
                    'flex flex-row items-center rounded border bg-gray-50 p-2 text-xl text-gray-300',
                    periodStatus === STATUS.RESULTS &&
                      'border-red-200 text-red-400'
                  )}
                >
                  <FontAwesomeIcon icon={faPauseCircle} />
                </div>
              </div>
            )
          })}

          <Formik
            initialValues={{
              periodName: 'Game Period',
              segmentCount: '4',
              seed: DEFAULT_SEED.toString(),
              targetInflation: DEFAULT_TARGET_INFLATION.toString(),
              naturalUnemployment: DEFAULT_NATURAL_UNEMPLOYMENT.toString(),
              lambda: DEFAULT_LAMBDA.toString(),
              initialInflation: DEFAULT_INITIAL_INFLATION.toString(),
              initialUnemployment: DEFAULT_INITIAL_UNEMPLOYMENT.toString(),
              initialGrowth: DEFAULT_INITIAL_GROWTH.toString(),
            }}
            onSubmit={async (variables, { resetForm }) => {
              const segmentCount: number = parseInt(variables.segmentCount)
              const seed = parseInt(variables.seed)
              const targetInflation = parseFloat(variables.targetInflation)
              const naturalUnemployment = parseFloat(
                variables.naturalUnemployment
              )
              const lambda = parseFloat(variables.lambda)
              const initialInflation = parseFloat(variables.initialInflation)
              const initialUnemployment = parseFloat(
                variables.initialUnemployment
              )
              const initialGrowth = parseFloat(variables.initialGrowth)
              await addGamePeriod.mutateAsync({
                gameId,
                facts: {
                  scenario: {
                    seed,
                    targetInflation,
                    naturalUnemployment,
                    lambda,
                    initialInflation,
                    initialUnemployment,
                    initialGrowth,
                  },
                },
                segmentCount,
              })
              resetForm()
            }}
          >
            {(newPeriodForm) => {
              const lastPeriod = game.periods[game.periods.length - 1]
              const disabled =
                lastPeriod &&
                lastPeriod.segmentCount !== lastPeriod.segments.length

              return (
                <Modal
                  open={isPeriodModalOpen}
                  onClose={() => setIsPeriodModalOpen(false)}
                  trigger={
                    <Button
                      disabled={disabled}
                      className={{ root: 'font-bold text-gray-500 md:w-48' }}
                      onClick={() => setIsPeriodModalOpen(true)}
                      aria-label="Add period"
                      data={{ cy: 'add-period' }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  }
                  title="Add Period"
                  onSecondaryAction={() => {
                    newPeriodForm.resetForm()
                    setIsPeriodModalOpen(false)
                  }}
                  secondaryLabel="Discard"
                  onPrimaryAction={async () => {
                    await newPeriodForm.setFieldValue(
                      'newPeriodIx',
                      game.periods.length
                    )
                    await newPeriodForm.submitForm()
                  }}
                  primaryLabel="Submit"
                >
                  <div className="flex w-1/2 flex-col gap-2">
                    <FormikTextField
                      name="periodName"
                      label="Period Name"
                      data={{ cy: 'period-name' }}
                      className={{ label: 'pb-2 font-normal' }}
                    />
                    <FormikNumberField
                      placeholder={newPeriodForm.values.segmentCount}
                      label="Number of segments"
                      name="segmentCount"
                      tooltip={
                        'One period corresponds to one year. The number of segments is used to compute the number of months in the period.'
                      }
                      required
                      data={{ cy: 'segment-count' }}
                      className={{ label: 'pb-2 font-normal' }}
                    />
                  </div>
                  <div className="mt-4">
                    <H3>Scenario Parameters</H3>
                    <div className="flex w-1/2 flex-col gap-2">
                      <FormikNumberField
                        placeholder={newPeriodForm.values.seed}
                        label="Seed"
                        name="seed"
                        tooltip={'Seed for randomness.'}
                        required
                        data={{ cy: 'seed' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <H4>Mandate Targets</H4>
                    <div className="flex w-1/2 gap-2">
                      <FormikNumberField
                        placeholder={newPeriodForm.values.targetInflation}
                        label="Target Inflation (%)"
                        name="targetInflation"
                        tooltip={'Default is 2.0%'}
                        required
                        data={{ cy: 'target-inflation' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        placeholder={newPeriodForm.values.naturalUnemployment}
                        label="Natural Unemployment (%)"
                        name="naturalUnemployment"
                        tooltip={'Default is 5.0%'}
                        required
                        data={{ cy: 'natural-unemployment' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        placeholder={newPeriodForm.values.lambda}
                        label="Weight Lambda"
                        name="lambda"
                        tooltip={'Default is 1.0'}
                        required
                        data={{ cy: 'lambda' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <H4>Initial Economic Conditions</H4>
                    <div className="flex w-1/2 gap-2">
                      <FormikNumberField
                        placeholder={newPeriodForm.values.initialInflation}
                        label="Initial Inflation (%)"
                        name="initialInflation"
                        tooltip={'Default is 4.0%'}
                        required
                        data={{ cy: 'initial-inflation' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        placeholder={newPeriodForm.values.initialUnemployment}
                        label="Initial Unemployment (%)"
                        name="initialUnemployment"
                        tooltip={'Default is 4.0%'}
                        required
                        data={{ cy: 'initial-unemployment' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        placeholder={newPeriodForm.values.initialGrowth}
                        label="Initial Growth (%)"
                        name="initialGrowth"
                        tooltip={'Default is 3.0%'}
                        required
                        data={{ cy: 'initial-growth' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                    </div>
                  </div>
                </Modal>
              )
            }}
          </Formik>
        </div>
      </div>
      <div className="mt-2 flex flex-row gap-2">
        {getButton()}
        <Link target="_blank" href={`/admin/reports/${game?.id}`}>
          <Button>Report</Button>
        </Link>
      </div>

      <div className="mt-4 flex w-full flex-row justify-between">
        <div className="w-1/2">
          <div className="font-bold">Players</div>
          <div className="mt-2 flex flex-col gap-4">
            {game.players.map((player, ix) => (
              <div key={player.id} data-cy={`player-${ix}`}>
                <PlayerCompact player={player} />
              </div>
            ))}
          </div>
        </div>

        <Formik
          initialValues={{ countdownSeconds: 300 }}
          onSubmit={(values) =>
            addCountdown.mutate({
              gameId,
              seconds: Number(values.countdownSeconds),
            })
          }
        >
          <Form>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Countdown</CardTitle>
                <CardDescription>
                  Set a countdown for the segment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div data-cy="countdown-seconds">
                  <FormikNumberField
                    name="countdownSeconds"
                    precision={0}
                    label="Countdown in seconds"
                    className={{ label: 'pb-2 font-normal' }}
                  />
                </div>
                {game.activePeriod?.activeSegment?.countdownExpiresAt?.toLocaleString()}
              </CardContent>
              <CardFooter>
                <Button type="submit">Set Countdown</Button>
              </CardFooter>
            </Card>
          </Form>
        </Formik>
      </div>
    </div>
  )
}

export default ManageGame
