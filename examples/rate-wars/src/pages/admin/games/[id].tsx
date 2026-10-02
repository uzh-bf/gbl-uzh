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
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'

import { FormikMultiSelectField } from '~/components/fields/FormikMultiSelectField'
import { useToast } from '~/components/ui/use-toast'
import { getFacts } from '~/lib/facts'
import { trpc } from '~/lib/trpc'
import {
  DEFAULT_BASE_DEFAULT_RATE,
  DEFAULT_CENTRAL_BANK_RATE,
  DEFAULT_DEPOSIT_POOL,
  DEFAULT_DEPOSIT_SENSITIVITY,
  DEFAULT_FIXED_COST,
  DEFAULT_LOAN_DEMAND,
  DEFAULT_LOAN_SENSITIVITY,
  DEFAULT_LOSS_GIVEN_DEFAULT,
  DEFAULT_SEED,
  DEFAULT_SHOCK_SCALE,
  type PeriodFacts,
  type PeriodSegmentFacts,
} from '~/types/Period'

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
    onError: (err) => {
      toast({
        title: 'Could not advance the game',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

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
      setIsPeriodModalOpen(false)
      await invalidateGameById()
    },
    onError: (err) => {
      toast({
        title: 'Could not add the year',
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
        title: 'Could not add the decision round',
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
    onError: (err) =>
      toast({
        title: 'Countdown failed',
        description: err.message,
        variant: 'destructive',
      }),
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

  function getButton() {
    if (!game) return null
    const activePeriod = game?.activePeriod
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
        return (
          <Button disabled onClick={() => null}>
            Completed
          </Button>
        )
    }
  }

  if (gameLoading || !game) {
    return <div>loading...</div>
  }

  if (gameError) {
    return <div>{gameError.message}</div>
  }

  const learningElementsAll = learningElementsData.map((e) => ({
    label: e.id,
    value: e.id,
  }))

  const storyElementsAll = storyElementsData.map((e) => ({
    label: e.id,
    value: e.id,
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
                      <div className="font-bold">Year {period.index + 1}</div>
                      {isPeriodActive && <div>{game.status}</div>}
                    </div>
                    <Table className="text-sm">
                      <TableBody>
                        <TableRow className="border-none py-0">
                          <TableCell className="py-0">CB rate</TableCell>
                          <TableCell className="py-0 text-right">
                            {scenario.centralBankRate}%
                          </TableCell>
                          <TableCell className="py-0">Seed</TableCell>
                          <TableCell className="py-0 text-right">
                            {scenario.seed}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-none py-0">
                          <TableCell className="py-0">Deposits</TableCell>
                          <TableCell className="py-0 text-right">
                            {scenario.depositPool}
                          </TableCell>
                          <TableCell className="py-0">Loans</TableCell>
                          <TableCell className="py-0 text-right">
                            {scenario.loanDemand}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-none py-0">
                          <TableCell className="py-0">Default</TableCell>
                          <TableCell className="py-0 text-right">
                            {scenario.baseDefaultRate}%
                          </TableCell>
                          <TableCell className="py-0">Shock ±</TableCell>
                          <TableCell className="py-0 text-right">
                            {scenario.shockScale}pp
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-1 flex flex-row gap-1">
                    {Array.apply(null, Array(period.segmentCount ?? 0)).map(
                      (_, ix) => {
                        const segment = period.segments[ix]
                        const segmentFacts = getFacts(
                          segment?.facts
                        ) as Partial<PeriodSegmentFacts>
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
                                Decision round{' '}
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
                                  Learn:{' '}
                                  {segment?.learningElements?.length ?? 0}
                                </div>
                              </div>
                            </div>

                            {segment && (
                              <div className="flex flex-col rounded border border-gray-300 p-2 text-sm">
                                <div className="flex justify-between gap-2 text-nowrap">
                                  <span>Realized default:</span>
                                  <span className="font-bold">
                                    {segmentFacts.realizedDefaultRate?.toFixed(
                                      2
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2 text-nowrap">
                                  <span>Shock:</span>
                                  <span>
                                    {(segmentFacts.defaultShock ?? 0) >= 0
                                      ? '+'
                                      : ''}
                                    {segmentFacts.defaultShock?.toFixed(2)}pp
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
                          shockOverride: '',
                          storyElements: [],
                          learningElements: [],
                        }}
                        onSubmit={async (variables, { resetForm }) => {
                          const shockOverride =
                            variables.shockOverride === ''
                              ? null
                              : parseFloat(variables.shockOverride)
                          await addPeriodSegment.mutateAsync({
                            gameId,
                            periodIx: variables.periodIx,
                            facts: { shockOverride },
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
                              title="Add Decision Round"
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
                                <FormikTextField
                                  name="shockOverride"
                                  label="Default shock override (±pp, optional)"
                                  placeholder="leave empty for seeded shock"
                                  data={{ cy: 'shock-override' }}
                                  className={{ label: 'pb-2 font-normal' }}
                                />
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
              periodName: 'Year',
              segmentCount: '1',
              seed: DEFAULT_SEED.toString(),
              centralBankRate: DEFAULT_CENTRAL_BANK_RATE.toString(),
              depositPool: DEFAULT_DEPOSIT_POOL.toString(),
              loanDemand: DEFAULT_LOAN_DEMAND.toString(),
              depositSensitivity: DEFAULT_DEPOSIT_SENSITIVITY.toString(),
              loanSensitivity: DEFAULT_LOAN_SENSITIVITY.toString(),
              baseDefaultRate: DEFAULT_BASE_DEFAULT_RATE.toString(),
              shockScale: DEFAULT_SHOCK_SCALE.toString(),
              lossGivenDefault: DEFAULT_LOSS_GIVEN_DEFAULT.toString(),
              fixedCost: DEFAULT_FIXED_COST.toString(),
            }}
            onSubmit={async (variables, { resetForm }) => {
              await addGamePeriod.mutateAsync({
                gameId,
                facts: {
                  scenario: {
                    seed: parseInt(variables.seed),
                    centralBankRate: parseFloat(variables.centralBankRate),
                    depositPool: parseFloat(variables.depositPool),
                    loanDemand: parseFloat(variables.loanDemand),
                    depositSensitivity: parseFloat(
                      variables.depositSensitivity
                    ),
                    loanSensitivity: parseFloat(variables.loanSensitivity),
                    baseDefaultRate: parseFloat(variables.baseDefaultRate),
                    shockScale: parseFloat(variables.shockScale),
                    lossGivenDefault: parseFloat(variables.lossGivenDefault),
                    fixedCost: parseFloat(variables.fixedCost),
                  },
                },
                segmentCount: parseInt(variables.segmentCount),
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
                  title="Add Year"
                  onSecondaryAction={() => {
                    newPeriodForm.resetForm()
                    setIsPeriodModalOpen(false)
                  }}
                  secondaryLabel="Discard"
                  onPrimaryAction={async () => {
                    await newPeriodForm.submitForm()
                  }}
                  primaryLabel="Submit"
                >
                  <div className="flex w-1/2 flex-col gap-2">
                    <FormikTextField
                      name="periodName"
                      label="Year Name"
                      data={{ cy: 'period-name' }}
                      className={{ label: 'pb-2 font-normal' }}
                    />
                    <FormikNumberField
                      placeholder="1"
                      label="Decision rounds (keep 1)"
                      name="segmentCount"
                      tooltip="Rate Wars clears the market once per year; one decision round per year is the intended setup."
                      required
                      data={{ cy: 'segment-count' }}
                      className={{ label: 'pb-2 font-normal' }}
                    />
                  </div>
                  <div className="mt-4">
                    <H3>Economy (game-master tunables)</H3>
                    <div className="grid grid-cols-2 gap-2">
                      <FormikNumberField
                        label="Central bank rate (%)"
                        name="centralBankRate"
                        tooltip="Earned on funds banks do not lend out. Anchor of the rate corridor."
                        required
                        data={{ cy: 'central-bank-rate' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Seed"
                        name="seed"
                        tooltip="Same seed = same default shock. Change per period."
                        required
                        data={{ cy: 'seed' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Deposit pool"
                        name="depositPool"
                        tooltip="Total savings distributed across banks by deposit-rate attractiveness."
                        required
                        data={{ cy: 'deposit-pool' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Loan demand"
                        name="loanDemand"
                        tooltip="Total borrowing demand distributed across banks by loan-rate attractiveness. Lower it for a credit crunch."
                        required
                        data={{ cy: 'loan-demand' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Deposit sensitivity"
                        name="depositSensitivity"
                        tooltip="How aggressively savers chase rates (per percentage point). Higher = more winner-take-all."
                        required
                        data={{ cy: 'deposit-sensitivity' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Loan sensitivity"
                        name="loanSensitivity"
                        tooltip="How aggressively borrowers avoid expensive loans."
                        required
                        data={{ cy: 'loan-sensitivity' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Base default rate (%)"
                        name="baseDefaultRate"
                        tooltip="Expected share of loans that default. Raise it for a recession."
                        required
                        data={{ cy: 'base-default-rate' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Shock scale (±pp)"
                        name="shockScale"
                        tooltip="Amplitude of the seeded random default shock."
                        required
                        data={{ cy: 'shock-scale' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Loss given default (0-1)"
                        name="lossGivenDefault"
                        tooltip="Fraction of a defaulted loan that is lost."
                        required
                        data={{ cy: 'loss-given-default' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        label="Fixed cost"
                        name="fixedCost"
                        tooltip="Operating cost per year — makes doing nothing unprofitable."
                        required
                        data={{ cy: 'fixed-cost' }}
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
                  Set a countdown for the decision round.
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
