import { cn } from '@gbl-uzh/ui'
import { Button, Tooltip } from '@uzh-bf/design-system'
import type { ReactNode } from 'react'
import AllocationBar from '~/components/cockpit/AllocationBar'
import {
  type AdminReport,
  type ReportScope,
  type ReportTeam,
  reportAmount,
  reportPercent,
} from '~/lib/adminReport'
import { ALLOCATION_KEYS, type Allocation } from '~/lib/allocation'
import { assetLabels } from '~/lib/constants'

export const headingClass =
  'text-[12px] font-semibold uppercase tracking-[0.08em] text-player-muted'
export const focusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-player-primary'

export function ReportScopeTabs({
  years,
  scope,
  onScope,
}: {
  years: AdminReport['years']
  scope: ReportScope
  onScope: (scope: ReportScope) => void
}) {
  const tabs: { value: ReportScope; label: string; detail: string }[] = [
    ...years.map(({ index, year, quarters }) => ({
      value: index,
      label: String(year),
      detail: quarters.length
        ? `Q${quarters[0]}${quarters.length > 1 ? `–Q${quarters.at(-1)}` : ''}`
        : 'No quarters',
    })),
    {
      value: 'all',
      label: 'Whole game',
      detail: years.length
        ? `${years[0].year}${years.length > 1 ? `–${years.at(-1)!.year}` : ''}`
        : 'No years',
    },
  ]
  return (
    <nav
      aria-label="Report scope"
      className="border-player-divider flex items-end gap-[28px] overflow-x-auto border-b px-[24px]"
    >
      <span className={cn(headingClass, 'pb-[16px]')}>Report</span>
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          aria-pressed={scope === tab.value}
          onClick={() => onScope(tab.value)}
          className={{
            root: cn(
              'hover:bg-player-feedback shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-[14px] text-left font-normal shadow-none',
              focusClass,
              scope === tab.value && 'border-player-primary text-player-primary'
            ),
          }}
        >
          <span className="block">
            <span
              className={cn(
                'block text-[14px]',
                scope === tab.value && 'text-player-primary font-bold'
              )}
            >
              {tab.label}
            </span>
            <span className="text-player-muted mt-[4px] block text-[12px]">
              {tab.detail}
            </span>
          </span>
        </Button>
      ))}
    </nav>
  )
}

export function TeamDot({ team }: { team: ReportTeam }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-[10px] w-[10px] shrink-0 rounded-[3px]"
      style={{ backgroundColor: team.color }}
    />
  )
}

export function ReturnValue({ value }: { value: number | null }) {
  return (
    <span
      className={
        value === null
          ? 'text-player-muted'
          : value < 0
            ? 'text-[#dc582a]'
            : 'text-player-success'
      }
    >
      {reportPercent(value)}
    </span>
  )
}

export function AllocationLegend({ value }: { value?: Allocation | null }) {
  return (
    <div className="text-player-body flex flex-wrap gap-x-[16px] gap-y-[4px] text-[12px]">
      {ALLOCATION_KEYS.map((key) => (
        <span key={key} className="inline-flex items-center gap-[6px]">
          <span
            aria-hidden="true"
            className={cn(
              'h-[8px] w-[8px] rounded-[2px]',
              assetLabels[key].color
            )}
          />
          {assetLabels[key].name}
          {value && (
            <strong className="text-player-text">
              {Number(value[key].toFixed(1))}%
            </strong>
          )}
        </span>
      ))}
    </div>
  )
}

export function ReportAllocation({
  value,
  label,
}: {
  value: Allocation | null
  label: string
}) {
  if (!value)
    return (
      <span className="text-player-muted" aria-label={`${label}: unavailable`}>
        —
      </span>
    )
  const text = ALLOCATION_KEYS.map(
    (key) => `${assetLabels[key].name} ${Number(value[key].toFixed(1))}%`
  ).join(', ')
  return (
    <Tooltip
      tooltip={text}
      className={{
        tooltip: 'font-player text-[13px]',
        trigger: cn('relative block h-[20px] w-full rounded-[3px]', focusClass),
      }}
    >
      <span className="sr-only">
        {label}: {text}
      </span>
      <AllocationBar value={value} report />
    </Tooltip>
  )
}

