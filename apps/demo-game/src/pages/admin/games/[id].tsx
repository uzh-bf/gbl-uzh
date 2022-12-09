import { faCalendar, faPauseCircle } from '@fortawesome/free-regular-svg-icons'
import {
  faCheck,
  faPause,
  faPlus,
  faSnowboarding,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, FormikTextField, Modal } from '@uzh-bf/design-system'
import { Formik } from 'formik'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { twMerge } from 'tailwind-merge'

import PlayerCompact from '@components/PlayerCompact'

import { useMutation, useQuery } from '@apollo/client'
import {
  ActivateNextPeriodDocument,
  ActivateNextSegmentDocument,
  AddGamePeriodDocument,
  AddPeriodSegmentDocument,
  Game,
  Player,
  GameDocument,
  GameStatus,
  Period,
} from '@gbl-uzh/platform/dist/generated/ops'
import { pick } from 'ramda'
import { useState } from 'react'

enum STATUS {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  RESULTS = 'RESULTS',
}

function computePeriodStatus(game : Game, periodIndex: number): string {
  if (
    game.activePeriodIx && game.status === GameStatus.Results 
      ? game.activePeriodIx - 1 === periodIndex
      : game.activePeriodIx === periodIndex
  ) {
    if (game.status === GameStatus.Paused) return STATUS.PAUSED
    if (game.status === GameStatus.Results) return STATUS.RESULTS
    return STATUS.ACTIVE
  }

  if (game.activePeriodIx && game.activePeriodIx <= periodIndex) return STATUS.SCHEDULED

  return STATUS.COMPLETED
}

function computeSegmentStatus(game : Game, period : Period, segmentIndex: number): string {
  if (
    ![
      GameStatus.Paused,
      GameStatus.Preparation,
      GameStatus.Consolidation,
      GameStatus.Results,
    ].includes(game.status) &&
    period.activeSegmentIx === segmentIndex
  )
    return STATUS.ACTIVE

  if (period.activeSegmentIx && period.activeSegmentIx < segmentIndex) return STATUS.SCHEDULED

  return STATUS.COMPLETED
}

function ManageGame() {
  const router = useRouter()

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false)

  const { data, error, loading } = useQuery(GameDocument, {
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

  return (
    <div className="p-4">
      <div>
        <div className="flex flex-col gap-2 overflow-x-auto md:flex-row">
          {data.game.periods.map((period, ix) => {
            const periodStatus = computePeriodStatus(data.game, ix)

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
                id={isPeriodActive && 'active-period'}
              >
                <div
                  className={twMerge(
                    'p-2 border rounded flex-1 flex flex-col gap-1',
                    isPeriodPaused && 'bg-orange-100 border-orange-300',
                    isPeriodActive && 'bg-green-50 border-green-300',
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
                    </div>
                    <div className="flex flex-row gap-1">
                      {labels.map((label) => (
                        <div
                          className="px-1 font-bold border rounded text-slate-600"
                          key={label}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row gap-1 mt-1">
                    {period.segments.map((segment, ix) => {
                      const segmentStatus = computeSegmentStatus(
                        data.game,
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
                            'p-2 border rounded flex-initial text-center',
                            isSegmentActive && 'bg-green-100 border-green-600',
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
                            <div className="text-right whitespace-nowrap">
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
                    {!isPeriodCompleted && data.game.periods.length - 1 === ix && (
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
                                className="w-12 h-full font-bold text-gray-500"
                                onClick={() => setIsSegmentModalOpen(true)}
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
                            />
                            <FormikTextField
                              name="learningElements"
                              label="Learning Elements"
                            />
                          </Modal>
                        )}
                      </Formik>
                    )}
                  </div>
                </div>
                <div
                  className={twMerge(
                    'flex flex-row items-center text-xl text-gray-300 bg-gray-50 rounded p-2 border',
                    periodStatus === STATUS.RESULTS &&
                      'text-red-400 border-red-200'
                  )}
                >
                  <FontAwesomeIcon icon={faPauseCircle} />
                </div>
              </div>
            )
          })}

          <Formik
            initialValues={{
              newPeriodIx: 0,
              stockTrend: 0.084,
              stockVariance: 0.0403,
              stockGap: 0.025,
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
                    className="font-bold text-gray-500 md:w-48"
                    onClick={() => setIsPeriodModalOpen(true)}
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
                        data.game.periods.length
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
                />
              </Modal>
            )}
          </Formik>
        </div>
      </div>

      <div className="flex flex-row gap-2 mt-2">
        <Button
          // disabled={
          //   data.game.status === GameStatus.Preparation ||
          //   data.game?.activePeriod?.activeSegmentIx <
          //     data.game?.activePeriod?.segments.length - 1 ||
          //   nextPeriodLoading
          // }
          onClick={() => {
            activateNextPeriod({
              variables: {
                gameId: Number(router.query.id),
              },
            })
          }}
        >
          Next Period
        </Button>
        <Button
          disabled={
            (data.game.status !== GameStatus.Preparation &&
              data.game?.activePeriod?.activeSegmentIx >=
                data.game?.activePeriod?.segments.length - 1) ||
            nextSegmentLoading
          }
          onClick={() => {
            activateNextSegment({
              variables: {
                gameId: Number(router.query.id),
              },
            })
          }}
        >
          Next Segment
        </Button>
      </div>

      <div className="max-w-sm mt-4">
        <div className="font-bold">Players</div>
        <div className="flex flex-col gap-2 mt-2">
          {data.game.players.map((player) => (
            <PlayerCompact key={player.id} player={player} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ManageGame
