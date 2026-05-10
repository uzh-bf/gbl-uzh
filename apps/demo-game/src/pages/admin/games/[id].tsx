import { faCalendar, faPauseCircle } from '@fortawesome/free-regular-svg-icons'
import {
  faCheck,
  faPause,
  faPlus,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameStatus } from '@prisma/client'
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
import { useCallback, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import PlayerCompact from '~/components/PlayerCompact'

import {
  STATUS,
  computePeriodStatus,
  computeSegmentStatus,
} from '@gbl-uzh/platform/dist/lib/util'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@uzh-bf/design-system/dist/future'
import { useToast } from '~/components/ui/use-toast'
import { trpc } from '~/lib/trpc'

import { FormikMultiSelectField } from '~/components/fields/FormikMultiSelectField'
import {
  DEFAULT_SEED,
  GAP_BONDS,
  GAP_STOCKS,
  INTEREST_BANK,
  TREND_BONDS,
  TREND_STOCKS,
} from '~/types/Period'

type PeriodFacts = {
  spotTradingEnabled?: boolean
  futuresTradingEnabled?: boolean
  optionsTradingEnabled?: boolean
  scenario?: {
    trendBonds?: number
    gapBonds?: number
    trendStocks?: number
    gapStocks?: number
    interestBank?: number
    seed?: number
  }
}

type SegmentFacts = {
  diceRolls?: Array<{
    bonds?: number
    stocks?: number
    shared?: number
  }>
}

function ManageGame() {
  const router = useRouter()
  const trpcUtils = trpc.useUtils()

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
    {
      enabled: hasGameId,
      refetchInterval: hasGameId ? 15000 : false,
    }
  )

  const {
    data: learningElementsData = [],
    error: learningElementsError,
    isLoading: learningElementsLoading,
  } = trpc.learning.list.useQuery(undefined, { enabled: hasGameId })

  const {
    data: storyElementsData = [],
    error: storyElementsError,
    isLoading: storyElementsLoading,
  } = trpc.story.list.useQuery(undefined, { enabled: hasGameId })

  const { toast } = useToast()

  const invalidateGameById = useCallback(async () => {
    if (!hasGameId) return
    await trpcUtils.game.byId.invalidate({ id: gameId })
  }, [gameId, hasGameId, trpcUtils])

  const scrollToActivePeriod = useCallback(() => {
    const anchor = document.querySelector('#active-period')
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const nextPeriod = trpc.game.activateNextPeriod.useMutation({
    async onSuccess() {
      scrollToActivePeriod()
      await invalidateGameById()
    },
  })

  const nextSegment = trpc.game.activateNextSegment.useMutation({
    async onSuccess() {
      scrollToActivePeriod()
      await invalidateGameById()
    },
  })

  const addGamePeriod = trpc.period.add.useMutation({
    async onSuccess() {
      await invalidateGameById()
    },
  })

  const addPeriodSegment = trpc.segment.add.useMutation({
    async onSuccess() {
      await invalidateGameById()
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
    onError: (err) => {
      toast({
        title: 'Countdown failed',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  useEffect(() => {
    if (game?.status !== GameStatus.RUNNING) return

    const allPlayersReady = game.players.every((player) => player.isReady)
    if (allPlayersReady) {
      toast({
        title: 'All players are ready!',
        description: 'All players are ready to continue.',
      })

      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch((err) => {
        alert('Autoplay restrictions. Please enable autoplay in your browser.')
        console.error('Error playing notification sound:', err)
      })
    }
  }, [game?.players, toast])

  const nextPeriodFn = async () => {
    if (!hasGameId) return
    await nextPeriod.mutateAsync({ gameId })
  }

  const nextSegmentFn = async () => {
    if (!hasGameId) return
    await nextSegment.mutateAsync({ gameId })
  }

  const getButton = useCallback(() => {
    if (!game) return null
    const activePeriod = game?.activePeriod
    const segments = activePeriod?.segments ?? []
    const activeSegmentIx = activePeriod?.activeSegmentIx ?? -1

    switch (game.status) {
      case GameStatus.PREPARATION: {
        const atLastSegment = activeSegmentIx >= segments.length - 1
        if (!atLastSegment) {
          return (
            <Button disabled={nextSegment.isPending} onClick={nextSegmentFn}>
              Next Segment
            </Button>
          )
        }
        const disabled =
          game.periods.length === 0 || activePeriod.segments.length === 0
        return (
          <Button disabled={disabled} onClick={nextPeriodFn}>
            Start Period
          </Button>
        )
      }
      case GameStatus.SCHEDULED:
        if (!activePeriod) {
          const disabled =
            game.periods.length === 0 || game.periods[0].segments.length === 0
          return (
            <Button disabled={disabled} onClick={nextPeriodFn}>
              Start Period
            </Button>
          )
        }
        return <Button onClick={nextPeriodFn}>Start Segment</Button>
      case GameStatus.RUNNING: {
        const atLastSegment =
          activeSegmentIx >= segments.length - 1 &&
          activePeriod.segmentCount === segments.length
        if (atLastSegment) {
          return (
            <Button disabled={nextPeriod.isPending} onClick={nextPeriodFn}>
              Consolidate
            </Button>
          )
        }
        // Currently we need to disable the button if the next segment is not
        // available
        const disabled = activePeriod.activeSegmentIx === segments.length - 1
        return (
          <Button
            disabled={nextSegment.isPending || disabled}
            onClick={nextSegmentFn}
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
            onClick={nextSegmentFn}
          >
            Next Segment
          </Button>
        )
      }

      // TODO(JJ):
      // - Fix consolidation for the last period
      // - const periods = game?.periods
      //   const activePeriodIx = game?.activePeriodIx
      //   const atLastPeriodIx = activePeriodIx >= periods.length - 1
      case GameStatus.CONSOLIDATION:
        return (
          <Button disabled={nextPeriod.isPending} onClick={nextPeriodFn}>
            Period Results
          </Button>
        )
      case GameStatus.RESULTS: {
        const anotherPeriod = game.activePeriodIx > game.periods.length - 1
        return (
          <Button disabled={anotherPeriod} onClick={nextPeriodFn}>
            Next Period
          </Button>
        )
      }

      case GameStatus.COMPLETED:
        return (
          <Button disabled onClick={() => null}>
            Completed
          </Button>
        )
      default:
        return null
    }
  }, [
    game,
    nextPeriod.isPending,
    nextSegment.isPending,
    nextPeriodFn,
    nextSegmentFn,
  ])

  if (gameLoading || !game) {
    return <div>loading...</div>
  }

  if (gameError) {
    return <div>{gameError.message}</div>
  }

  const learningElementsAll = (learningElementsData ?? []).map((e) => ({
    label: e.id,
    value: e.id,
  }))

  const storyElementsAll = (storyElementsData ?? []).map((e) => ({
    label: e.id,
    value: e.id,
  }))

  return (
    <div className="p-4">
      <div>
        <div className="mb-4 flex flex-col gap-2 overflow-x-auto md:flex-row">
          {game.periods.map((period, ix) => {
            const periodStatus = computePeriodStatus(game as any, ix)

            const periodFacts = period.facts as PeriodFacts
            const scenario = periodFacts.scenario ?? {}
            const labels = [
              periodFacts.spotTradingEnabled && 'S',
              periodFacts.futuresTradingEnabled && 'F',
              periodFacts.optionsTradingEnabled && 'O',
            ].filter(Boolean)

            const isPeriodPlanned = periodStatus === STATUS.SCHEDULED
            const isPeriodPaused = periodStatus === STATUS.PAUSED
            const isPeriodActive = periodStatus === STATUS.ACTIVE
            const isPeriodCompleted =
              periodStatus === STATUS.COMPLETED ||
              periodStatus === STATUS.RESULTS

            const trendBonds = scenario.trendBonds ?? 0
            const gapBonds = scenario.gapBonds ?? 0
            const trendStocks = scenario.trendStocks ?? 0
            const gapStocks = scenario.gapStocks ?? 0
            const savingsInterest = scenario.interestBank ?? 0
            const seed = scenario.seed ?? 0

            return (
              <div
                className="flex flex-row gap-2"
                key={period.id}
                id={isPeriodActive ? 'active-period' : undefined}
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
                    <div className="flex flex-row gap-1">
                      {labels.map((label) => (
                        <div
                          className="rounded border px-1 font-bold text-slate-600"
                          key={label}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="flex flex-col justify-end gap-1">
                        <div className="flex items-end justify-between gap-4 pr-2">
                          <div className="text-nowrap">Seed</div>
                          <div>{seed}</div>
                        </div>
                        <div className="flex items-end justify-between gap-4 pr-2">
                          <div className="text-nowrap">Saving Interest</div>
                          <div>{savingsInterest}</div>
                        </div>
                      </div>
                      <Table className="border-l text-base">
                        <TableHeader>
                          <TableRow className="border-none py-0">
                            <TableHead></TableHead>
                            <TableHead className="py-0">Trend</TableHead>
                            <TableHead className="py-0">Gap</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="border-none py-0">
                            <TableCell className="py-0">Bonds</TableCell>
                            <TableCell className="py-0">{trendBonds}</TableCell>
                            <TableCell className="py-0">{gapBonds}</TableCell>
                          </TableRow>
                          <TableRow className="border-none py-0">
                            <TableCell className="py-0">Stocks</TableCell>
                            <TableCell className="py-0">
                              {trendStocks}
                            </TableCell>
                            <TableCell className="py-0">{gapStocks}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-row gap-1">
                    {Array.apply(null, Array(period.segmentCount)).map(
                      (_, ix) => {
                        const segment = period.segments[ix]
                        const segmentStatus = computeSegmentStatus(
                          game as any,
                          period as any,
                          ix
                        )

                        const isSegmentActive =
                          periodStatus === STATUS.ACTIVE &&
                          segmentStatus === STATUS.ACTIVE
                        const isSegmentCompleted =
                          periodStatus === STATUS.COMPLETED ||
                          segmentStatus === STATUS.COMPLETED

                        const segmentFacts = segment?.facts as
                          | SegmentFacts
                          | undefined
                        const diceBonds = segmentFacts?.diceRolls?.map(
                          (dice) => dice.bonds
                        )
                        const diceStocks = segmentFacts?.diceRolls?.map(
                          (dice) => dice.stocks
                        )
                        const diceShared = segmentFacts?.diceRolls?.map(
                          (dice) => dice.shared
                        )

                        const dataToEncode = {
                          diceBonds,
                          diceShared,
                          diceStocks,
                          trendBonds,
                          gapBonds,
                          trendStocks,
                          gapStocks,
                        }
                        const encoded = btoa(JSON.stringify(dataToEncode))

                        return (
                          <div
                            className={twMerge(
                              'flex-initial rounded border p-2 text-center',
                              (!segment || isSegmentCompleted) &&
                                'bg-gray-100 text-gray-400',
                              isSegmentActive && 'border-green-600 bg-green-100'
                            )}
                            key={ix}
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
                                  Story: {segment?.storyElements.length ?? 0}
                                </div>
                                <div className="text-sm">
                                  Learn: {segment?.learningElements.length ?? 0}
                                </div>
                              </div>
                            </div>

                            {segment && (
                              <Link
                                href={`/admin/dice/${segment.id}/${encoded}`}
                                target="_blank"
                                className="flex flex-col rounded border border-gray-300 p-2"
                              >
                                <div className="flex justify-between text-nowrap">
                                  Dice Bonds:
                                  <div className="flex flex-row gap-2">
                                    {diceBonds?.map((dice, ix) => (
                                      <div key={ix}>{dice}</div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-between gap-2 text-nowrap">
                                  Dice Stocks:
                                  <div className="flex flex-row gap-2">
                                    {diceStocks?.map((dice, ix) => (
                                      <div key={ix}>{dice}</div>
                                    ))}
                                  </div>
                                </div>
                              </Link>
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
                          if (learningElementsLoading) {
                            return <div>Loading learning elements...</div>
                          }
                          if (learningElementsError) {
                            return (
                              <div>
                                Error loading story elements:{' '}
                                {learningElementsError.message}
                              </div>
                            )
                          }
                          if (storyElementsError) {
                            return (
                              <div>
                                Error loading story elements:{' '}
                                {storyElementsError.message}
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
                                  data={{ cy: 'add-segment' }}
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </Button>
                              }
                              title="Add Segment"
                              onSecondaryAction={
                                <Button
                                  onClick={() => {
                                    newSegmentForm.resetForm()
                                    setIsSegmentModalOpen(false)
                                  }}
                                >
                                  Discard
                                </Button>
                              }
                              onPrimaryAction={
                                <Button
                                  onClick={async () => {
                                    await newSegmentForm.setFieldValue(
                                      'periodIx',
                                      period.index
                                    )
                                    newSegmentForm.handleSubmit()
                                    setIsSegmentModalOpen(false)
                                  }}
                                >
                                  Submit
                                </Button>
                              }
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
              interestBank: INTEREST_BANK.toString(),
              trendBonds: TREND_BONDS.toString(),
              gapBonds: GAP_BONDS.toString(),
              trendStocks: TREND_STOCKS.toString(),
              gapStocks: GAP_STOCKS.toString(),
            }}
            onSubmit={async (variables, { resetForm }) => {
              const segmentCount: number = parseInt(variables.segmentCount)
              const seed = parseInt(variables.seed)
              const interestBank = parseFloat(variables.interestBank)
              const trendBonds = parseFloat(variables.trendBonds)
              const gapBonds = parseFloat(variables.gapBonds)
              const trendStocks = parseFloat(variables.trendStocks)
              const gapStocks = parseFloat(variables.gapStocks)
              await addGamePeriod.mutateAsync({
                gameId,
                facts: {
                  scenario: {
                    seed,
                    interestBank,
                    trendBonds,
                    gapBonds,
                    trendStocks,
                    gapStocks,
                  },
                },
                segmentCount: segmentCount,
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
                      data={{ cy: 'add-period' }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  }
                  title="Add Period"
                  onSecondaryAction={
                    <Button
                      onClick={() => {
                        newPeriodForm.resetForm()
                        setIsPeriodModalOpen(false)
                      }}
                    >
                      Discard
                    </Button>
                  }
                  onPrimaryAction={
                    <Button
                      onClick={async () => {
                        await newPeriodForm.setFieldValue(
                          'newPeriodIx',
                          game.periods.length
                        )
                        newPeriodForm.handleSubmit()
                        setIsPeriodModalOpen(false)
                      }}
                    >
                      Submit
                    </Button>
                  }
                >
                  <div className="flex w-1/2 flex-col gap-2">
                    <FormikTextField
                      type="string"
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
                        tooltip={'Seed ....'}
                        required
                        data={{ cy: 'seed' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <H4>Bank</H4>
                    <div className="flex w-1/2 flex-col gap-2">
                      <FormikNumberField
                        placeholder={newPeriodForm.values.interestBank}
                        label="Saving Interest"
                        name="interestBank"
                        tooltip={'Saving interest ....'}
                        required
                        data={{ cy: 'saving-interest' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <H4>Bonds</H4>
                    <div className="flex w-1/2 gap-2">
                      <FormikNumberField
                        placeholder={newPeriodForm.values.trendBonds}
                        label="Trend"
                        name="trendBonds"
                        tooltip={'Trend is the expectation value.'}
                        required
                        data={{ cy: 'trend-bonds' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        placeholder={newPeriodForm.values.gapBonds}
                        label="Gap"
                        name="gapBonds"
                        tooltip={'TODO.'}
                        required
                        data={{ cy: 'gap-bonds' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <H4>Stocks</H4>
                    <div className="flex w-1/2 gap-2">
                      <FormikNumberField
                        placeholder={newPeriodForm.values.trendStocks}
                        label="Trend"
                        name="trendStocks"
                        tooltip={'Trend is the expectation value.'}
                        required
                        data={{ cy: 'trend-stocks' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        placeholder={newPeriodForm.values.gapStocks}
                        label="Gap"
                        name="gapStocks"
                        tooltip={'TODO.'}
                        required
                        data={{ cy: 'gap-stocks' }}
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
                <PlayerCompact player={player as any} />
              </div>
            ))}
          </div>
        </div>

        <Formik
          initialValues={{ countdownSeconds: 300 }}
          onSubmit={async (values) => {
            await addCountdown.mutateAsync({
              gameId,
              seconds: Number(values.countdownSeconds),
            })
          }}
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
                <FormikNumberField
                  name="countdownSeconds"
                  precision={0}
                  label="Countdown in seconds"
                  className={{ label: 'pb-2 font-normal' }}
                />
                {/* TODO(JJ): @RS Do we want to show the following? If no we
                  we can remove the refetchQueries.
                */}
                {game?.activePeriod?.activeSegment
                  ?.countdownExpiresAt instanceof Date
                  ? game?.activePeriod?.activeSegment?.countdownExpiresAt?.toLocaleString()
                  : game?.activePeriod?.activeSegment?.countdownExpiresAt}
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
