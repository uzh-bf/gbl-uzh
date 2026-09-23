import { cn, probabilityDistribution, signedPercent } from '@gbl-uzh/ui'
import {
  ALLOCATION_KEYS,
  allocationDraft,
  formatCHF,
  toTenths,
} from '~/lib/allocation'
import { assetLabels } from '~/lib/constants'
import type { MarketScenario } from '~/lib/market'
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
  scenario: MarketScenario | null
}) {
  const { form, allocation, valid, preview, setDraft } = controller
  const total = ALLOCATION_KEYS.reduce(
    (sum, key) =>
      sum + (Number.isFinite(allocation[key]) ? allocation[key] : 0),
    0
  )
  const difference = Math.round((100 - total) * 10) / 10

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
      <section
        aria-label="Market outlook"
        className="mobile:px-app-4 mobile:py-app-3 min-[601px]:px-[24px] min-[601px]:py-[16px]"
      >
        <h2 className="mobile:app-body m-0 font-bold min-[601px]:text-[18px]">
          Market outlook
        </h2>
        {scenario ? (
          <div className="mobile:mt-app-2 mobile:gap-app-6 grid grid-cols-2 min-[601px]:mt-[8px] min-[601px]:gap-[48px]">
            {(['bonds', 'stocks'] as const).map((asset) => {
              const trend =
                asset === 'bonds' ? scenario.trendBonds : scenario.trendStocks
              const gap =
                asset === 'bonds' ? scenario.gapBonds : scenario.gapStocks
              const { volatility } = probabilityDistribution(trend, gap)
              return (
                <section
                  key={asset}
                  aria-label={`${assetLabels[asset].name} forecast`}
                  className="min-w-0"
                >
                  <h3 className="mobile:app-body m-0 font-semibold min-[601px]:text-[16px]">
                    {assetLabels[asset].name}
                  </h3>
                  <dl className="mobile:mt-app-1 mobile:gap-app-1 mobile:app-caption m-0 grid min-[601px]:mt-[4px] min-[601px]:gap-[4px] min-[601px]:text-[14px]">
                    {[
                      {
                        label: 'Expected value',
                        value: signedPercent(trend, 2),
                        color:
                          trend < 0
                            ? 'text-player-error'
                            : 'text-player-success',
                      },
                      { label: 'Gap', value: `${(gap * 100).toFixed(2)}%` },
                      {
                        label: 'Volatility',
                        value: `${(volatility * 100).toFixed(2)}%`,
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="mobile:gap-app-1 flex items-baseline justify-between min-[601px]:gap-[8px]"
                      >
                        <dt className="text-player-muted">{label}</dt>
                        <dd
                          className={cn(
                            'm-0 shrink-0 font-bold tabular-nums',
                            color
                          )}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )
            })}
          </div>
        ) : (
          <p className="text-player-muted mobile:app-caption min-[601px]:text-[17px]">
            Market outlook is not available yet.
          </p>
        )}
      </section>
    </form>
  )
}
