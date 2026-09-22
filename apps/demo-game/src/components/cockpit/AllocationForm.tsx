import Link from 'next/link'
import {
  ALLOCATION_KEYS,
  allocationDraft,
  formatCHF,
  toTenths,
} from '~/lib/allocation'
import { assetLabels } from './AllocationBar'
import AllocationRow from './AllocationRow'
import AllocationSlider from './AllocationSlider'
import type { useAllocationForm } from './useAllocationForm'

export default function AllocationForm({
  controller,
  assets,
  scenario,
  disabled = false,
}: {
  controller: ReturnType<typeof useAllocationForm>
  disabled?: boolean
  assets: number
  scenario: { trendBonds?: number; trendStocks?: number }
}) {
  const { form, allocation, valid, preview, setDraft } = controller
  const total = ALLOCATION_KEYS.reduce(
    (sum, key) =>
      sum + (Number.isFinite(allocation[key]) ? allocation[key] : 0),
    0
  )
  const difference = Math.round((100 - total) * 10) / 10
  const expectation = (value?: number) =>
    Number.isFinite(value)
      ? `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
      : '—'

  return (
    <form id="allocation-form" onSubmit={form.handleSubmit} noValidate>
      <div className="border-player-border mobile:gap-app-3 mobile:p-app-4 flex items-baseline justify-between gap-[12px] border-b p-[16px] min-[601px]:px-[24px] min-[601px]:py-[20px]">
        <span className="text-player-muted mobile:app-body text-[18px]">
          To allocate
        </span>
        <strong className="mobile:app-value leading-[1.5] font-bold tabular-nums min-[601px]:text-[30px]">
          {formatCHF(assets)}
        </strong>
      </div>
      <AllocationSlider
        value={preview}
        disabled={disabled || !valid || form.isSubmitting}
        onChange={(value) => setDraft(allocationDraft(value))}
      />
      <div>
        {ALLOCATION_KEYS.map((key) => {
          const label = assetLabels[key].name
          const fieldValid = toTenths(allocation[key]) !== null
          return (
            <AllocationRow
              key={key}
              asset={key}
              amount={fieldValid ? (assets * allocation[key]) / 100 : null}
            >
              <label
                htmlFor={`allocation-${key}`}
                className="border-player-input focus-within:outline-player-primary has-[[aria-invalid=true]]:border-player-invalid mobile:px-app-2 mobile:app-body mobile:min-h-app-control mobile:rounded-app-control flex items-center justify-center rounded-[13px] border-2 px-[8px] font-bold focus-within:outline-2 focus-within:outline-offset-2 min-[601px]:h-[56px] min-[601px]:text-[22px]"
              >
                <input
                  className="player-number-input w-full min-w-0 [appearance:textfield] border-0 bg-transparent p-0 text-right text-inherit outline-0 [font:inherit] focus:shadow-none"
                  id={`allocation-${key}`}
                  name={key}
                  aria-label={label}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.values[key]}
                  disabled={disabled || form.isSubmitting}
                  aria-invalid={!fieldValid}
                  aria-describedby={
                    !fieldValid
                      ? `error-${key} allocation-feedback`
                      : 'allocation-feedback'
                  }
                  onBlur={form.handleBlur}
                  onChange={(event) => {
                    setDraft({ ...form.values, [key]: event.target.value })
                  }}
                />
                <span aria-hidden="true">%</span>
              </label>
              {!fieldValid && (
                <p
                  id={`error-${key}`}
                  className="text-player-error mobile:app-body col-[2/-1] m-0 text-[16px]"
                >
                  Enter 0–100%, in steps of 0.1%.
                </p>
              )}
            </AllocationRow>
          )
        })}
      </div>
      <div
        id="allocation-feedback"
        aria-live="polite"
        className={
          !valid || form.status
            ? 'border-player-border bg-player-feedback mobile:p-app-4 mobile:app-caption border-b p-[16px] text-[15px] min-[601px]:px-[24px] min-[601px]:py-[20px]'
            : 'sr-only'
        }
      >
        {!valid && (
          <p className="m-0">
            Total: {Math.round(total * 10) / 10}%.{' '}
            {difference > 0
              ? `${difference}% remaining.`
              : difference < 0
                ? `Over by ${Math.abs(difference)}%.`
                : 'Check the percentage fields.'}{' '}
            Finish entering valid percentages totaling 100% to update the slider
            and submit.
          </p>
        )}
        {form.status?.error && (
          <p role="alert" className="text-player-error m-0">
            {form.status.error}
          </p>
        )}
      </div>
      <Link
        href="/play/cockpit?tab=market"
        shallow
        className="focus-visible:outline-player-primary mobile:gap-app-3 mobile:px-app-4 mobile:py-app-4 mobile:app-caption flex items-center gap-[10px] text-inherit no-underline focus-visible:outline-[3px] focus-visible:outline-offset-[-4px] min-[601px]:px-[24px] min-[601px]:py-[20px] min-[601px]:text-[17px] [@media(max-width:360px)]:flex-wrap"
      >
        <strong className="mobile:app-body mr-auto min-[601px]:text-[21px]">
          Market outlook
        </strong>
        <span className="text-player-muted">
          Bonds {expectation(scenario?.trendBonds)} · Stocks{' '}
          {expectation(scenario?.trendStocks)}
        </span>
        <span
          aria-hidden="true"
          className="text-player-primary mobile:app-value text-[28px] leading-none"
        >
          ›
        </span>
      </Link>
    </form>
  )
}
