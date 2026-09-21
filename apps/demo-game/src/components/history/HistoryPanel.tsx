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

const padding = 'px-[16px] min-[601px]:px-[32px]'
const cell =
  'px-[12px] py-[20px] first:pl-[16px] last:pr-[16px] min-[601px]:first:pl-[32px] min-[601px]:last:pr-[32px]'
const tone = (value: number | null) =>
  value === null || value === 0
    ? 'text-player-muted'
    : value > 0
      ? 'text-player-success'
      : 'text-player-error'

function MonthlyResults({ quarter }: { quarter: HistoryQuarter }) {
  return (
    <table
      className="w-full text-[14px] min-[601px]:text-[17px]"
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
                'pb-[12px] font-normal',
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
            <th scope="row" className="py-[10px] text-left font-semibold">
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

function QuarterRows({ quarter }: { quarter: HistoryQuarter }) {
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
            className="text-player-text focus-visible:outline-player-primary flex min-h-[44px] items-center gap-[8px] rounded-[4px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="text-player-muted text-[14px]" aria-hidden="true">
              {expanded ? '▾' : '▸'}
            </span>
            Q{quarter.quarter}
          </button>
        </TableCell>
        <TableCell className={cell}>
          {quarter.allocation ? (
            <div
              role="img"
              aria-label={`Savings ${quarter.allocation.bank}%, Bonds ${quarter.allocation.bonds}%, Stocks ${quarter.allocation.stocks}%`}
              className="w-[116px]"
            >
              <AllocationBar
                compact
                value={quarter.allocation}
                className="h-[20px] rounded-[6px]"
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
            className="bg-player-feedback px-[16px] py-[20px] min-[601px]:px-[32px]"
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
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const latestYear = history.years.at(-1) ?? null
  const year = history.years.includes(selectedYear) ? selectedYear : latestYear
  // Capture the first available year; refetches must not reset the selection.
  if (selectedYear !== year) setSelectedYear(year)
  const quarters = history.quarters.filter((quarter) => quarter.year === year)
  return (
    <section aria-label="History" data-cy="history-panel">
      {history.years.length > 0 && (
        <div
          className={cn(
            padding,
            'border-player-divider flex gap-[12px] overflow-x-auto border-b py-[20px]'
          )}
          role="group"
          aria-label="History year"
        >
          {history.years.map((option) => (
            <Button
              key={option}
              onClick={() => setSelectedYear(option)}
              aria-pressed={year === option}
              className={{
                root: cn(
                  'h-[56px] w-[144px] shrink-0 rounded-full border-2 bg-white text-[20px] shadow-none min-[601px]:h-[84px] min-[601px]:w-[212px] min-[601px]:text-[26px]',
                  year === option
                    ? 'border-player-primary text-player-primary font-semibold'
                    : 'border-player-input text-player-body font-normal'
                ),
              }}
            >
              {option}
            </Button>
          ))}
        </div>
      )}
      <div
        className={cn(
          padding,
          'border-player-border border-b py-[28px] min-[601px]:pt-[36px]'
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-[16px] gap-y-[6px]">
          <span className="text-player-muted text-[20px] min-[601px]:text-[26px]">
            Portfolio value
          </span>
          <span className="flex items-baseline gap-[14px]">
            <strong
              className="text-[30px] tabular-nums min-[601px]:text-[42px]"
              data-cy="history-value"
            >
              {historyAmount(history.value)}
            </strong>
            <span className="text-player-muted text-[20px] min-[601px]:text-[26px]">
              CHF
            </span>
          </span>
        </div>
        <p
          data-cy="history-gain"
          className={cn(
            'mt-[12px] mb-[24px] text-[18px] font-semibold min-[601px]:text-[24px]',
            tone(history.gain)
          )}
        >
          {historyAmount(history.gain, true)} since the start ·{' '}
          {historyPercent(history.gainRate)}
        </p>
        {history.quarters.length > 0 ? (
          active && <PortfolioHistoryChart quarters={history.quarters} />
        ) : (
          <p className="text-player-muted py-[32px]">
            Your history will appear after the first quarter closes.
          </p>
        )}
      </div>
      <h2
        className={cn(
          padding,
          'text-player-muted mt-[36px] mb-[24px] text-[17px] font-semibold tracking-[1px] uppercase min-[601px]:text-[22px]'
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
            className="min-w-[600px] text-[18px] min-[601px]:text-[24px]"
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
                <QuarterRows key={quarter.id} quarter={quarter} />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className={cn(padding, 'text-player-muted py-[16px]')}>
          {year
            ? `No completed quarters in ${year} yet.`
            : 'No completed quarters yet.'}
        </p>
      )}
      <div
        className={cn(
          padding,
          'text-player-muted flex flex-wrap gap-x-[28px] gap-y-[12px] py-[28px] text-[18px] min-[601px]:text-[24px]'
        )}
      >
        {Object.entries(assetLabels).map(([key, asset]) => (
          <span key={key} className="flex items-center gap-[10px]">
            <span
              aria-hidden="true"
              className={cn('size-[18px] rounded-[4px]', asset.color)}
            />
            {asset.name}
          </span>
        ))}
      </div>
    </section>
  )
}
