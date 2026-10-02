import { cn, getCountdownNotification } from '@gbl-uzh/ui'
import { Switch } from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef } from 'react'
import { cantonNames, FIRST_GAME_YEAR } from '~/lib/constants'
import { parseFacts } from '~/lib/facts'
import { shouldRefetchDemoGame } from '~/lib/gameEvents'
import { queueRefetch } from '~/lib/queuedRefetch'
import type { ResultView } from '~/lib/results'
import { trpc } from '~/lib/trpc'
import type { GameData } from '~/types/api'
import CantonFlagBadge from './CantonFlagBadge'
import CompactCountdown from './cockpit/CompactCountdown'
import HistoryPanel from './history/HistoryPanel'
import MarketPanel from './market/MarketPanel'
import TeamContent from './team/TeamContent'
import { useToast } from './ui/use-toast'

const tabs = [
  { id: 'cockpit', label: 'Decisions' },
  { id: 'market', label: 'Market' },
  { id: 'history', label: 'History' },
  { id: 'team', label: 'Team' },
]

function GameLayout({
  children,
  action,
  data,
  refetchResult,
  readyControl,
  resultView,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  data: GameData
  refetchResult: () => Promise<unknown>
  resultView?: ResultView | null
  readyControl: {
    disabled: boolean
    onChange: (isReady: boolean) => Promise<void>
  }
}) {
  const { self, result } = data
  const currentGame = result?.currentGame
  const activePeriod = currentGame?.activePeriod
  const activeSegment = activePeriod?.activeSegment
  const running = currentGame?.status === 'RUNNING'
  const router = useRouter()
  const tab =
    typeof router.query.tab === 'string' &&
    tabs.some(({ id }) => id === router.query.tab)
      ? router.query.tab
      : 'cockpit'
  const detailTab = tab !== 'cockpit'
  const resultScreen = !!resultView && !detailTab
  const expandedHeader = detailTab || resultScreen
  const { toast } = useToast()

  const countdownNotifications = useRef({
    '60': false,
    '180': false,
  })
  const previousCountdownSeconds = useRef<number | null>(null)

  const currentGameId = currentGame?.id
  const queuedRefetch = useMemo(
    () => queueRefetch(refetchResult),
    [refetchResult]
  )

  trpc.events.global.useSubscription(undefined, {
    enabled: Boolean(currentGameId),
    onData: (event) => {
      if (currentGameId && shouldRefetchDemoGame(event, currentGameId)) {
        void queuedRefetch().catch(() => {})
      }
    },
  })

  useEffect(() => {
    const refresh = () => {
      void queuedRefetch().catch(() => {
        /* Retry on the next focus, reconnect, or refresh. */
      })
    }
    const timer =
      tab === 'market'
        ? window.setInterval(() => {
            if (document.visibilityState === 'visible') refresh()
          }, 30_000)
        : undefined
    window.addEventListener('focus', refresh)
    window.addEventListener('online', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('online', refresh)
    }
  }, [queuedRefetch, tab])

  // A string key keeps the countdown effects from re-running on every refetch,
  // which returns a new Date instance for the same deadline.
  const strExpiresAt = activeSegment?.countdownExpiresAt?.toISOString() ?? null
  const countdownDurationMs = activeSegment?.countdownDurationMs ?? null

  const expiresAtDate = useMemo(() => {
    return strExpiresAt ? dayjs(strExpiresAt).toDate() : null
  }, [strExpiresAt])

  useEffect(() => {
    countdownNotifications.current = { '60': false, '180': false }
    previousCountdownSeconds.current = null
    if (!running || !strExpiresAt) return

    const dateExpiresAt = dayjs(strExpiresAt)
    const secondsRemaining = dateExpiresAt.diff(dayjs(), 's')
    previousCountdownSeconds.current = secondsRemaining

    if (secondsRemaining > 0) {
      toast({
        variant: 'countdown',
        title: 'Countdown set/updated!',
        description: `${secondsRemaining} seconds remaining! Please press ready once you are done playing.`,
      })
    }
  }, [running, strExpiresAt, countdownDurationMs, toast])

  if (!self || !currentGame) {
    return null
  }

  const facts = parseFacts(self.facts)
  const location =
    typeof facts.location === 'string' ? facts.location : undefined
  const segmentIndex = resultView
    ? resultView.quarter - 1
    : activePeriod?.activeSegment?.index
  const segmentCount =
    resultView?.segmentCount ??
    currentGame.periods.find((period) => period.id === activePeriod?.id)
      ?.segmentCount ??
    0
  const done =
    segmentIndex == null
      ? 0
      : running
        ? segmentIndex
        : ['PAUSED', 'CONSOLIDATION', 'RESULTS'].includes(currentGame.status)
          ? segmentIndex + 1
          : 0
  const status = {
    RUNNING: 'Allocation open',
    PAUSED: 'Allocation closed',
    CONSOLIDATION: 'Allocation closed',
    RESULTS: 'Period results',
    PREPARATION: 'Preparing',
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
  }[currentGame.status]
  const resultCopy =
    resultView &&
    {
      PAUSED: {
        heading: `Game ${currentGame.id} · ${resultView.year} · Quarter ${resultView.quarter} closed`,
        detail: resultView.monthRange,
      },
      CONSOLIDATION: {
        heading: `After quarter ${resultView.quarter}`,
        detail: 'Consolidation · held',
      },
      RESULTS: {
        heading: `${resultView.year} closed`,
        detail: 'All quarters closed',
      },
    }[resultView.status]
  const initials =
    self.name
      ?.trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'T'
  const avatar = typeof facts.avatar === 'string' ? facts.avatar : ''
  const handleCountdownUpdate = (secondsLeft: number) => {
    if (!running) return
    const previousSecondsLeft = previousCountdownSeconds.current
    previousCountdownSeconds.current = secondsLeft
    if (previousSecondsLeft === null) return
    const notification = getCountdownNotification(
      secondsLeft,
      previousSecondsLeft,
      countdownNotifications.current
    )
    if (!notification) return
    toast({
      variant: 'countdown',
      title: 'Countdown Update',
      description: `Less than ${notification.friendlyMinutes} min remaining! Please press ready.`,
    })
    countdownNotifications.current[notification.secondsKey] = true
  }

  return (
    <>
      <div className="font-player text-player-text min-[785px]:border-player-border phone:app-body phone:fixed phone:inset-0 phone:overflow-hidden mx-auto flex h-dvh w-full max-w-[784px] flex-col bg-white text-[16px] min-[785px]:border-x [&_*]:box-border">
        <header
          className={cn(
            'border-player-divider phone:gap-app-3 phone:px-app-4 phone:py-app-3 flex shrink-0 items-center border-b min-[601px]:gap-[16px] min-[601px]:px-[24px] min-[601px]:py-[16px]',
            expandedHeader &&
              'min-[601px]:gap-[20px] min-[601px]:px-[32px] min-[601px]:py-[24px]'
          )}
        >
          <Link
            href={{ pathname: '/play/welcome', query: { edit: '1', tab } }}
            aria-label="Edit player profile"
            className={cn(
              'text-player-primary focus-visible:outline-player-primary phone:size-app-header-avatar phone:app-body relative shrink-0 rounded-full font-bold focus-visible:outline-2 focus-visible:outline-offset-4 min-[601px]:size-[44px] min-[601px]:text-[18px]',
              expandedHeader &&
                'min-[601px]:size-[60px] min-[601px]:text-[24px]'
            )}
          >
            <div className="bg-player-progress grid size-full place-items-center overflow-hidden rounded-full">
              {avatar ? (
                <Image
                  src={avatar}
                  width={60}
                  height={60}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <CantonFlagBadge location={location} />
          </Link>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                'phone:app-body block leading-[1.15] font-bold [overflow-wrap:anywhere] min-[601px]:text-[22px]',
                expandedHeader && 'min-[601px]:text-[28px]'
              )}
            >
              <h1 className="m-0 text-inherit">{self.name}</h1>
            </div>
            <p
              className={cn(
                'text-player-muted phone:app-caption m-0 min-[601px]:text-[16px]',
                expandedHeader && 'leading-[1.25] min-[601px]:text-[22px]'
              )}
            >
              HQ {cantonNames[location] ?? location ?? '—'}
            </p>
          </div>
          <div
            className={cn(
              'phone:app-value shrink-0 [font-family:monospace] font-bold tabular-nums min-[601px]:text-[28px]',
              detailTab && 'min-[601px]:text-[36px]'
            )}
          >
            {expiresAtDate && Number.isFinite(expiresAtDate.getTime()) ? (
              <CompactCountdown
                expiresAt={expiresAtDate}
                onUpdate={handleCountdownUpdate}
              />
            ) : (
              !resultScreen && <span aria-label="No countdown">—</span>
            )}
          </div>
        </header>
        <section
          hidden={detailTab}
          className={cn(
            'border-player-divider phone:px-app-4 phone:py-app-3 shrink-0 border-b min-[601px]:px-[24px] min-[601px]:py-[20px]',
            resultScreen && 'min-[601px]:px-[32px] min-[601px]:py-[28px]'
          )}
          aria-label="Game progress"
          data-game-status={currentGame.status}
        >
          <div className="phone:gap-x-app-3 phone:gap-y-app-1 phone:app-body flex flex-wrap items-baseline justify-between gap-x-[12px] gap-y-[4px] text-[17px] [@media(max-width:360px)]:items-start">
            <h2
              className={cn(
                'text-player-muted phone:app-caption m-0 font-semibold tracking-[0.8px] uppercase min-[601px]:text-[14px]',
                resultScreen && 'min-[601px]:text-[22px]'
              )}
            >
              {resultView
                ? resultCopy.heading
                : activePeriod
                  ? `${FIRST_GAME_YEAR + activePeriod.index}${segmentIndex == null ? '' : ` · Quarter ${segmentIndex + 1} of ${segmentCount}`}`
                  : 'Waiting for the game'}
            </h2>
            {!running && (
              <span
                className={cn(
                  'font-semibold [@media(max-width:360px)]:whitespace-nowrap',
                  resultScreen &&
                    'text-player-body phone:app-caption min-[601px]:text-[24px]'
                )}
              >
                {resultView ? resultCopy.detail : status}
              </span>
            )}
          </div>
          {segmentCount > 0 && (
            <>
              <div
                className={cn(
                  'phone:mt-app-3 phone:gap-app-2 flex gap-[8px] min-[601px]:mt-[16px]',
                  !running &&
                    !resultView &&
                    'phone:mb-app-3 min-[601px]:mb-[16px]'
                )}
                aria-hidden="true"
              >
                {Array.from({ length: segmentCount }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'bg-player-progress data-[state=done]:bg-player-progress-done data-[state=active]:bg-player-primary h-[8px] min-w-0 flex-1 rounded-[6px] min-[601px]:h-[10px]',
                      resultScreen && 'min-[601px]:h-[16px]'
                    )}
                    data-state={
                      (running || resultView?.status === 'PAUSED') &&
                      index === segmentIndex
                        ? 'active'
                        : index < done
                          ? 'done'
                          : 'upcoming'
                    }
                  />
                ))}
              </div>
              {!running && !resultView && (
                <p className="text-player-muted phone:app-body m-0 text-[16px]">
                  {done} {done === 1 ? 'quarter' : 'quarters'} done ·{' '}
                  {Math.max(0, segmentCount - done)} to come
                </p>
              )}
            </>
          )}
        </section>
        <main className="phone:overscroll-y-contain min-h-0 flex-1 overflow-auto">
          <div
            hidden={tab !== 'cockpit'}
            className={cn(
              tab !== 'cockpit' && 'hidden',
              !running &&
                !resultView &&
                'mobile:p-app-4 p-[16px] min-[601px]:px-[24px] min-[601px]:py-[20px]'
            )}
          >
            {children}
          </div>
          <div
            hidden={tab !== 'market'}
            className={cn(tab !== 'market' && 'hidden')}
          >
            <MarketPanel data={data} />
          </div>
          <div
            hidden={tab !== 'history'}
            className={cn(tab !== 'history' && 'hidden')}
          >
            <HistoryPanel
              key={currentGame.id}
              data={data}
              active={tab === 'history'}
            />
          </div>
          <TeamContent
            key={`${currentGame.id}:${self.id}`}
            data={data}
            active={tab === 'team'}
            expiresAt={expiresAtDate}
          />
        </main>
        <div className="relative z-[3] shrink-0 bg-white">
          {tab === 'cockpit' && (running || resultView) && (
            <div
              className={cn(
                'border-player-divider phone:min-h-0 phone:gap-app-3 phone:px-app-4 phone:py-app-3 flex items-center justify-between gap-[12px] border-t min-[601px]:min-h-[96px] min-[601px]:px-[24px] min-[601px]:py-[16px]',
                resultScreen && 'min-[601px]:px-[32px]'
              )}
            >
              {resultView ? (
                <p className="text-player-muted phone:app-caption m-0 min-[601px]:text-[24px]">
                  Waiting for the instructor to continue.
                </p>
              ) : (
                action
              )}
              {running && (
                <div
                  className="phone:gap-app-3 ml-auto flex items-center gap-[10px]"
                  data-cy="ready-switch"
                  data-ready={self.isReady}
                  data-disabled={readyControl.disabled}
                >
                  <label
                    htmlFor="isReady"
                    className={cn(
                      'phone:app-body text-[17px] font-semibold',
                      readyControl.disabled
                        ? 'text-player-disabled'
                        : self.isReady
                          ? 'text-player-success'
                          : 'text-player-primary'
                    )}
                  >
                    Ready
                  </label>
                  <Switch
                    id="isReady"
                    checked={self.isReady}
                    disabled={readyControl.disabled}
                    size="lg"
                    className={{
                      element: cn(
                        'phone:app-switch-target h-[30px] w-[52px]',
                        self.isReady
                          ? 'bg-player-success disabled:bg-player-success'
                          : 'bg-player-switch disabled:bg-player-switch'
                      ),
                      thumb: cn(
                        'ml-[3px] size-[24px] shadow-[0_1px_3px_#0002] [&>svg]:invisible',
                        self.isReady ? 'translate-x-[22px]' : 'translate-x-0'
                      ),
                    }}
                    onCheckedChange={readyControl.onChange}
                  />
                </div>
              )}
            </div>
          )}
          <nav
            className="border-player-border grid grid-cols-4 border-t pb-[env(safe-area-inset-bottom)]"
            aria-label="Player navigation"
          >
            {tabs.map(({ id, label }) => (
              <Link
                key={id}
                href={`/play/cockpit?tab=${id}`}
                shallow
                className={cn(
                  'text-player-muted aria-[current=page]:border-player-primary aria-[current=page]:text-player-primary focus-visible:outline-player-primary phone:min-h-app-nav phone:app-body flex items-center justify-center border-t-[3px] border-transparent text-[17px] no-underline focus-visible:outline-[3px] focus-visible:outline-offset-[-4px] aria-[current=page]:font-bold min-[601px]:min-h-[60px]',
                  resultScreen &&
                    'min-[601px]:min-h-[108px] min-[601px]:text-[24px]'
                )}
                aria-current={tab === id ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default GameLayout
