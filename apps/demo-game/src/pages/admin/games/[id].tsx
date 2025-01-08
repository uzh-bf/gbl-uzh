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
import { Formik } from 'formik'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { twMerge } from 'tailwind-merge'

import PlayerCompact from '~/components/PlayerCompact'

import { useMutation, useQuery } from '@apollo/client'
import {
  computePeriodStatus,
  computeSegmentStatus,
  STATUS,
} from '@gbl-uzh/platform/dist/lib/util'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivateNextPeriodDocument,
  ActivateNextSegmentDocument,
  AddGamePeriodDocument,
  AddPeriodSegmentDocument,
  Game,
  GameDocument,
  GameStatus,
  LearningElementsDocument,
  Period,
  Player,
  StoryElementsDocument,
} from 'src/graphql/generated/ops'

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

import { FormikMultiSelectField } from '~/components/fields/FormikMultiSelectField'

import {
  DEFAULT_SEED,
  GAP_BONDS,
  GAP_STOCKS,
  INTEREST_BANK,
  TREND_BONDS,
  TREND_STOCKS,
} from '~/types/Period'

import { io, Socket } from 'socket.io-client'

function ManageGame() {
  const router = useRouter()

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false)
  // const [countdownSeconds, setCountdownSeconds] = useState(0)
  const [duration, setDuration] = useState(0)
  const [socket, setSocket] = useState<Socket | null>(null)

  const { data, error, loading } = useQuery(GameDocument, {
    variables: { id: Number(router.query.id) },
    pollInterval: 15000,
    skip: !router.query.id,
  })

  const {
    data: learningElementsData,
    loading: learningElementsLoading,
    error: learningElementsError,
  } = useQuery(LearningElementsDocument)

  const {
    data: storyElementsData,
    loading: storyElementsLoading,
    error: storyElementsError,
  } = useQuery(StoryElementsDocument)

  const [activateNextPeriod, { loading: nextPeriodLoading }] = useMutation(
    ActivateNextPeriodDocument,
    {
      onCompleted() {
        try {
          const anchor = document.querySelector('#active-period')
          if (anchor)
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } catch (e) {}
      },
    }
  )
  const [activateNextSegment, { loading: nextSegmentLoading }] = useMutation(
    ActivateNextSegmentDocument
  )
  const [addGamePeriod, { loading: addGamePeriodLoading }] = useMutation(
    AddGamePeriodDocument,
    {
      refetchQueries: 'active',
    }
  )
  const [addPeriodSegment, { loading: addPeriodSegmentLoading }] = useMutation(
    AddPeriodSegmentDocument,
    {
      refetchQueries: 'active',
    }
  )

  // const [addCountdown] = useMutation(AddCountdownDocument)
  // const handleCountdownChange = (event) => {
  //   setCountdownSeconds(event.target.value)
  // }

  // const setCountdown = async () => {
  //   await fetch('/api/countdown', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       countdownTime: Number(countdownSeconds),
  //     }),
  //   })
  // }

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    })

    if (!socketInstance.connected) {
      fetch('/api/socket')
    }

    socketInstance.on('connect', () => {
      console.log('Admin connected')
      setSocket(socketInstance)
    })

    socketInstance.on('connect_error', async (error) => {
      console.error('Connection error admin:', error)
      await fetch('/api/socket')
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const handleStartCountdown = () => {
    if (socket) {
      socket.emit('start-countdown', duration)
    } else {
      console.error('Socket not connected')
    }
  }

  const nextPeriod = () =>
    activateNextPeriod({
      variables: {
        gameId: Number(router.query.id),
      },
      refetchQueries: [GameDocument],
    })

  const nextSegment = () =>
    activateNextSegment({
      variables: {
        gameId: Number(router.query.id),
      },
      refetchQueries: [GameDocument],
    })

  const getButton = useCallback(() => {
    const game = data.game
    const disabled = game.periods.length === 0
    const activePeriod = game?.activePeriod
    const segments = activePeriod?.segments
    const activeSegmentIx = activePeriod?.activeSegmentIx

    switch (game.status) {
      case GameStatus.Preparation: {
        const atLastSegment = activeSegmentIx >= segments.length - 1
        if (!atLastSegment) {
          return (
            <Button disabled={nextSegmentLoading} onClick={nextSegment}>
              Next Segment
            </Button>
          )
        }
        const disabled =
          game.periods.length === 0 || activePeriod.segments.length === 0
        return (
          <Button disabled={disabled} onClick={nextPeriod}>
            Start Period
          </Button>
        )
      }
      case GameStatus.Scheduled:
        if (!activePeriod) {
          const disabled =
            game.periods.length === 0 || game.periods[0].segments.length === 0
          return (
            <Button disabled={disabled} onClick={nextPeriod}>
              Start Period
            </Button>
          )
        }
        return <Button onClick={nextPeriod}>Start Segment</Button>
      case GameStatus.Running: {
        const atLastSegment =
          activeSegmentIx >= segments.length - 1 &&
          activePeriod.segmentCount === segments.length
        if (atLastSegment) {
          return (
            <Button disabled={nextPeriodLoading} onClick={nextPeriod}>
              Consolidate
            </Button>
          )
        }
        // Currently we need to disable the button if the next segment is not
        // available
        const disabled = activePeriod.activeSegmentIx === segments.length - 1
        return (
          <Button
            disabled={nextSegmentLoading || disabled}
            onClick={nextSegment}
          >
            Segment Results
          </Button>
        )
      }
      case GameStatus.Paused: {
        const atLastSegment = activeSegmentIx >= segments.length - 1
        return (
          <Button
            disabled={nextSegmentLoading || atLastSegment}
            onClick={nextSegment}
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
      case GameStatus.Consolidation:
        return (
          <Button disabled={nextPeriodLoading} onClick={nextPeriod}>
            Period Results
          </Button>
        )
      case GameStatus.Results: {
        const anotherPeriod = game.activePeriodIx > game.periods.length - 1
        return (
          <Button disabled={anotherPeriod} onClick={nextPeriod}>
            Next Period
          </Button>
        )
      }

      case GameStatus.Completed:
        return (
          <Button disabled onClick={() => null}>
            Completed
          </Button>
        )
    }
  }, [data?.game])

  if (loading || !data?.game) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }

  const game: Game = data.game

  const learningElementsAll = (
    learningElementsData?.learningElements || []
  ).map((e) => ({
    label: e.id,
    value: e.id,
  }))

  const storyElementsAll = (storyElementsData?.storyElements || []).map(
    (e) => ({
      label: e.id,
      value: e.id,
    })
  )

  return (
    <div className="p-4">
      <div>
        <div className="mb-4 flex flex-col gap-2 overflow-x-auto md:flex-row">
          {game.periods.map((period, ix) => {
            const periodStatus = computePeriodStatus(game, ix)

            const labels = [
              period.facts.spotTradingEnabled && 'S',
              period.facts.futuresTradingEnabled && 'F',
              period.facts.optionsTradingEnabled && 'O',
            ].filter(Boolean)

            const isPeriodPlanned = periodStatus === STATUS.SCHEDULED
            const isPeriodPaused = periodStatus === STATUS.PAUSED
            const isPeriodActive = periodStatus === STATUS.ACTIVE
            const isPeriodCompleted =
              periodStatus === STATUS.COMPLETED ||
              periodStatus === STATUS.RESULTS

            const scenario = period.facts.scenario
            const trendBonds = scenario.trendBonds
            const gapBonds = scenario.gapBonds
            const trendStocks = scenario.trendStocks
            const gapStocks = scenario.gapStocks
            const savingsInterest = scenario.interestBank
            const seed = scenario.seed

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
                          game,
                          period as Period,
                          ix
                        )

                        const isSegmentActive =
                          periodStatus === STATUS.ACTIVE &&
                          segmentStatus === STATUS.ACTIVE
                        const isSegmentCompleted =
                          periodStatus === STATUS.COMPLETED ||
                          segmentStatus === STATUS.COMPLETED

                        const diceBonds = segment?.facts.diceRolls.map(
                          (dice) => dice.bonds
                        )
                        const diceStocks = segment?.facts.diceRolls.map(
                          (dice) => dice.stocks
                        )
                        const diceShared = segment?.facts.diceRolls.map(
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
                          await addPeriodSegment({
                            variables: {
                              gameId: Number(router.query.id),
                              periodIx: variables.periodIx,
                              facts: {},
                              storyElements: variables.storyElements,
                              learningElements: variables.learningElements,
                            },
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
              await addGamePeriod({
                variables: {
                  gameId: Number(router.query.id),
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
                },
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
                        <p>
                          One period corresponds to one year. The number of
                          segments <br />
                          is used to compute the number of months in the period.
                        </p>
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
                        tooltip={<p>Seed ....</p>}
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
                        tooltip={<p>Saving interest ....</p>}
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
                        tooltip={<p>Trend is the expectation value.</p>}
                        required
                        data={{ cy: 'trend-bonds' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        placeholder={newPeriodForm.values.gapBonds}
                        label="Gap"
                        name="gapBonds"
                        tooltip={<p>TODO.</p>}
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
                        tooltip={<p>Trend is the expectation value.</p>}
                        required
                        data={{ cy: 'trend-stocks' }}
                        className={{ label: 'pb-2 font-normal' }}
                      />
                      <FormikNumberField
                        placeholder={newPeriodForm.values.gapStocks}
                        label="Gap"
                        name="gapStocks"
                        tooltip={<p>TODO.</p>}
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
                <PlayerCompact player={player as Player} />
              </div>
            ))}
          </div>
        </div>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Countdown</CardTitle>
            <CardDescription>Set a countdown for the segment.</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="number"
              // value={countdownSeconds}
              // onChange={handleCountdownChange}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              // placeholder="Countdown in seconds"
              min="1"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartCountdown}>Set Countdown</Button>
            {/* <Button onClick={setCountdown}>Set Countdown</Button> */}
          </CardFooter>
        </Card>
        {/* <Formik
          initialValues={{ countdownSeconds: 300 }}
          onSubmit={
            (values) => {}
            // addCountdown({
            //   variables: {
            //     gameId: Number(router.query.id),
            //     seconds: Number(values.countdownSeconds),
            //   },
            //   refetchQueries: [GameDocument],
            // })
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
                <FormikNumberField
                  name="countdownSeconds"
                  precision={0}
                  label="Countdown in seconds"
                  className={{ label: 'pb-2 font-normal' }}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">Set Countdown</Button>
              </CardFooter>
            </Card>
          </Form>
        </Formik> */}
      </div>
    </div>
  )
}

export default ManageGame
