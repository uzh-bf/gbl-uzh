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
  Modal,
  NewFormikTextField,
  NewFromikNumberField,
} from '@uzh-bf/design-system'
import { Field, Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { twMerge } from 'tailwind-merge'

import PlayerCompact from '~/components/PlayerCompact'

import { useMutation, useQuery } from '@apollo/client'
import {
  STATUS,
  computePeriodStatus,
  computeSegmentStatus,
} from '@gbl-uzh/platform/dist/lib/util'
import { pick } from 'ramda'
import { useCallback, useState } from 'react'
import {
  ActivateNextPeriodDocument,
  ActivateNextSegmentDocument,
  AddCountdownDocument,
  AddGamePeriodDocument,
  AddPeriodSegmentDocument,
  Game,
  GameDocument,
  GameStatus,
  LearningElementsDocument,
  Period,
  Player,
} from 'src/graphql/generated/ops'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@uzh-bf/design-system/dist/future'

import { MultiSelect } from '~/components/MultiSelect'

function ManageGame() {
  const router = useRouter()

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false)

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

  const [addCountdown] = useMutation(AddCountdownDocument)

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
        console.log('atLastSegment', atLastSegment)
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

  const learningElementsAll = (learningElementsData.learningElements || []).map(
    (e) => ({
      label: e.id,
      value: e.id,
    })
  )

  return (
    <div className="p-4">
      <div>
        <div className="flex flex-col gap-2 overflow-x-auto md:flex-row">
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
                  <div className="flex flex-row items-start justify-between gap-2">
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
                            <div className="flex flex-row gap-2">
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
                              <div className="whitespace-nowrap text-right">
                                <div className="flex flex-row gap-2">
                                  <div className="text-sm">
                                    Story: {segment?.storyElements.length ?? 0}
                                  </div>
                                  <div className="text-sm">
                                    Learn:{' '}
                                    {segment?.learningElements.length ?? 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    )}
                    {!isPeriodCompleted && game.periods.length - 1 === ix && (
                      <Formik
                        initialValues={{
                          periodIx: -1,
                          storyElements: '',
                          learningElements: [],
                        }}
                        onSubmit={async (variables, { resetForm }) => {
                          console.log('variables', variables)
                          await addPeriodSegment({
                            variables: {
                              gameId: Number(router.query.id),
                              periodIx: variables.periodIx,
                              facts: {},
                              storyElements: variables.storyElements
                                ? variables.storyElements.split(',')
                                : [],
                              learningElements: variables.learningElements,
                              // ? variables.learningElements.split(',')
                              // : [],
                            },
                          })
                          resetForm()
                        }}
                      >
                        {(newSegmentForm) => {
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
                                <NewFormikTextField
                                  name="storyElements"
                                  label="Story Elements"
                                  data={{ cy: 'story-elements' }}
                                  className={{ label: 'pb-2 font-normal' }}
                                />
                                <span className="text-sm font-normal text-gray-700">
                                  Learning Elements
                                </span>
                                <Field
                                  name="learningElements"
                                  component={MultiSelect}
                                  options={learningElementsAll}
                                  value={newSegmentForm.values.learningElements}
                                  placeholderCmdSearch="Search learning elements..."
                                  onChange={(value) => {
                                    newSegmentForm.setFieldValue(
                                      'learningElements',
                                      value
                                    )
                                  }}
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
              segmentCount: 4,
            }}
            onSubmit={async (variables, { resetForm }) => {
              await addGamePeriod({
                variables: {
                  gameId: Number(router.query.id),
                  // TODO(JJ): Add dice simulation
                  facts: pick(
                    ['stockTrend', 'stockVariance', 'stockGap'],
                    variables
                  ),
                  segmentCount: variables.segmentCount,
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
                    <NewFormikTextField
                      type="string"
                      name="periodName"
                      label="Period Name"
                      data={{ cy: 'period-name' }}
                      className={{ label: 'pb-2 font-normal' }}
                    />
                    <NewFromikNumberField
                      placeholder="4"
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
                </Modal>
              )
            }}
          </Formik>
        </div>
      </div>
      <div className="mt-2 flex flex-row gap-2">{getButton()}</div>

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

        <Formik
          initialValues={{ countdownSeconds: 300 }}
          onSubmit={(values) =>
            addCountdown({
              variables: {
                gameId: Number(router.query.id),
                seconds: Number(values.countdownSeconds),
              },
              refetchQueries: [GameDocument],
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
                <NewFromikNumberField
                  name="countdownSeconds"
                  precision={0}
                  label="Countdown in seconds"
                  className={{ label: 'pb-2 font-normal' }}
                />
                {/* TODO(JJ): @RS Do we want to show the following? If no we
                  we can remove the refetchQueries.
                */}
                {data.game?.activePeriod?.activeSegment?.countdownExpiresAt}
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
