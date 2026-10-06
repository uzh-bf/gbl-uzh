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
import { assetLabels, MONTHS, NUM_MONTHS_PER_SEGMENT } from '~/lib/constants'
import {
  buildHistory,
  playerAmount,
  playerPercent,
  type HistoryQuarter,
} from '~/lib/results'
import AllocationBar from '../cockpit/AllocationBar'
import PortfolioHistoryChart from './PortfolioHistoryChart'

const padding = 'mobile:px-app-4 min-[641px]:px-[32px] tablet:px-[16px]'
const cell =
  'px-[12px] py-[20px] mobile:app-cell first:pl-[16px] last:pr-[16px] min-[641px]:first:pl-[32px] min-[641px]:last:pr-[32px] tablet:px-[8px] tablet:py-[10px] tablet:first:pl-[16px] tablet:last:pr-[16px]'
const tone = (value: number | null) =>
  value === null || value === 0
    ? 'text-player-muted'
    : value > 0
      ? 'text-player-success'
      : 'text-player-error'

function MonthlyResults({ quarter }: { quarter: HistoryQuarter }) {
  return (
    <table
      className="mobile:app-caption tablet:text-[14px] w-full min-[641px]:text-[17px]"
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
              {MONTHS[
                (quarter.quarter - 1) * NUM_MONTHS_PER_SEGMENT + month.index
              ] ?? '—'}
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
                {playerPercent(month[asset])}
              </td>
            ))}
            <td className="text-right font-semibold tabular-nums">
              {playerAmount(month.gain, true)}
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
            {playerPercent(quarter[asset])}
          </TableCell>
        ))}
        <TableCell
          className={cn(cell, 'text-right font-semibold tabular-nums')}
          aria-label={`Result ${playerAmount(quarter.gain, true)} CHF`}
        >
          {playerAmount(quarter.gain, true)}
        </TableCell>
      </TableRow>
      <TableRow
        hidden={!expanded}
        className="border-player-border hover:bg-transparent"
      >
        <TableCell colSpan={5} className="p-0">
          <div
            id={detailId}
            className="bg-player-feedback mobile:px-app-4 mobile:py-app-4 tablet:px-[16px] py-[20px] min-[641px]:px-[32px]"
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
    <section
      aria-label="History"
      data-cy="history-panel"
      className="tablet:contents"
    >
      {history.years.length > 0 && (
        <div
          className="border-player-divider focus-visible:outline-player-primary phone:gap-app-2 phone:p-app-3 phone:min-h-[72px] phone:items-center tablet:min-h-[72px] tablet:items-center tablet:box-border tablet:gap-[8px] tablet:px-[16px] tablet:col-span-2 tablet:row-start-1 tablet:py-[12px] flex max-w-full min-w-0 gap-[12px] overflow-x-auto overscroll-x-contain border-b py-[20px] focus-visible:outline-2 focus-visible:outline-offset-[-2px] min-[641px]:px-[32px]"
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
                  'phone:app-caption phone:h-[36px] phone:min-h-[36px] phone:w-[88px] phone:flex-none phone:rounded-full phone:px-[16px] phone:py-[4px] tablet:app-caption tablet:h-[36px] tablet:min-h-[36px] tablet:w-[88px] tablet:flex-none tablet:rounded-full tablet:px-[16px] tablet:py-[4px] shrink-0 rounded-full border-2 bg-white shadow-none min-[641px]:h-[84px] min-[641px]:w-[212px] min-[641px]:text-[26px]',
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
      <div className="tablet:col-start-1 tablet:row-start-2 tablet:min-w-0">
        <div
          className={cn(
            padding,
            'border-player-border mobile:py-app-4 tablet:py-[12px] border-b py-[28px] min-[641px]:pt-[36px]'
          )}
        >
          <div className="mobile:gap-x-app-3 mobile:gap-y-app-2 flex flex-wrap items-baseline justify-between gap-x-[16px] gap-y-[6px]">
            <span className="text-player-muted mobile:app-body tablet:text-[16px] min-[641px]:text-[26px]">
              Portfolio value
            </span>
            <span className="mobile:gap-app-3 flex items-baseline gap-[14px]">
              <strong
                className="mobile:app-value tablet:app-value tabular-nums min-[641px]:text-[42px]"
                data-cy="history-value"
              >
                {playerAmount(history.value)}
              </strong>
              <span className="text-player-muted mobile:app-body tablet:text-[16px] min-[641px]:text-[26px]">
                CHF
              </span>
            </span>
          </div>
          <p
            data-cy="history-gain"
            className={cn(
              'mobile:mt-app-3 mobile:mb-app-4 mobile:app-body tablet:text-[14px] mt-[12px] mb-[24px] font-semibold min-[641px]:text-[24px]',
              tone(history.gain)
            )}
          >
            {playerAmount(history.gain, true)} since the start ·{' '}
            {playerPercent(history.gainRate)}
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
            'text-player-muted mobile:mt-app-6 tablet:mt-[20px] tablet:mb-[12px] mobile:mb-app-4 mobile:app-caption tablet:text-[14px] mt-[36px] mb-[24px] font-semibold tracking-[1px] uppercase min-[641px]:text-[22px]'
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
              className="mobile:app-body tablet:min-w-[400px] tablet:text-[14px] min-w-[640px] min-[641px]:text-[24px] min-[641px]:leading-[1.5]"
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
            className={cn(
              padding,
              'text-player-muted mobile:py-app-4 py-[16px]'
            )}
          >
            {typeof year === 'number'
              ? `No completed quarters in ${year} yet.`
              : 'No completed quarters yet.'}
          </p>
        )}
        <div
          className={cn(
            padding,
            'text-player-muted mobile:gap-x-app-3 mobile:gap-y-app-3 mobile:py-app-4 mobile:app-caption tablet:text-[14px] tablet:py-[12px] flex flex-wrap gap-x-[28px] gap-y-[12px] py-[28px] min-[641px]:text-[24px]'
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
      </div>
    </section>
  )
}
