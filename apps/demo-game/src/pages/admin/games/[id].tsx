import { faCalendar, faPauseCircle } from '@fortawesome/free-regular-svg-icons'
import {
  faCheck,
  faPause,
  faPlus,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MultiSelect } from '@gbl-uzh/ui'
import { GameStatus } from '@prisma/client'
import { Button, H3, H4, Modal } from '@uzh-bf/design-system'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

import {
  PlayerCompact,
  STATUS,
  computePeriodStatus,
  computeSegmentStatus,
} from '@gbl-uzh/ui'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'
import { useToast } from '~/components/ui/use-toast'
import { trpc } from '~/lib/trpc'

import { AdminInputField } from '~/components/fields/AdminInputField'
import {
  DEFAULT_SEED,
  GAP_BONDS,
  GAP_STOCKS,
  INTEREST_BANK,
  type PeriodFacts,
  type PeriodSegmentFacts,
  TREND_BONDS,
  TREND_STOCKS,
} from '~/types/Period'

function scrollToActivePeriod() {
  const anchor = document.querySelector('#active-period')
  if (anchor) {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

interface PeriodFormValues {
  segmentCount: number
  seed: number
  interestBank: number
  trendBonds: number
  gapBonds: number
  trendStocks: number
  gapStocks: number
}

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

  async function invalidateGameById() {
    if (!hasGameId) return
    await utils.game.byId.invalidate({ id: gameId })
  }

  const nextPeriod = trpc.game.activateNextPeriod.useMutation({
    async onSuccess() {
      scrollToActivePeriod()
      await invalidateGameById()
    },
    onError: (err) => {
      toast({
        title: 'Could not advance the game',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const {
    control: segmentControl,
    handleSubmit: handleSegmentSubmit,
    reset: resetSegment,
    setValue: setSegmentValue,
  } = useForm({
    defaultValues: {
      periodIx: -1,
      storyElements: [] as string[],
      learningElements: [] as string[],
    },
  })

  const {
    register: registerPeriod,
    handleSubmit: handlePeriodSubmit,
    reset: resetPeriod,
    formState: { errors: errorsPeriod },
  } = useForm<PeriodFormValues>({
    defaultValues: {
      segmentCount: 4,
      seed: DEFAULT_SEED,
      interestBank: INTEREST_BANK,
      trendBonds: TREND_BONDS,
      gapBonds: GAP_BONDS,
      trendStocks: TREND_STOCKS,
      gapStocks: GAP_STOCKS,
    },
  })

  const {
    register: registerCountdown,
    handleSubmit: handleCountdownSubmit,
    formState: { errors: errorsCountdown },
  } = useForm({
    defaultValues: {
      countdownSeconds: 300,
    },
  })

  const onSegmentSubmit = async (values: {
    periodIx: number
    storyElements: string[]
    learningElements: string[]
  }) => {
    await addPeriodSegment.mutateAsync({
      gameId,
      periodIx: values.periodIx,
      facts: {},
      storyElements: values.storyElements,
      learningElements: values.learningElements,
    })
    resetSegment()
  }

  const onPeriodSubmit = async (values: PeriodFormValues) => {
    await addGamePeriod.mutateAsync({
      gameId,
      facts: {
        scenario: {
          seed: Math.trunc(values.seed),
          interestBank: values.interestBank,
          trendBonds: values.trendBonds,
          gapBonds: values.gapBonds,
          trendStocks: values.trendStocks,
          gapStocks: values.gapStocks,
        },
      },
      segmentCount: Math.trunc(values.segmentCount),
    })
    resetPeriod()
  }

  const onCountdownSubmit = async (values: { countdownSeconds: number }) => {
    await addCountdown.mutateAsync({
      gameId,
      seconds: Number(values.countdownSeconds),
    })
  }

  const nextSegment = trpc.game.activateNextSegment.useMutation({
    async onSuccess() {
      scrollToActivePeriod()
      await invalidateGameById()
    },
    onError: (err) => {
      toast({
        title: 'Could not advance the game',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const addGamePeriod = trpc.period.add.useMutation({
    async onSuccess() {
      // Close only after the create succeeds. On failure the modal stays open
      // (via onError) so the admin can retry without losing their input.
      setIsPeriodModalOpen(false)
      await invalidateGameById()
    },
    onError: (err) => {
      toast({
        title: 'Could not add the period',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const addPeriodSegment = trpc.segment.add.useMutation({
    async onSuccess() {
      setIsSegmentModalOpen(false)
      await invalidateGameById()
    },
    onError: (err) => {
      toast({
        title: 'Could not add the segment',
        description: err.message,
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
    onError: (err) => {
      toast({
        title: 'Countdown failed',
        description: err.message,
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
      audio.play().catch((err) => {
        alert('Autoplay restrictions. Please enable autoplay in your browser.')
        console.error('Error playing notification sound:', err)
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

  function renderActionButton() {
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
        // Currently we need to disable the button if the next segment is not
        // available
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

      // TODO(JJ):
      // - Fix consolidation for the last period
      // - const periods = game?.periods
      //   const activePeriodIx = game?.activePeriodIx
      //   const atLastPeriodIx = activePeriodIx >= periods.length - 1
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
        return (
          <Button disabled onClick={() => null}>
            Completed
          </Button>
        )
      default:
        return null
    }
  }

  if (gameError) {
    return <div>{gameError.message}</div>
  }

  if (gameLoading || !game) {
    return <div>loading...</div>
  }

  const learningElementsAll = learningElementsData.map((e) => ({
    label: e.id,
    value: e.id,
  }))

  const storyElementsAll = storyElementsData.map((e) => ({
    label: e.id,
    value: e.id,
  }))
  const countdownExpiresAt =
    game.activePeriod?.activeSegment?.countdownExpiresAt

  return (
    <div className="p-4" data-cy="game-detail" data-game-status={game.status}>
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
                    {Array.from({ length: period.segmentCount }, (_, ix) => {
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
                        | PeriodSegmentFacts
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
                            <div>
                              Segment{' '}
                              {segment?.index !== undefined
                                ? segment.index + 1
                                : ''}
                            </div>
                          </div>
                          <div className="my-2">
                            <div className="flex flex-row gap-2">
                              <div className="text-sm">
                                Story: {segment?.storyElements?.length ?? 0}
                              </div>
                              <div className="text-sm">
                                Learn: {segment?.learningElements?.length ?? 0}
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
                    })}
                    {!isPeriodCompleted && game.periods.length - 1 === ix && (
                      <>
                        {storyElementsLoading || learningElementsLoading ? (
                          <div>Loading...</div>
                        ) : storyElementsError || learningElementsError ? (
                          <div>
                            Error loading elements:{' '}
                            {storyElementsError?.message ||
                              learningElementsError?.message}
                          </div>
                        ) : (
                          <Modal
                            open={isSegmentModalOpen}
                            onClose={() => setIsSegmentModalOpen(false)}
                            trigger={
                              <Button
                                disabled={
                                  period.segmentCount === period.segments.length
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
                              resetSegment()
                              setIsSegmentModalOpen(false)
                            }}
                            secondaryLabel="Discard"
                            onPrimaryAction={() => {
                              setSegmentValue('periodIx', period.index)
                              // Modal is closed by the mutation's onSuccess so
                              // a failed submit keeps it open and recoverable.
                              handleSegmentSubmit(onSegmentSubmit)()
                            }}
                            primaryLabel="Submit"
                          >
                            <div className="flex w-1/2 flex-col gap-2">
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-normal text-gray-700">
                                  Story Elements
                                </span>
                                <Controller
                                  control={segmentControl}
                                  name="storyElements"
                                  render={({ field }) => (
                                    <MultiSelect
                                      options={storyElementsAll}
                                      value={field.value}
                                      onChange={field.onChange}
                                      searchPlaceholder="Search story elements..."
                                    />
                                  )}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-normal text-gray-700">
                                  Learning Elements
                                </span>
                                <Controller
                                  control={segmentControl}
                                  name="learningElements"
                                  render={({ field }) => (
                                    <MultiSelect
                                      options={learningElementsAll}
                                      value={field.value}
                                      onChange={field.onChange}
                                      searchPlaceholder="Search learning elements..."
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </Modal>
                        )}
                      </>
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

          {(() => {
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
                  resetPeriod()
                  setIsPeriodModalOpen(false)
                }}
                secondaryLabel="Discard"
                onPrimaryAction={() => {
                  // Modal is closed by the mutation's onSuccess so a failed
                  // submit keeps it open and recoverable.
                  handlePeriodSubmit(onPeriodSubmit)()
                }}
                primaryLabel="Submit"
              >
                <div className="flex w-1/2 flex-col gap-2">
                  <AdminInputField
                    label="Number of segments"
                    name="segmentCount"
                    type="number"
                    tooltip={
                      'One period corresponds to one year. The number of segments is used to compute the number of months in the period.'
                    }
                    required
                    register={registerPeriod}
                    error={errorsPeriod.segmentCount}
                  />
                </div>
                <div className="mt-4">
                  <H3>Scenario Parameters</H3>
                  <div className="flex w-1/2 flex-col gap-2">
                    <AdminInputField
                      label="Seed"
                      name="seed"
                      type="number"
                      tooltip={'Seed ....'}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.seed}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <H4>Bank</H4>
                  <div className="flex w-1/2 flex-col gap-2">
                    <AdminInputField
                      label="Saving Interest"
                      name="interestBank"
                      type="number"
                      step={0.0001}
                      tooltip={'Saving interest ....'}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.interestBank}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <H4>Bonds</H4>
                  <div className="flex w-1/2 gap-2">
                    <AdminInputField
                      label="Trend"
                      name="trendBonds"
                      type="number"
                      step={0.0001}
                      tooltip={'Trend is the expectation value.'}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.trendBonds}
                    />
                    <AdminInputField
                      label="Gap"
                      name="gapBonds"
                      type="number"
                      step={0.0001}
                      tooltip={'TODO.'}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.gapBonds}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <H4>Stocks</H4>
                  <div className="flex w-1/2 gap-2">
                    <AdminInputField
                      label="Trend"
                      name="trendStocks"
                      type="number"
                      step={0.0001}
                      tooltip={'Trend is the expectation value.'}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.trendStocks}
                    />
                    <AdminInputField
                      label="Gap"
                      name="gapStocks"
                      type="number"
                      step={0.0001}
                      tooltip={'TODO.'}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.gapStocks}
                    />
                  </div>
                </div>
              </Modal>
            )
          })()}
        </div>
      </div>
      <div className="mt-2 flex flex-row gap-2">
        {renderActionButton()}
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

        <form onSubmit={handleCountdownSubmit(onCountdownSubmit)}>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Countdown</CardTitle>
              <CardDescription>
                Set a countdown for the segment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div data-cy="countdown-seconds">
                <AdminInputField
                  label="Countdown in seconds"
                  name="countdownSeconds"
                  type="number"
                  register={registerCountdown}
                  error={errorsCountdown.countdownSeconds}
                  required
                />
              </div>
              {countdownExpiresAt?.toLocaleString()}
            </CardContent>
            <CardFooter>
              <Button type="submit">Set Countdown</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default ManageGame
