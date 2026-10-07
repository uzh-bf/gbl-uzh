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
import { useTabletLayout } from '~/lib/usePlayerLayout'
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
  // Navigation, columns, and embedded panels must switch in the same render.
  const tablet = useTabletLayout()
  const requestedTab =
    typeof router.query.tab === 'string' &&
    tabs.some(({ id }) => id === router.query.tab)
      ? router.query.tab
      : 'cockpit'
  const tab = tablet && requestedTab !== 'history' ? 'cockpit' : requestedTab
  const marketVisible = tab === 'market' || (tablet && tab === 'cockpit')
  const detailTab = tab !== 'cockpit'
  const resultScreen = !!resultView && !detailTab
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
    // Runs on every SSE (re)connect. Events published while disconnected are
    // not replayed, so refetch to catch up on anything missed.
    onStarted: () => {
      void queuedRefetch().catch(() => {})
    },
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
    const timer = marketVisible
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
  }, [queuedRefetch, marketVisible])

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

  const gameName = self.game?.name ?? `Game ${currentGame.id}`
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
      <div className="font-player text-player-text min-[785px]:border-player-border phone:app-body phone:fixed phone:inset-0 phone:overflow-hidden tablet:max-w-[1440px] mx-auto flex h-dvh w-full max-w-[784px] flex-col bg-white text-[16px] min-[785px]:border-x [&_*]:box-border">
        <header className="border-player-divider phone:gap-app-3 phone:px-app-4 phone:py-app-3 tablet:h-[48px] tablet:gap-[16px] tablet:px-[16px] tablet:py-0 flex shrink-0 items-center border-b">
          <h1
            className={cn(
              'm-0 max-w-[40%] min-w-0 truncate text-[16px] font-bold',
              !tablet && 'hidden'
            )}
            title={gameName}
          >
            {gameName}
          </h1>
          <nav
            className={cn(
              'h-full min-w-0 flex-1 items-stretch gap-[24px]',
              tablet ? 'flex' : 'hidden'
            )}
            aria-label="Cockpit navigation"
          >
            {tabs
              .filter(({ id }) => id === 'cockpit' || id === 'history')
              .map(({ id, label }) => (
                <Link
                  key={id}
                  href={`/play/cockpit?tab=${id}`}
                  shallow
                  aria-current={tab === id ? 'page' : undefined}
                  className="text-player-muted aria-[current=page]:border-player-primary aria-[current=page]:text-player-primary focus-visible:outline-player-primary flex items-center border-b-[3px] border-transparent text-[16px] no-underline focus-visible:outline-2 focus-visible:outline-offset-[-4px] aria-[current=page]:font-bold"
                >
                  {label}
                </Link>
              ))}
          </nav>
          <Link
            href={{
              pathname: '/play/welcome',
              query: { edit: '1', tab: requestedTab },
            }}
            aria-label="Edit player profile"
            className={cn(
              'text-player-primary focus-visible:outline-player-primary phone:size-app-header-avatar phone:app-body relative shrink-0 rounded-full font-bold focus-visible:outline-2 focus-visible:outline-offset-4',
              tablet && 'hidden'
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
          <div className={cn('min-w-0 flex-1', tablet && 'hidden')}>
            <div className="phone:app-body block leading-[1.15] font-bold [overflow-wrap:anywhere]">
              <h1 className="m-0 text-inherit">{gameName}</h1>
            </div>
            <p className="text-player-muted phone:app-caption m-0">
              {self.name} · HQ {cantonNames[location] ?? location ?? '—'}
            </p>
          </div>
          <div className="phone:app-value tablet:app-value shrink-0 [font-family:monospace] font-bold tabular-nums">
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
            'border-player-divider phone:min-h-[72px] phone:px-app-4 phone:py-[6px] tablet:min-h-[72px] tablet:px-[16px] tablet:py-[12px] shrink-0 border-b',
            !detailTab && 'phone:flex phone:flex-col phone:justify-center'
          )}
          aria-label="Game progress"
          data-game-status={currentGame.status}
        >
          <div className="phone:gap-x-app-3 phone:gap-y-0 phone:app-body flex flex-wrap items-baseline justify-between gap-x-[12px] gap-y-[4px] text-[17px] [@media(max-width:360px)]:items-start">
            <h2 className="text-player-muted phone:app-caption tablet:text-[14px] m-0 font-semibold tracking-[0.8px] uppercase">
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
                    'text-player-body phone:app-caption tablet:app-caption'
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
                  'phone:mt-app-2 phone:gap-app-2 tablet:mt-app-3 flex gap-[8px]',
                  !running &&
                    !resultView &&
                    'phone:mb-app-3 min-[641px]:mb-[16px]'
                )}
                aria-hidden="true"
              >
                {Array.from({ length: segmentCount }, (_, index) => (
                  <span
                    key={index}
                    className="bg-player-progress data-[state=done]:bg-player-progress-done data-[state=active]:bg-player-primary h-[8px] min-w-0 flex-1 rounded-[6px]"
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
        <main
          className={cn(
            'phone:overscroll-y-contain tablet:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] min-h-0 flex-1 overflow-auto',
            tablet && 'grid',
            tab === 'history'
              ? 'tablet:grid-rows-[auto_minmax(min-content,1fr)]'
              : 'tablet:grid-rows-[minmax(min-content,1fr)_auto]'
          )}
        >
          <div
            hidden={tab !== 'cockpit'}
            className={cn(
              tab !== 'cockpit' && 'hidden',
              'tablet:col-start-1 tablet:row-start-1 tablet:min-w-0 tablet:overflow-hidden',
              !running &&
                !resultView &&
                'mobile:p-app-4 p-[16px] min-[641px]:px-[24px] min-[641px]:py-[20px]'
            )}
          >
            {children}
          </div>
          <div
            hidden={!marketVisible}
            data-cy="market-block"
            className={cn(
              !marketVisible && 'hidden',
              'tablet:col-span-2 tablet:row-start-2 tablet:min-w-0 tablet:border-t tablet:border-player-divider tablet:min-[1024px]:col-span-1 tablet:min-[1024px]:col-start-1'
            )}
          >
            <MarketPanel data={data} embedded={tablet} />
          </div>
          <div
            hidden={tab !== 'history'}
            className={cn(tab !== 'history' ? 'hidden' : 'tablet:contents')}
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
            active={tablet || tab === 'team'}
            className={cn(
              'tablet:col-start-2 tablet:relative tablet:z-[1] tablet:isolate tablet:min-w-0 tablet:border-l tablet:border-player-divider tablet:bg-white',
              tab === 'history'
                ? 'tablet:row-start-2'
                : 'tablet:row-start-1 tablet:min-[1024px]:row-span-2'
            )}
            identity={
              <div
                className={cn(
                  'border-player-border items-center gap-[8px] border-b px-[12px] py-[8px]',
                  tablet ? 'flex' : 'hidden'
                )}
              >
                <Link
                  href={{
                    pathname: '/play/welcome',
                    query: { edit: '1', tab: requestedTab },
                  }}
                  aria-label="Edit player profile"
                  className="text-player-primary focus-visible:outline-player-primary relative size-[32px] shrink-0 rounded-full text-[14px] font-bold focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <div className="bg-player-progress grid size-full place-items-center overflow-hidden rounded-full">
                    {avatar ? (
                      <Image
                        src={avatar}
                        width={32}
                        height={32}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <CantonFlagBadge location={location} />
                </Link>
                <div className="min-w-0">
                  <h2 className="m-0 text-[14px] leading-[1.3] font-bold [overflow-wrap:anywhere]">
                    {self.name}
                  </h2>
                  <p className="text-player-muted m-0 text-[12px] leading-[1.3]">
                    HQ {cantonNames[location] ?? location ?? '—'}
                  </p>
                </div>
              </div>
            }
            expiresAt={expiresAtDate}
          />
        </main>
        <div className="relative z-[3] shrink-0 bg-white">
          {tab === 'cockpit' && (running || resultView) && (
            <div className="border-player-divider phone:min-h-0 phone:gap-app-3 phone:px-app-4 phone:py-app-3 tablet:min-h-[68px] tablet:px-[16px] tablet:py-[12px] flex items-center justify-between gap-[12px] border-t">
              {resultView ? (
                <p className="text-player-muted phone:app-caption tablet:app-caption m-0">
                  Waiting for the instructor to continue.
                </p>
              ) : (
                <>
                  <p className="text-player-muted tablet:mr-auto tablet:block m-0 hidden text-[14px]">
                    {status}
                  </p>
                  <div className="tablet:order-3 tablet:block contents">
                    {action}
                  </div>
                </>
              )}
              {running && (
                <div
                  className="phone:gap-app-3 tablet:gap-app-3 tablet:order-2 tablet:ml-0 ml-auto flex items-center gap-[10px]"
                  data-cy="ready-switch"
                  data-ready={self.isReady}
                  data-disabled={readyControl.disabled}
                >
                  <label
                    htmlFor="isReady"
                    className={cn(
                      'phone:app-body tablet:app-body text-[17px] font-semibold',
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
                        'phone:app-switch-target tablet:app-switch-target h-[30px] w-[52px]',
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
            className={cn(
              'border-player-border grid-cols-4 border-t pb-[env(safe-area-inset-bottom)]',
              tablet ? 'hidden' : 'grid'
            )}
            aria-label="Player navigation"
          >
            {tabs.map(({ id, label }) => (
              <Link
                key={id}
                href={`/play/cockpit?tab=${id}`}
                shallow
                className="text-player-muted aria-[current=page]:border-player-primary aria-[current=page]:text-player-primary focus-visible:outline-player-primary phone:min-h-app-nav phone:app-body flex items-center justify-center border-t-[3px] border-transparent text-[17px] no-underline focus-visible:outline-[3px] focus-visible:outline-offset-[-4px] aria-[current=page]:font-bold"
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
