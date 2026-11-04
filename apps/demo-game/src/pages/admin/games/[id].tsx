import { faCalendar, faPauseCircle } from '@fortawesome/free-regular-svg-icons'
import {
  faCheck,
  faPause,
  faPlus,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MultiSelect } from '@gbl-uzh/ui'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Controller, useForm } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import RegistrationPanel from '~/components/admin/RegistrationPanel'
import { contentText } from '~/i18n/content'
import { statusKeys } from '~/i18n/labels'
import { MessageText, useLanguage } from '~/i18n/Language'
import { NUM_MONTHS_PER_SEGMENT } from '~/lib/constants'

import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  computePeriodStatus,
  computeSegmentStatus,
  PlayerCompact,
  STATUS,
} from '@gbl-uzh/ui'
import {
  ShadcnTableBody as TableBody,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import {
  ActivateNextPeriodDocument,
  ActivateNextSegmentDocument,
  AddCountdownDocument,
  AddGamePeriodDocument,
  AddPeriodSegmentDocument,
  FinishGameDocument,
  GameDocument,
  GameStatus,
  GlobalEventsDocument,
  LearningElementsDocument,
  Player,
  StoryElementsDocument,
} from 'src/graphql/generated/ops'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  H3,
  H4,
  Modal,
  ShadcnTable as Table,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
} from '~/components/admin/AdminControls'

import { AdminInputField } from '~/components/fields/AdminInputField'
import { useToast } from '~/components/ui/use-toast'
import {
  DEFAULT_SEED,
  GAP_BONDS,
  GAP_STOCKS,
  INTEREST_BANK,
  TREND_BONDS,
  TREND_STOCKS,
} from '~/lib/constants'