export function ReportSummary({ report }: { report: AdminReport }) {
  const cell =
    'min-w-0 px-[24px] py-[20px] min-[600px]:border-r min-[600px]:border-player-border last:border-r-0'
  const label = 'mb-[5px] text-[13px] text-player-muted'
  const value = 'text-[25px] leading-[1.25] font-bold'
  return (
    <section
      aria-label="Report summary"
      className="divide-player-border border-player-border grid divide-y border-b min-[600px]:grid-cols-4 min-[600px]:divide-y-0"
    >
      <div className={cell}>
        <p className={label}>Top team</p>
        <p className={cn(value, 'truncate')}>{report.top?.name ?? '—'}</p>
        <p className="text-player-muted mt-[6px] text-[12px]">
          {report.top
            ? `${reportAmount(report.top.assets)} CHF · ${reportPercent(report.top.return)}`
            : 'No settled results'}
        </p>
      </div>
      <div className={cell}>
        <p className={label}>Average return</p>
        <p className={value}>{reportPercent(report.averageReturn)}</p>
        <p className="text-player-muted mt-[6px] text-[12px]">
          Across {report.eligibleCount}{' '}
          {report.eligibleCount === 1 ? 'team' : 'teams'}
        </p>
      </div>
      <div className={cell}>
        <p className={label}>Best Sharpe ratio</p>
        <p className={value}>{report.bestSharpe?.sharpe?.toFixed(2) ?? '—'}</p>
        <p className="text-player-muted mt-[6px] text-[12px]">
          {report.bestSharpe?.name ?? 'No eligible teams'}
        </p>
      </div>
      <div className={cell}>
        <p className={label}>Average mix</p>
        <div className="my-[14px] h-[12px]">
          {report.mix ? (
            <AllocationBar
              value={report.mix}
              compact
              className="rounded-[3px]"
            />
          ) : (
            <span>—</span>
          )}
        </div>
        <AllocationLegend value={report.mix} />
      </div>
    </section>
  )
}

export type FocusProps = {
  focusedId: string | null
  onFocus: (id: string) => void
}

