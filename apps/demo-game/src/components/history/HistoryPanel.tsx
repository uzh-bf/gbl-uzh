import { cn } from '@gbl-uzh/ui'
import {
  Button,
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'
import { Fragment, useState } from 'react'
import type { ResultQuery } from '~/graphql/generated/ops'
import {
  buildHistory,
  historyAmount,
  historyPercent,
  type HistoryQuarter,
} from '~/lib/history'
import AllocationBar, { assetLabels } from '../cockpit/AllocationBar'
import PortfolioHistoryChart from './PortfolioHistoryChart'

const padding = 'mobile:px-app-4 min-[601px]:px-[32px]'
const cell =
  'px-[12px] py-[20px] mobile:app-cell first:pl-[16px] last:pr-[16px] min-[601px]:first:pl-[32px] min-[601px]:last:pr-[32px]'
const tone = (value: number | null) =>
  value === null || value === 0
    ? 'text-player-muted'
    : value > 0
      ? 'text-player-success'
      : 'text-player-error'

function MonthlyResults({ quarter }: { quarter: HistoryQuarter }) {
  return (
    <table
      className="mobile:app-caption w-full min-[601px]:text-[17px]"
      aria-label={`${quarter.year} Quarter ${quarter.quarter} monthly results`}
    >
      <thead className="text-player-muted">
        <tr>
          {[
            'Month',
            'Dice B / S',
            'Savings',
            'Bonds',
            'Stocks',
            'Result (CHF)',
          ].map((label, index) => (
            <th
              key={label}
              scope="col"
              className={cn(
                'mobile:pb-app-3 pb-[12px] font-normal',
                index < 2 ? 'text-left' : 'text-right'
              )}
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {quarter.months.map((month) => (
          <tr key={month.index}>
            <th
              scope="row"
              className="mobile:py-[var(--app-table-cell-y)] py-[10px] text-left font-semibold"
            >
              {month.index + 1}
            </th>
            <td className="text-player-muted">
              {month.dice
                ? `${month.dice.bonds} / ${month.dice.stocks}`
                : month.revealed
                  ? '—'
                  : 'Not revealed'}
            </td>
            {(['bank', 'bonds', 'stocks'] as const).map((asset) => (
              <td
                key={asset}
                className={cn('text-right tabular-nums', tone(month[asset]))}
              >
                {historyPercent(month[asset])}
              </td>
            ))}
            <td className="text-right font-semibold tabular-nums">
              {historyAmount(month.gain, true)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function QuarterRows({
  quarter,
  showYear,
}: {
  quarter: HistoryQuarter
  showYear: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const detailId = `history-detail-${quarter.id}`
  return (
    <Fragment>
      <TableRow
        className="border-player-border hover:bg-transparent"
        data-cy={`history-quarter-${quarter.year}-${quarter.quarter}`}
      >
        <TableCell className={cell}>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailId}
            aria-label={`${quarter.year} Quarter ${quarter.quarter} monthly details`}
            className="text-player-text focus-visible:outline-player-primary mobile:app-touch mobile:gap-app-2 flex min-h-[44px] items-center gap-[8px] rounded-[4px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
            onClick={() => setExpanded(!expanded)}
          >
            <span
              className="text-player-muted mobile:app-caption text-[14px]"
              aria-hidden="true"
            >
              {expanded ? '▾' : '▸'}
            </span>
            {showYear && `${quarter.year} · `}Q{quarter.quarter}
          </button>
        </TableCell>
        <TableCell className={cell}>
          {quarter.allocation ? (
            <div
              role="img"
              aria-label={`Savings ${quarter.allocation.bank}%, Bonds ${quarter.allocation.bonds}%, Stocks ${quarter.allocation.stocks}%`}
              className="mobile:w-app-mix w-[116px]"
            >
              <AllocationBar
                compact
                value={quarter.allocation}
                className="mobile:h-app-marker h-[20px] rounded-[6px]"
              />
            </div>
          ) : (
            '—'
          )}
        </TableCell>
        {(['bonds', 'stocks'] as const).map((asset) => (
          <TableCell
            key={asset}
            className={cn(
              cell,
              'text-right tabular-nums',
              tone(quarter[asset])
            )}
          >
            {historyPercent(quarter[asset])}
          </TableCell>
        ))}
        <TableCell
          className={cn(cell, 'text-right font-semibold tabular-nums')}
          aria-label={`Result ${historyAmount(quarter.gain, true)} CHF`}
        >
          {historyAmount(quarter.gain, true)}
        </TableCell>
      </TableRow>
      <TableRow
        hidden={!expanded}
        className="border-player-border hover:bg-transparent"
      >
        <TableCell colSpan={5} className="p-0">
          <div
            id={detailId}
            className="bg-player-feedback mobile:px-app-4 mobile:py-app-4 py-[20px] min-[601px]:px-[32px]"
          >
            {quarter.months.length ? (
              <MonthlyResults quarter={quarter} />
            ) : (
              <p className="m-0">Monthly results are unavailable.</p>
            )}
          </div>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

export default function HistoryPanel({
  data,
  active,
}: {
  data: ResultQuery
  active: boolean
}) {
  const history = buildHistory(data)
  const [selectedYear, setSelectedYear] = useState<number | 'all' | null>(null)
  const latestYear = history.years.at(-1) ?? null
  const year =
    selectedYear === 'all' || history.years.includes(selectedYear)
      ? selectedYear
      : latestYear
  // Capture the first available year; refetches must not reset the selection.
  if (selectedYear !== year) setSelectedYear(year)
  const quarters = history.quarters.filter(
    (quarter) => year === 'all' || quarter.year === year
  )
  return (
    <section aria-label="History" data-cy="history-panel">
      {history.years.length > 0 && (
        <div
          className="border-player-divider focus-visible:outline-player-primary mobile:gap-app-2 mobile:p-app-3 flex max-w-full min-w-0 gap-[12px] overflow-x-auto overscroll-x-contain border-b py-[20px] focus-visible:outline-2 focus-visible:outline-offset-[-2px] min-[601px]:px-[32px]"
          role="group"
          aria-label="History year"
          tabIndex={0}
        >
          {(['all', ...history.years] as const).map((option) => (
            <Button
              key={option}
              onClick={() => setSelectedYear(option)}
              aria-pressed={year === option}
              className={{
                root: cn(
                  'mobile:app-control mobile:w-auto mobile:rounded-full shrink-0 rounded-full border-2 bg-white shadow-none min-[601px]:h-[84px] min-[601px]:w-[212px] min-[601px]:text-[26px]',
                  year === option
                    ? 'border-player-primary text-player-primary font-semibold'
                    : 'border-player-input text-player-body font-normal'
                ),
              }}
            >
              {option === 'all' ? 'All' : option}
            </Button>
          ))}
        </div>
      )}
      <div
        className={cn(
          padding,
          'border-player-border mobile:py-app-4 border-b py-[28px] min-[601px]:pt-[36px]'
        )}
      >
        <div className="mobile:gap-x-app-3 mobile:gap-y-app-2 flex flex-wrap items-baseline justify-between gap-x-[16px] gap-y-[6px]">
          <span className="text-player-muted mobile:app-body min-[601px]:text-[26px]">
            Portfolio value
          </span>
          <span className="mobile:gap-app-3 flex items-baseline gap-[14px]">
            <strong
              className="mobile:app-value tabular-nums min-[601px]:text-[42px]"
              data-cy="history-value"
            >
              {historyAmount(history.value)}
            </strong>
            <span className="text-player-muted mobile:app-body min-[601px]:text-[26px]">
              CHF
            </span>
          </span>
        </div>
        <p
          data-cy="history-gain"
          className={cn(
            'mobile:mt-app-3 mobile:mb-app-4 mobile:app-body mt-[12px] mb-[24px] font-semibold min-[601px]:text-[24px]',
            tone(history.gain)
          )}
        >
          {historyAmount(history.gain, true)} since the start ·{' '}
          {historyPercent(history.gainRate)}
        </p>
        {history.quarters.length > 0 ? (
          active && <PortfolioHistoryChart quarters={history.quarters} />
        ) : (
          <p className="text-player-muted mobile:py-app-4 py-[32px]">
            Your history will appear after the first quarter closes.
          </p>
        )}
      </div>
      <h2
        className={cn(
          padding,
          'text-player-muted mobile:mt-app-6 mobile:mb-app-4 mobile:app-caption mt-[36px] mb-[24px] font-semibold tracking-[1px] uppercase min-[601px]:text-[22px]'
        )}
      >
        What each quarter paid
      </h2>
      {quarters.length ? (
        <div
          className="overflow-x-auto"
          role="region"
          aria-label="Quarterly results"
          tabIndex={0}
        >
          <Table
            containerClassName="overflow-visible"
            className="mobile:app-body min-w-[600px] min-[601px]:text-[24px] min-[601px]:leading-[1.5]"
          >
            <TableHeader>
              <TableRow className="border-player-border hover:bg-transparent">
                {['Quarter', 'Your mix', 'Bonds', 'Stocks', 'Result'].map(
                  (label, index) => (
                    <TableHead
                      key={label}
                      className={cn(
                        cell,
                        'text-player-muted h-auto font-normal whitespace-nowrap',
                        index > 1 && 'text-right'
                      )}
                    >
                      {label === 'Result' ? (
                        <span title="Quarterly gain or loss in CHF">
                          Result <span className="sr-only">(CHF)</span>
                        </span>
                      ) : (
                        label
                      )}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarters.map((quarter) => (
                <QuarterRows
                  key={quarter.id}
                  quarter={quarter}
                  showYear={year === 'all'}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p
          className={cn(padding, 'text-player-muted mobile:py-app-4 py-[16px]')}
        >
          {typeof year === 'number'
            ? `No completed quarters in ${year} yet.`
            : 'No completed quarters yet.'}
        </p>
      )}
      <div
        className={cn(
          padding,
          'text-player-muted mobile:gap-x-app-3 mobile:gap-y-app-3 mobile:py-app-4 mobile:app-caption flex flex-wrap gap-x-[28px] gap-y-[12px] py-[28px] min-[601px]:text-[24px]'
        )}
      >
        {Object.entries(assetLabels).map(([key, asset]) => (
          <span
            key={key}
            className="mobile:gap-app-3 flex items-center gap-[10px]"
          >
            <span
              aria-hidden="true"
              className={cn(
                'mobile:size-app-marker size-[18px] rounded-[4px]',
                asset.color
              )}
            />
            {asset.name}
          </span>
        ))}
      </div>
    </section>
  )
}