import { shouldRefetchDemoGame } from '~/lib/gameEvents'
import {
  allMarketRollsRevealed,
  canRevealMarketRoll,
  readMarketRoll,
  revealedIndices,
} from '~/lib/market'
import { queueRefetch } from '~/lib/queuedRefetch'

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
  const t = useTranslations()
  const { language } = useLanguage()
  const router = useRouter()

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false)

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
    await addPeriodSegment({
      variables: {
        gameId: Number(router.query.id),
        periodIx: values.periodIx,
        facts: {},
        storyElements: values.storyElements,
        learningElements: values.learningElements,
      },
    })
    resetSegment()
  }

  const onPeriodSubmit = async (values: PeriodFormValues) => {
    await addGamePeriod({
      variables: {
        gameId: Number(router.query.id),
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
      },
    })
    resetPeriod()
  }

  const onCountdownSubmit = (values: { countdownSeconds: number }) => {
    addCountdown({
      variables: {
        gameId: Number(router.query.id),
        seconds: Number(values.countdownSeconds),
      },
    })
  }

  const { data, error, loading, refetch } = useQuery(GameDocument, {
    variables: { id: Number(router.query.id) },
    pollInterval: 15000,
    skip: !router.query.id,
  })

  const queuedRefetch = useMemo(() => queueRefetch(refetch), [refetch])
  useSubscription(GlobalEventsDocument, {
    skip: !data?.game,
    onData: ({ data: eventData }) => {
      if (
        shouldRefetchDemoGame(
          eventData.data?.eventsGlobal,
          Number(data?.game?.id)
        )
      )
        void queuedRefetch().catch(() => {})
    },
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

  const { toast } = useToast()
  const periodTransitionOptions = {
    variables: { gameId: Number(router.query.id) },
    refetchQueries: [GameDocument],
    awaitRefetchQueries: true,
    onError: () => {
      toast({
        title: <MessageText message="manage.controls.updateError" />,
        description: <MessageText message="manage.controls.refreshing" />,
      })
      void queuedRefetch().catch(() => {})
    },
  }
  const [finishGame, { loading: finishing }] = useMutation(
    FinishGameDocument,
    periodTransitionOptions
  )
  const [activateNextPeriod, { loading: nextPeriodLoading }] = useMutation(
    ActivateNextPeriodDocument,
    {
      ...periodTransitionOptions,
      onCompleted: () =>
        document.querySelector('#active-period')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        }),
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

  const [addCountdown] = useMutation(AddCountdownDocument, {
    refetchQueries: [GameDocument],
    onCompleted: () =>
      toast({
        title: <MessageText message="manage.controls.countdownAdded" />,
        description: <MessageText message="manage.controls.playersNotified" />,
      }),
    onError: (err) =>
      toast({
        title: <MessageText message="manage.controls.countdownError" />,
        description: <MessageText message="player.progress.retry" />,
        variant: 'destructive',
      }),
  })

  const nextPeriod = () => activateNextPeriod()

  const nextSegment = () =>
    activateNextSegment({
      variables: {
        gameId: Number(router.query.id),
      },
      refetchQueries: [GameDocument],
    })

  const notifyReady = useEffectEvent(() => {
    const game = data?.game
    if (game?.status !== GameStatus.Running) return

    const allPlayersReady = game.players.every((player) => player.isReady)
    if (allPlayersReady) {
      toast({
        title: <MessageText message="manage.controls.readyTitle" />,
        description: <MessageText message="manage.controls.readyDescription" />,
      })

      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch((err) => {
        alert(t('manage.controls.autoplayWarning'))
        console.error('Error playing notification sound:', err)
      })
    }
  })
  useEffect(() => {
    notifyReady()
  }, [data?.game])

  if (loading || !data?.game) {
    return <div>{t('manage.controls.loading')}</div>
  }

  if (error) {
    return <div role="alert">{t('manage.games.loadGameError')}</div>
  }

  const game = data.game
  // The activePeriod relation only selects segment IDs; periods includes facts.
  const activePeriod = game.periods.find(
    (period) => period.index === game.activePeriodIx
  )
  const segments = activePeriod?.segments ?? []
  const activeSegmentIx = activePeriod?.activeSegmentIx
  const activeSegment = segments.find(
    (segment) => segment.index === activeSegmentIx
  )
  const awaitingDice =
    ['PAUSED', 'CONSOLIDATION'].includes(game.status) &&
    !allMarketRollsRevealed(activeSegment?.facts)

  const getButton = () => {
    switch (game.status) {
      case GameStatus.Preparation: {
        const atLastSegment = activeSegmentIx >= segments.length - 1
        if (!atLastSegment) {
          return (
            <Button disabled={nextSegmentLoading} onClick={nextSegment}>
              {t('manage.controls.nextSegment')}
            </Button>
          )
        }
        const disabled =
          game.periods.length === 0 || activePeriod.segments.length === 0
        return (
          <Button disabled={disabled} onClick={nextPeriod}>
            {t('manage.controls.startPeriod')}
          </Button>
        )
      }
      case GameStatus.Scheduled:
        if (!activePeriod) {
          const disabled =
            game.playerCount === 0 ||
            nextPeriodLoading ||
            game.periods.length === 0 ||
            game.periods[0].segments.length === 0
          return (
            <Button disabled={disabled} onClick={nextPeriod}>
              {t('manage.controls.startPeriod')}
            </Button>
          )
        }
        return (
          <Button onClick={nextPeriod}>
            {t('manage.controls.startSegment')}
          </Button>
        )
      case GameStatus.Running: {
        const atLastSegment =
          activeSegmentIx >= segments.length - 1 &&
          activePeriod.segmentCount === segments.length
        if (atLastSegment) {
          return (
            <Button disabled={nextPeriodLoading} onClick={nextPeriod}>
              {t('manage.controls.consolidate')}
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
            {t('manage.controls.segmentResults')}
          </Button>
        )
      }
      case GameStatus.Paused: {
        const atLastSegment = activeSegmentIx >= segments.length - 1
        return (
          <Button
            disabled={nextSegmentLoading || atLastSegment || awaitingDice}
            onClick={nextSegment}
          >
            {t('manage.controls.nextSegment')}
          </Button>
        )
      }

      case GameStatus.Consolidation:
        return (
          <Button
            disabled={nextPeriodLoading || awaitingDice}
            onClick={nextPeriod}
          >
            {t('manage.controls.periodResults')}
          </Button>
        )
      case GameStatus.Results: {
        const pending = finishing || nextPeriodLoading
        return (
          <>
            {activePeriod && (
              <Button disabled={pending} onClick={nextPeriod}>
                {t('manage.controls.nextPeriod')}
              </Button>
            )}
            <Button disabled={pending} onClick={() => finishGame()}>
              {t('manage.controls.finish')}
            </Button>
          </>
        )
      }
      case GameStatus.Completed:
        return (
          <span role="status" className="self-center font-semibold">
            {t('manage.controls.completed')}
          </span>
        )
    }
  }

  const learningElementsAll = (
    learningElementsData?.learningElements || []
  ).map((e) => ({
    label: contentText(language, 'lesson', e.id, 'title', e.title),
    value: e.id,
  }))

  const storyElementsAll = (storyElementsData?.storyElements || []).map(
    (e) => ({
      label: contentText(language, 'story', e.id, 'title', e.title),
      value: e.id,
    })
  )

  return (
    <div
      className="mobile:app-panel mobile:app-body p-4"
      data-cy="game-detail"
      data-game-status={game.status}
    >
      <RegistrationPanel game={game} onChange={refetch} />
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

            const canAddSegment =
              game.status !== GameStatus.Completed &&
              !isPeriodCompleted &&
              ix === game.periods.length - 1
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
                data-cy={`period-${ix}`}
              >
                <div
                  className={twMerge(
                    'mobile:app-card mobile:min-w-0 flex flex-1 flex-col gap-1 rounded border p-2',
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
                      <div className="font-bold">
                        {t('manage.controls.period')} {period.index + 1}
                      </div>
                      {isPeriodActive && (
                        <div>{t(statusKeys[game.status])}</div>
                      )}
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
                    <div className="mobile:w-full mobile:flex-col flex flex-row gap-2">
                      <div className="flex flex-col justify-end gap-1">
                        <div className="flex items-end justify-between gap-4 pr-2">
                          <div className="text-nowrap">
                            {t('manage.controls.seed')}
                          </div>
                          <div>{seed}</div>
                        </div>
                        <div className="flex items-end justify-between gap-4 pr-2">
                          <div className="text-nowrap">
                            {t('manage.controls.savingsInterest')}
                          </div>
                          <div>{savingsInterest}</div>
                        </div>
                      </div>
                      <Table className="mobile:app-body border-l text-base">
                        <TableHeader>
                          <TableRow className="border-none py-0">
                            <TableHead></TableHead>
                            <TableHead className="py-0">
                              {t('manage.controls.trend')}
                            </TableHead>
                            <TableHead className="py-0">
                              {t('player.allocation.gap')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="border-none py-0">
                            <TableCell className="py-0">
                              {t('shared.assets.bonds')}
                            </TableCell>
                            <TableCell className="py-0">{trendBonds}</TableCell>
                            <TableCell className="py-0">{gapBonds}</TableCell>
                          </TableRow>
                          <TableRow className="border-none py-0">
                            <TableCell className="py-0">
                              {t('shared.assets.stocks')}
                            </TableCell>
                            <TableCell className="py-0">
                              {trendStocks}
                            </TableCell>
                            <TableCell className="py-0">{gapStocks}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="mobile:flex-col mt-1 flex flex-row gap-1">
                    {Array.apply(null, Array(period.segmentCount)).map(
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

                        const canRoll =
                          segment &&
                          canRevealMarketRoll({
                            index: segment.index,
                            periodIx: period.index,
                            period: { activeSegmentIx: period.activeSegmentIx },
                            game: {
                              status: game.status,
                              activePeriodIx: game.activePeriodIx,
                            },
                          })
                        const revealedCount = revealedIndices(
                          segment?.facts
                        ).length
                        const rolls = Array.from(
                          { length: NUM_MONTHS_PER_SEGMENT },
                          (_, index) => readMarketRoll(segment?.facts, index)
                        )
                        const diceOutcomes = (
                          <span className="grid gap-1">
                            {(['bonds', 'stocks'] as const).map((asset) => (
                              <span
                                key={asset}
                                className="flex justify-between gap-4 text-nowrap"
                              >
                                <span>
                                  {t('manage.dice.title')}{' '}
                                  {asset === 'bonds'
                                    ? t('shared.assets.bonds')
                                    : t('shared.assets.stocks')}
                                  :
                                </span>
                                <span className="flex gap-2 tabular-nums">
                                  {rolls.map((roll, index) => (
                                    <span
                                      key={index}
                                      aria-label={t(
                                        'manage.controls.monthlyOutcome',
                                        {
                                          month: index + 1,
                                          outcome:
                                            roll?.dice[asset] ??
                                            t('manage.dice.missingOutcome'),
                                        }
                                      )}
                                    >
                                      {roll?.dice[asset] ?? '—'}
                                    </span>
                                  ))}
                                </span>
                              </span>
                            ))}
                          </span>
                        )

                        return (
                          <div
                            className={twMerge(
                              'flex-initial rounded border p-2 text-center',
                              (!segment || (isSegmentCompleted && !canRoll)) &&
                                'bg-gray-100 text-gray-400',
                              isSegmentActive &&
                                'border-green-600 bg-green-100',
                              canRoll &&
                                'border-blue-600 bg-blue-50 text-blue-900'
                            )}
                            key={ix}
                            data-cy={`period-${period.index}-segment-${ix}`}
                            data-segment-id={segment?.id}
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
                                  {t('manage.controls.segment')}{' '}
                                  {segment?.index !== undefined
                                    ? segment.index + 1
                                    : ''}
                                </div>
                              }
                            </div>
                            <div className="my-2">
                              <div className="flex flex-row gap-2">
                                <div className="mobile:app-caption text-sm">
                                  {t('manage.controls.story')}{' '}
                                  {segment?.storyElements.length ?? 0}
                                </div>
                                <div className="mobile:app-caption text-sm">
                                  {t('manage.controls.learn')}{' '}
                                  {segment?.learningElements.length ?? 0}
                                </div>
                              </div>
                            </div>

                            {segment &&
                              (canRoll ? (
                                <Link
                                  href={`/admin/dice/${segment.id}/roll`}
                                  target="_blank"
                                  data-cy={`segment-dice-${segment.id}`}
                                  className="mt-2 block rounded border border-blue-600 bg-white p-2 font-semibold text-blue-900"
                                >
                                  {diceOutcomes}
                                  <span className="mt-2 block text-xs">
                                    {allMarketRollsRevealed(segment.facts)
                                      ? t('manage.controls.diceRevealed')
                                      : t('manage.controls.awaitingDice', {
                                          count: revealedCount,
                                        })}
                                  </span>
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  data-cy={`segment-dice-${segment.id}`}
                                  className="mt-2 w-full cursor-not-allowed rounded border border-gray-300 p-2 text-left text-gray-500"
                                >
                                  {diceOutcomes}
                                </button>
                              ))}
                          </div>
                        )
                      }
                    )}
                    {canAddSegment && (
                      <>
                        {storyElementsLoading || learningElementsLoading ? (
                          <div>{t('manage.controls.loading')}</div>
                        ) : storyElementsError || learningElementsError ? (
                          <div>
                            {t('manage.controls.contentError')}{' '}
                            {t('player.progress.retry')}
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
                                aria-label={t(
                                  'manage.controls.addSegmentLabel'
                                )}
                                data={{ cy: 'add-segment' }}
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </Button>
                            }
                            title={t('manage.controls.addSegment')}
                            onSecondaryAction={() => {
                              resetSegment()
                              setIsSegmentModalOpen(false)
                            }}
                            secondaryLabel={t('shared.actions.discard')}
                            onPrimaryAction={() => {
                              setSegmentValue('periodIx', period.index)
                              handleSegmentSubmit(onSegmentSubmit)()
                              setIsSegmentModalOpen(false)
                            }}
                            primaryLabel={t('shared.actions.submit')}
                          >
                            <div className="mobile:w-full flex w-1/2 flex-col gap-2">
                              <div className="flex flex-col gap-2">
                                <span className="mobile:app-caption text-sm font-normal text-gray-700">
                                  {t('player.team.stories')}
                                </span>
                                <Controller
                                  control={segmentControl}
                                  name="storyElements"
                                  render={({ field }) => (
                                    <MultiSelect
                                      options={storyElementsAll}
                                      value={field.value}
                                      onChange={field.onChange}
                                      emptyText={t('manage.controls.noMatches')}
                                      placeholder={t('manage.controls.options')}
                                      searchPlaceholder={t(
                                        'manage.controls.searchStories'
                                      )}
                                    />
                                  )}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className="mobile:app-caption text-sm font-normal text-gray-700">
                                  {t('manage.controls.lessons')}
                                </span>
                                <Controller
                                  control={segmentControl}
                                  name="learningElements"
                                  render={({ field }) => (
                                    <MultiSelect
                                      options={learningElementsAll}
                                      value={field.value}
                                      onChange={field.onChange}
                                      emptyText={t('manage.controls.noMatches')}
                                      placeholder={t('manage.controls.options')}
                                      searchPlaceholder={t(
                                        'manage.controls.searchLessons'
                                      )}
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
                    'mobile:app-heading flex flex-row items-center rounded border bg-gray-50 p-2 text-xl text-gray-300',
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
            if (game.status === GameStatus.Completed) return null
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
                    aria-label={t('manage.controls.addPeriodLabel')}
                    data={{ cy: 'add-period' }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                }
                title={t('manage.controls.addPeriod')}
                onSecondaryAction={() => {
                  resetPeriod()
                  setIsPeriodModalOpen(false)
                }}
                secondaryLabel={t('shared.actions.discard')}
                onPrimaryAction={() => {
                  handlePeriodSubmit(onPeriodSubmit)()
                  setIsPeriodModalOpen(false)
                }}
                primaryLabel={t('shared.actions.submit')}
              >
                <div className="mobile:w-full flex w-1/2 flex-col gap-2">
                  <AdminInputField
                    label={t('manage.controls.segmentCount')}
                    name="segmentCount"
                    type="number"
                    tooltip={t('manage.controls.periodHint', {
                      months: NUM_MONTHS_PER_SEGMENT,
                    })}
                    required
                    register={registerPeriod}
                    error={errorsPeriod.segmentCount}
                  />
                </div>
                <div className="mt-4">
                  <H3>{t('manage.controls.scenario')}</H3>
                  <div className="mobile:w-full flex w-1/2 flex-col gap-2">
                    <AdminInputField
                      label={t('manage.controls.seed')}
                      name="seed"
                      type="number"
                      tooltip={t('manage.controls.seedHint')}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.seed}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <H4>{t('manage.controls.bank')}</H4>
                  <div className="mobile:w-full flex w-1/2 flex-col gap-2">
                    <AdminInputField
                      label={t('manage.controls.savingsInterest')}
                      name="interestBank"
                      type="number"
                      step={0.0001}
                      tooltip={t('manage.controls.savingsHint')}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.interestBank}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <H4>{t('shared.assets.bonds')}</H4>
                  <div className="mobile:w-full flex w-1/2 gap-2">
                    <AdminInputField
                      label={t('manage.controls.trend')}
                      name="trendBonds"
                      type="number"
                      step={0.0001}
                      tooltip={t('manage.controls.trendHint')}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.trendBonds}
                    />
                    <AdminInputField
                      label={t('player.allocation.gap')}
                      name="gapBonds"
                      type="number"
                      step={0.0001}
                      tooltip={t('manage.controls.gapHint')}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.gapBonds}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <H4>{t('shared.assets.stocks')}</H4>
                  <div className="mobile:w-full flex w-1/2 gap-2">
                    <AdminInputField
                      label={t('manage.controls.trend')}
                      name="trendStocks"
                      type="number"
                      step={0.0001}
                      tooltip={t('manage.controls.trendHint')}
                      required
                      register={registerPeriod}
                      error={errorsPeriod.trendStocks}
                    />
                    <AdminInputField
                      label={t('player.allocation.gap')}
                      name="gapStocks"
                      type="number"
                      step={0.0001}
                      tooltip={t('manage.controls.gapHint')}
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
        {getButton()}
        {awaitingDice && (
          <p role="status" className="self-center text-sm">
            {t('manage.controls.revealHint')}
          </p>
        )}
        <Link target="_blank" href={`/admin/reports/${game?.id}`}>
          <Button>{t('manage.report.title')}</Button>
        </Link>
      </div>

      <div className="mobile:flex-col mobile:gap-app-4 mt-4 flex w-full flex-row justify-between">
        <div className="mobile:w-full w-1/2">
          <div className="font-bold">{t('manage.controls.players')}</div>
          <div className="mt-2 flex flex-col gap-4">
            {game.players.map((player, ix) => (
              <div key={player.id} data-cy={`player-${ix}`}>
                <PlayerCompact
                  labels={{
                    trader: t('shared.player.trader'),
                    name: t('shared.player.name'),
                    avatar: (player) => t('shared.player.avatar', { player }),
                    login: t('shared.player.login'),
                  }}
                  player={player as Player}
                />
              </div>
            ))}
          </div>
        </div>

        <form
          hidden={game.status === GameStatus.Completed}
          onSubmit={handleCountdownSubmit(onCountdownSubmit)}
        >
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>{t('manage.controls.countdown')}</CardTitle>
              <CardDescription>
                {t('manage.controls.countdownHint')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div data-cy="countdown-seconds">
                <AdminInputField
                  label={t('manage.controls.countdownSeconds')}
                  name="countdownSeconds"
                  type="number"
                  register={registerCountdown}
                  error={errorsCountdown.countdownSeconds}
                  required
                />
              </div>
              {/* TODO(JJ): @RS Do we want to show the following? If no we
                we can remove the refetchQueries.
              */}
              {data.game?.activePeriod?.activeSegment?.countdownExpiresAt}
            </CardContent>
            <CardFooter>
              <Button type="submit">
                {t('manage.controls.startCountdown')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default ManageGame