export function Ranking({
  report,
  focusedId,
  onFocus,
}: { report: AdminReport } & FocusProps) {
  const selected = report.teams.find((team) => team.id === focusedId)
  return (
    <section
      aria-label="Ranking"
      className="border-player-border flex max-h-[468px] min-w-0 flex-col border-t min-[1024px]:border-t-0 min-[1024px]:border-l"
    >
      <div className="border-player-border flex flex-wrap items-center justify-between gap-[8px] border-b px-[24px] py-[16px]">
        <h2 className={headingClass}>Ranking</h2>
        <span className="text-player-muted text-[12px]">
          {selected
            ? `Click ${selected.name} again to show all`
            : 'Click a team to focus it'}
        </span>
      </div>
      <div
        className="text-player-muted grid grid-cols-[28px_minmax(0,1fr)_95px_65px] gap-[8px] px-[24px] py-[7px] text-[12px]"
        aria-hidden="true"
      >
        <span>#</span>
        <span>Team</span>
        <span className="text-right">Assets CHF</span>
        <span className="text-right">Return</span>
      </div>
      <ol className="min-h-0 overflow-y-auto pb-[10px]">
        {report.ranking.map((team, index) => (
          <li key={team.id}>
            <button
              type="button"
              aria-label={`Focus ${team.name}`}
              aria-describedby={`report-ranking-${team.seriesKey}`}
              aria-pressed={focusedId === team.id}
              onClick={() => onFocus(team.id)}
              className={cn(
                'hover:bg-player-feedback relative grid min-h-[25px] w-full grid-cols-[28px_minmax(0,1fr)_95px_65px] items-center gap-[8px] border-y-2 border-transparent px-[24px] text-left text-[13px] max-[599px]:min-h-[44px]',
                focusClass,
                focusedId === team.id && 'border-player-primary font-bold'
              )}
            >
              <span id={`report-ranking-${team.seriesKey}`} className="sr-only">
                Rank {index + 1}. Assets {reportAmount(team.assets)} CHF. Return{' '}
                {reportPercent(team.return)}.
              </span>
              <span className="text-player-muted">{index + 1}</span>
              <span
                className={cn(
                  'flex min-w-0 items-center gap-[8px]',
                  focusedId && focusedId !== team.id && 'opacity-25'
                )}
              >
                <TeamDot team={team} />
                <span className="truncate">{team.name}</span>
              </span>
              <span className="text-right tabular-nums">
                {reportAmount(team.assets)}
              </span>
              <span className="text-right tabular-nums">
                <ReturnValue value={team.return} />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Decisions({
  report,
  focusedId,
}: {
  report: AdminReport
  focusedId: string | null
}) {
  const row = (
    name: string,
    decisions: Record<string, Allocation | null>,
    team?: ReportTeam
  ) => (
    <tr
      key={team?.id ?? 'average'}
      data-team-id={team?.id}
      data-focused={team ? focusedId === team.id : undefined}
      className={cn(
        'border-player-border border-b',
        !team && 'font-bold',
        team?.id === focusedId && 'border-player-primary border-y-2'
      )}
    >
      <th
        scope="row"
        className={cn(
          'sticky left-0 z-10 bg-white px-[8px] py-[5px] text-left font-normal',
          !team && 'font-bold',
          team?.id === focusedId && 'text-player-primary font-bold'
        )}
      >
        <span className="flex items-center gap-[8px]">
          {team && <TeamDot team={team} />}
          <span className="max-w-[160px] truncate">{name}</span>
        </span>
      </th>
      {report.quarters.map((q) => (
        <td key={q.key} className="px-[6px] py-[4px]">
          <ReportAllocation
            value={decisions[q.key]}
            label={`${name}, ${q.label}`}
          />
        </td>
      ))}
    </tr>
  )
  return (
    <section
      aria-label="Decisions"
      className="border-player-border border-t px-[24px] py-[24px]"
    >
      <div className="mb-[14px] flex flex-wrap items-center justify-between gap-[12px]">
        <div className="flex flex-wrap items-center gap-[12px]">
          <h2 className={headingClass}>Decisions</h2>
          <span className="text-player-muted text-[13px]">
            Allocation per quarter in %, hover or focus a bar for all values
          </span>
        </div>
        <AllocationLegend />
      </div>
      {report.quarters.length ? (
        <div className="max-h-[640px] overflow-auto pb-[2px]">
          <table
            className="w-full table-fixed border-collapse text-[13px]"
            style={{ minWidth: 180 + report.quarters.length * 145 }}
          >
            <caption className="sr-only">Team allocations by quarter</caption>
            <colgroup>
              <col style={{ width: 180 }} />
              {report.quarters.map((q) => (
                <col key={q.key} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-20 bg-white">
              <tr className="border-player-border text-player-muted border-b text-[12px]">
                <th
                  scope="col"
                  className="px-[8px] pb-[10px] text-left font-normal"
                >
                  Team
                </th>
                {report.quarters.map((q) => (
                  <th
                    scope="col"
                    key={q.key}
                    className="px-[6px] pb-[10px] text-left font-normal"
                  >
                    {q.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {row('Average', report.averageDecisions)}
              {report.teams.map((team) => row(team.name, team.decisions, team))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-player-muted">No quarters configured.</p>
      )}
    </section>
  )
}

export function ReportMessage({
  children,
  onRetry,
}: {
  children: ReactNode
  onRetry?: () => void
}) {
  return (
    <div
      role={onRetry ? 'alert' : 'status'}
      className="text-player-muted p-[40px] text-center"
    >
      {children}
      {onRetry && (
        <Button
          onClick={onRetry}
          className={{ root: 'mx-auto mt-[16px] block' }}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
