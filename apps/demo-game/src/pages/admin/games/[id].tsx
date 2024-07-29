import { faCalendar, faPauseCircle } from '@fortawesome/free-regular-svg-icons'
import {
  faCheck,
  faPause,
  faPlus,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, FormikTextField, Modal } from '@uzh-bf/design-system'
import { Formik } from 'formik'
import { useRouter } from 'next/router'
import { twMerge } from 'tailwind-merge'

import PlayerCompact from '@components/PlayerCompact'

import { useMutation, useQuery } from '@apollo/client'
import {
  STATUS,
  computePeriodStatus,
  computeSegmentStatus,
} from '@gbl-uzh/platform/dist/lib/util'
import { pick } from 'ramda'
import { useState } from 'react'
import {
  ActivateNextPeriodDocument,
  ActivateNextSegmentDocument,
  AddGamePeriodDocument,
  AddPeriodSegmentDocument,
  Game,
  GameDocument,
  GameStatus,
  Period,
  Player,
} from 'src/graphql/generated/ops'

function ManageGame() {
  const router = useRouter()

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false)

  const { data, error, loading, refetch } = useQuery(GameDocument, {
    variables: { id: Number(router.query.id) },
    pollInterval: 15000,
    skip: !router.query.id,
  })

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

  if (loading || !data?.game) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }

  const game = data.game
  const activePeriod = game?.activePeriod
  const segments = activePeriod?.segments
  const activeSegmentIx = activePeriod?.activeSegmentIx

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

  const getButton = () => {
    const isScheduled = game.status === GameStatus.Scheduled
    const isResultState = game.status === GameStatus.Results
    if (!activePeriod || isScheduled || isResultState) {
      return {
        buttonName: 'Next Period',
        disabled: false,
        onClick: nextPeriod,
      }
    }

    const atLastSegment = activeSegmentIx >= segments.length - 1
    if (!atLastSegment) {
      return {
        buttonName: 'Next Segment',
        disabled: nextSegmentLoading,
        onClick: nextSegment,
      }
    }
    // TODO(JJ):
    // - Fix consolidation for the last period
    // - const periods = game?.periods
    //   const activePeriodIx = game?.activePeriodIx
    //   const atLastPeriodIx = activePeriodIx >= periods.length - 1
    if (game.status === GameStatus.Consolidation) {
      return {
        buttonName: 'Consolidate',
        disabled: nextPeriodLoading,
        onClick: nextPeriod,
      }
    }
    if (game.status === GameStatus.Completed) {
      return {
        buttonName: 'Completed',
        disabled: true,
        onClick: () => {},
      }
    }
    return {
      buttonName: 'Period Results',
      disabled: nextPeriodLoading,
      onClick: nextPeriod,
    }
  }

  const actionButton = getButton()

  // NOTE: Somehow when clicking on the nextSegment/nextPeriod button
  // the ordering of the periods is changed for a short time, that is why
  // we sort it here.
  const periodsSorted = data.game.periods
  // .slice()
  // .sort((periodA, periodB) => periodA.index - periodB.index)

  // TODO(JJ): Since it is not refreshing nicely after a new status update of
  // period or one of the segments, I am wondering if we should precompute
  // the periodsSorted.map and their segments into new arrays -> check with RS
  // -> appearantly the pollIntervall can increase the refresh rate
  // there is also refetching which refreshes in response to a user action

  return (
    <div className="p-4">
      <div>
        <div className="flex flex-col gap-2 overflow-x-auto md:flex-row">
          {periodsSorted.map((period, ix) => {
            const periodStatus = computePeriodStatus(data.game as Game, ix)

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
                    {period.segments.map((segment, ix) => {
                      const segmentStatus = computeSegmentStatus(
                        data.game as Game,
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
                            isSegmentActive && 'border-green-600 bg-green-100',
                            isSegmentCompleted && ' text-gray-400'
                          )}
                          key={segment.id}
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
                                  Story: {segment.storyElements.length}
                                </div>
                                <div className="text-sm">
                                  Learn: {segment.learningElements.length}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {!isPeriodCompleted &&
                      (data.game as Game).periods.length - 1 === ix && (
                        <Formik
                          initialValues={{
                            periodIx: -1,
                            storyElements: '',
                            learningElements: '',
                          }}
                          onSubmit={async (variables, { resetForm }) => {
                            await addPeriodSegment({
                              variables: {
                                gameId: Number(router.query.id),
                                periodIx: variables.periodIx,
                                facts: {},
                                storyElements: variables.storyElements
                                  ? variables.storyElements.split(',')
                                  : [],
                                learningElements: variables.learningElements
                                  ? variables.learningElements.split(',')
                                  : [],
                              },
                            })
                            resetForm()
                          }}
                        >
                          {(newSegmentForm) => (
                            <Modal
                              open={isSegmentModalOpen}
                              onClose={() => setIsSegmentModalOpen(false)}
                              trigger={
                                <Button
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
                              <FormikTextField
                                name="storyElements"
                                label="Story Elements"
                                data={{ cy: 'story-elements' }}
                              />
                              <FormikTextField
                                name="learningElements"
                                label="Learning Elements"
                                data={{ cy: 'learning-elements' }}
                              />
                            </Modal>
                          )}
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
            }}
            onSubmit={async (variables, { resetForm }) => {
              await addGamePeriod({
                variables: {
                  gameId: Number(router.query.id),
                  facts: pick(
                    ['stockTrend', 'stockVariance', 'stockGap'],
                    variables
                  ),
                },
              })
              resetForm()
            }}
          >
            {(newPeriodForm) => (
              <Modal
                open={isPeriodModalOpen}
                onClose={() => setIsPeriodModalOpen(false)}
                trigger={
                  <Button
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
                        (data.game as Game).periods.length
                      )
                      newPeriodForm.handleSubmit()
                      setIsPeriodModalOpen(false)
                    }}
                  >
                    Submit
                  </Button>
                }
              >
                <FormikTextField
                  type="string"
                  name="periodName"
                  label="Period Name"
                  data={{ cy: 'period-name' }}
                />
              </Modal>
            )}
          </Formik>
        </div>
      </div>
      <div className="mt-2 flex flex-row gap-2">
        <Button
          disabled={actionButton?.disabled}
          onClick={actionButton?.onClick}
        >
          {actionButton?.buttonName}
        </Button>
      </div>

      <div className="mt-4 max-w-sm">
        <div className="font-bold">Players</div>
        <div className="mt-2 flex flex-col gap-2">
          {data.game.players.map((player, ix) => (
            <div key={player.id} data-cy={`player-${ix}`}>
              <PlayerCompact key={player.id} player={player as Player} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ManageGame
