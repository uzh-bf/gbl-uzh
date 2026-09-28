import { useQuery, useSubscription } from '@apollo/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import {
  PerformanceChart,
  RiskReturnChart,
  SharpeChart,
} from '~/components/admin/report/ReportCharts'
import {
  Decisions,
  Ranking,
  ReportMessage,
  ReportScopeTabs,
  ReportSummary,
} from '~/components/admin/report/ReportOverview'
import {
  GameDocument,
  GlobalEventsDocument,
  SpecificResultsDocument,
} from '~/graphql/generated/ops'
import {
  buildAdminReport,
  type ReportMode,
  type ReportScope,
} from '~/lib/adminReport'
import { shouldRefetchDemoGame } from '~/lib/gameEvents'
import { queueRefetch } from '~/lib/queuedRefetch'

export default function ReportGame() {
  const router = useRouter()
  const { data: session } = useSession()
  const [scope, setScope] = useState<ReportScope>('all')
  const [mode, setMode] = useState<ReportMode>('assets')
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const id = Number(router.query.id)
  const skip = !router.isReady || !Number.isInteger(id) || id <= 0
  const gameQuery = useQuery(GameDocument, {
    variables: { id },
    skip,
    fetchPolicy: 'network-only',
  })
  const segmentQuery = useQuery(SpecificResultsDocument, {
    variables: { gameId: id, type: 'SEGMENT_END' },
    skip,
    fetchPolicy: 'network-only',
  })
  const periodQuery = useQuery(SpecificResultsDocument, {
    variables: { gameId: id, type: 'PERIOD_END' },
    skip,
    fetchPolicy: 'network-only',
  })
  const { refetch: refetchGame } = gameQuery
  const { refetch: refetchSegments } = segmentQuery
  const { refetch: refetchPeriods } = periodQuery
  const refresh = useMemo(
    () =>
      queueRefetch(() =>
        // Finish every read before a queued event starts the next refresh.
        // Query errors are rendered below, so this callback need not rethrow.
        Promise.allSettled([refetchGame(), refetchSegments(), refetchPeriods()])
      ),
    [refetchGame, refetchSegments, refetchPeriods]
  )
  useSubscription(GlobalEventsDocument, {
    skip,
    onData: ({ data }) => {
      if (shouldRefetchDemoGame(data.data?.eventsGlobal, id)) void refresh()
    },
  })
  useEffect(() => {
    if (skip) return
    const onRefresh = () => void refresh()
    window.addEventListener('focus', onRefresh)
    window.addEventListener('online', onRefresh)
    return () => {
      window.removeEventListener('focus', onRefresh)
      window.removeEventListener('online', onRefresh)
    }
  }, [refresh, skip])
  const game = gameQuery.data?.game
  const report = useMemo(
    () =>
      game
        ? buildAdminReport(
            game,
            segmentQuery.data?.specificResults ?? [],
            periodQuery.data?.specificResults ?? [],
            scope
          )
        : null,
    [game, segmentQuery.data, periodQuery.data, scope]
  )
  const loading =
    !router.isReady ||
    gameQuery.loading ||
    segmentQuery.loading ||
    periodQuery.loading
  const error = gameQuery.error || segmentQuery.error || periodQuery.error
  const initials =
    session?.user?.name
      ?.trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD'
  const latestCompleted = report?.years.filter((year) => year.complete).at(-1)
  const status =
    latestCompleted && game?.status === 'RESULTS'
      ? `${latestCompleted.year} complete`
      : game?.status.toLowerCase().replaceAll('_', ' ')
  const focusTeam = (teamId: string) =>
    setFocusedId((current) => (current === teamId ? null : teamId))

  return (
    <main
      className="font-player text-player-text min-h-screen w-full bg-white text-[14px] leading-[1.4]"
      data-cy={!loading && !error && report ? 'report-loaded' : undefined}
    >
      <header className="border-player-divider flex min-h-[58px] items-center justify-between gap-[16px] border-b px-[24px] py-[12px]">
        <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[2px]">
          <span className="text-[16px] font-bold">Minigame</span>
          <h1 className="text-player-muted text-[13px] font-normal">
            Admin · {game ? `Game ${game.id}` : 'Report'}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-[16px]">
          <span className="text-player-muted text-[13px]">{status}</span>
          <span
            aria-label={session?.user?.name ?? 'Admin'}
            className="bg-player-progress text-player-primary grid h-[34px] w-[34px] place-items-center rounded-full text-[12px] font-bold"
          >
            {initials}
          </span>
        </div>
      </header>
      {loading ? (
        <ReportMessage>Loading report…</ReportMessage>
      ) : error ? (
        <ReportMessage onRetry={() => void refresh()}>
          The report could not be loaded. Please try again.
        </ReportMessage>
      ) : !game || !report ? (
        <ReportMessage>Game not found.</ReportMessage>
      ) : (
        <>
          <ReportScopeTabs
            years={report.years}
            scope={scope}
            onScope={setScope}
          />
          <ReportSummary report={report} />
          <div className="grid min-w-0 min-[1024px]:grid-cols-[minmax(0,7fr)_minmax(370px,3.1fr)]">
            <PerformanceChart
              report={report}
              focusedId={focusedId}
              mode={mode}
              onMode={setMode}
            />
            <Ranking
              report={report}
              focusedId={focusedId}
              onFocus={focusTeam}
            />
          </div>
          <Decisions report={report} focusedId={focusedId} />
          <div className="border-player-border grid border-t min-[1024px]:grid-cols-2">
            <RiskReturnChart report={report} focusedId={focusedId} />
            <SharpeChart report={report} focusedId={focusedId} />
          </div>
        </>
      )}
    </main>
  )
}
