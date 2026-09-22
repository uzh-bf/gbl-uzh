import { useSubscription } from '@apollo/client'
import {
  cn,
  getCountdownNotification,
  shouldRefetchGameResult,
} from '@gbl-uzh/ui'
import { Switch } from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef } from 'react'
import {
  GlobalEventsDocument,
  type ResultQuery,
} from 'src/graphql/generated/ops'
import { marketPeriod } from '~/lib/market'
import { queueRefetch } from '~/lib/queuedRefetch'
import { avatarNames, cantonNames } from '~/lib/teamIdentity'
import CompactCountdown from './cockpit/CompactCountdown'
import HistoryPanel from './history/HistoryPanel'
import MarketPanel from './market/MarketPanel'
import TeamContent from './team/TeamContent'
import { useToast } from './ui/use-toast'

const tabs = ['Cockpit', 'Market', 'History', 'Team']
// The reference timeline starts in 2026; each platform period is one year.
const FIRST_GAME_YEAR = 2026

function parseFacts(raw: unknown): Record<string, any> {
  try {
    let value = raw
    for (let i = 0; i < 2 && typeof value === 'string'; i++)
      value = JSON.parse(value)
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : {}
  } catch {
    return {}
  }
}

function GameLayout({
  children,
  action,
  data,
  refetchResult,
  allocationView,
  readyControl,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  data: ResultQuery
  refetchResult: () => Promise<unknown>
  allocationView?: 'editing' | 'submitted' | 'ready'
  readyControl: {
    disabled: boolean
    onChange: (isReady: boolean) => Promise<void>
  }
}) {
  const { self, result } = data
  const currentGame = result?.currentGame
  const activePeriod = currentGame?.activePeriod
  const activeSegment = activePeriod?.activeSegment
  const router = useRouter()
  const tab =
    typeof router.query.tab === 'string' &&
    tabs.some((name) => name.toLowerCase() === router.query.tab)
      ? router.query.tab
      : 'cockpit'
  const detailTab = tab !== 'cockpit'
  const { toast } = useToast()

  const countdownNotifications = useRef({
    '60': false,
    '180': false,
  })
  const previousCountdownSeconds = useRef<number | null>(null)

  const currentGameId = parseInt(currentGame?.id)
  const queuedRefetch = useMemo(
    () => queueRefetch(refetchResult),
    [refetchResult]
  )

  useSubscription(GlobalEventsDocument, {
    skip: !currentGameId,
    onData: ({ data: subData }) => {
      if (subData?.data?.eventsGlobal) {
        const event = subData.data.eventsGlobal
        if (
          shouldRefetchGameResult(event, currentGameId) ||
          (event.type === 'MARKET_ROLL_REVEALED' &&
            event.facts?.gameId === currentGameId)
        ) {
          void queuedRefetch().catch(() => {})
        }
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

  const strExpiresAt = activeSegment?.countdownExpiresAt as string | null
  const countdownDurationMs = activeSegment?.countdownDurationMs as
    number | null

  const expiresAtDate = useMemo(() => {
    return strExpiresAt ? dayjs(strExpiresAt).toDate() : null
  }, [strExpiresAt])

  useEffect(() => {
    if (!strExpiresAt) return

    const dateExpiresAt = dayjs(strExpiresAt)
    const secondsRemaining = dateExpiresAt.diff(dayjs(), 's')
    previousCountdownSeconds.current = secondsRemaining

    if (secondsRemaining > 0) {
      toast({
        title: 'Countdown set/updated!',
        description: `${secondsRemaining} seconds remaining! Please press ready once you are done playing.`,
      })
    }

    countdownNotifications.current = { '60': false, '180': false }
  }, [strExpiresAt, countdownDurationMs, toast])

  if (!self || !currentGame) {
    return null
  }

  const facts = parseFacts(self.facts)
  const segmentIndex = activePeriod?.activeSegment?.index
  const segmentCount =
    currentGame.periods.find((period) => period.id === activePeriod?.id)
      ?.segmentCount ?? 0
  const marketActivePeriod = marketPeriod(currentGame)
  const running = currentGame.status === 'RUNNING'
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
  const initials =
    self.name
      ?.trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'T'
  const avatarKey = String(facts.avatar ?? '')
    .split('/')
    .pop()
    ?.split('.')[0]
  const handleCountdownUpdate = (secondsLeft: number) => {
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
      title: 'Countdown Update',
      description: `Less than ${notification.friendlyMinutes} min remaining! Please press ready.`,
    })
    countdownNotifications.current[notification.secondsKey] = true
  }

  return (
    <>
      <div className="font-player text-player-text min-[785px]:border-player-border mx-auto flex h-dvh w-full max-w-[784px] flex-col bg-white text-[16px] min-[785px]:border-x [&_*]:box-border">
        <header
          className={cn(
            'border-player-divider flex shrink-0 items-center gap-[12px] border-b px-[16px] py-[10px] min-[601px]:gap-[16px] min-[601px]:px-[24px] min-[601px]:py-[16px]',
            detailTab &&
              'min-[601px]:gap-[20px] min-[601px]:px-[32px] min-[601px]:py-[24px]'
          )}
        >
          <div
            className={cn(
              'bg-player-progress text-player-primary grid size-[40px] shrink-0 place-items-center rounded-[6px] text-[17px] font-bold min-[601px]:size-[44px] min-[601px]:text-[18px]',
              detailTab && 'min-[601px]:size-[60px] min-[601px]:text-[24px]'
            )}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                'block text-[18px] leading-[1.15] font-bold [overflow-wrap:anywhere] min-[601px]:text-[22px]',
                detailTab && 'min-[601px]:text-[28px]'
              )}
            >
              {detailTab ? (
                <h1 className="m-0 text-inherit">
                  {tabs.find((name) => name.toLowerCase() === tab)}
                </h1>
              ) : (
                self.name
              )}
            </div>
            <p
              className={cn(
                'text-player-muted m-0 text-[14px] min-[601px]:text-[16px]',
                detailTab && 'min-[601px]:text-[22px]'
              )}
            >
              {tab === 'team' ? (
                `${self.name} · HQ ${cantonNames[facts.location] ?? facts.location ?? '—'}`
              ) : tab === 'history' ? (
                `${self.name} · since quarter 1`
              ) : tab === 'market' ? (
                marketActivePeriod ? (
                  `${FIRST_GAME_YEAR + marketActivePeriod.index} · Quarter ${Math.max(0, marketActivePeriod.activeSegmentIx ?? 0) + 1}`
                ) : (
                  'Waiting for the game'
                )
              ) : allocationView === 'submitted' ||
                allocationView === 'ready' ? (
                `${FIRST_GAME_YEAR + (activePeriod?.index ?? 0)} · Quarter ${(segmentIndex ?? 0) + 1}`
              ) : (
                <>
                  {avatarNames[avatarKey] ?? 'Team'} · HQ{' '}
                  {cantonNames[facts.location] ?? facts.location ?? '—'}
                </>
              )}
            </p>
          </div>
          <div
            className={cn(
              'shrink-0 [font-family:monospace] text-[25px] font-bold tabular-nums min-[601px]:text-[28px]',
              detailTab && 'min-[601px]:text-[36px]'
            )}
          >
            {expiresAtDate && Number.isFinite(expiresAtDate.getTime()) ? (
              <CompactCountdown
                expiresAt={expiresAtDate}
                onUpdate={handleCountdownUpdate}
              />
            ) : (
              <span aria-label="No countdown">—</span>
            )}
          </div>
        </header>
        <section
          hidden={detailTab}
          className="border-player-divider shrink-0 border-b px-[16px] py-[14px] min-[601px]:px-[24px] min-[601px]:py-[20px]"
          aria-label="Game progress"
          data-game-status={currentGame.status}
        >
          <div className="flex items-baseline justify-between gap-[12px] text-[17px] [@media(max-width:360px)]:items-start">
            <h2 className="text-player-muted m-0 text-[12px] font-semibold tracking-[0.8px] uppercase min-[601px]:text-[14px]">
              {activePeriod
                ? `${FIRST_GAME_YEAR + activePeriod.index}${segmentIndex == null ? '' : ` · Quarter ${segmentIndex + 1} of ${segmentCount}`}`
                : 'Waiting for the game'}
            </h2>
            {!running && (
              <span className="font-semibold [@media(max-width:360px)]:whitespace-nowrap">
                {status}
              </span>
            )}
          </div>
          {segmentCount > 0 && (
            <>
              <div
                className={cn(
                  'mt-[12px] flex gap-[8px] min-[601px]:mt-[16px]',
                  !running && 'mb-[12px] min-[601px]:mb-[16px]'
                )}
                aria-hidden="true"
              >
                {Array.from({ length: segmentCount }, (_, index) => (
                  <span
                    key={index}
                    className="bg-player-progress data-[state=done]:bg-player-progress-done data-[state=active]:bg-player-primary h-[8px] min-w-0 flex-1 rounded-[6px] min-[601px]:h-[10px]"
                    data-state={
                      running && index === segmentIndex
                        ? 'active'
                        : index < done
                          ? 'done'
                          : 'upcoming'
                    }
                  />
                ))}
              </div>
              {!running && (
                <p className="text-player-muted m-0 text-[16px]">
                  {done} {done === 1 ? 'quarter' : 'quarters'} done ·{' '}
                  {Math.max(0, segmentCount - done)} to come
                </p>
              )}
            </>
          )}
        </section>
        <main className="min-h-0 flex-1 overflow-auto">
          <div
            hidden={tab !== 'cockpit'}
            className={cn(
              tab !== 'cockpit' && 'hidden',
              !running && 'p-[16px] min-[601px]:px-[24px] min-[601px]:py-[20px]'
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
          {tab === 'cockpit' && (
            <div className="border-player-divider flex min-h-[78px] items-center justify-between gap-[12px] border-t px-[16px] py-[12px] min-[601px]:min-h-[96px] min-[601px]:px-[24px] min-[601px]:py-[16px]">
              {action}
              <div
                className="ml-auto flex items-center gap-[10px]"
                data-cy="ready-switch"
                data-ready={self.isReady}
                data-disabled={readyControl.disabled}
              >
                <label
                  htmlFor="isReady"
                  className={cn(
                    'text-[17px] font-semibold',
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
                      'h-[30px] w-[52px]',
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
            </div>
          )}
          <nav
            className="border-player-border grid grid-cols-4 border-t pb-[env(safe-area-inset-bottom)]"
            aria-label="Player navigation"
          >
            {tabs.map((name) => (
              <Link
                key={name}
                href={`/play/cockpit?tab=${name.toLowerCase()}`}
                shallow
                className="text-player-muted aria-[current=page]:border-player-primary aria-[current=page]:text-player-primary focus-visible:outline-player-primary flex min-h-[56px] items-center justify-center border-t-[3px] border-transparent text-[17px] no-underline focus-visible:outline-[3px] focus-visible:outline-offset-[-4px] aria-[current=page]:font-bold min-[601px]:min-h-[60px]"
                aria-current={tab === name.toLowerCase() ? 'page' : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default GameLayout
