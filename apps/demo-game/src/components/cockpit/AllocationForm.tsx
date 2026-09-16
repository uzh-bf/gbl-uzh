import Link from 'next/link'
import {
  ALLOCATION_KEYS,
  allocationDraft,
  formatCHF,
  toTenths,
} from '~/lib/allocation'
import AllocationSlider from './AllocationSlider'
import styles from './Cockpit.module.css'
import type { useAllocationForm } from './useAllocationForm'

export default function AllocationForm({
  controller,
  assets,
  scenario,
}: {
  controller: ReturnType<typeof useAllocationForm>
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
      <div className={styles.balance}>
        <span>To allocate</span>
        <strong>{formatCHF(assets)}</strong>
      </div>
      <AllocationSlider
        value={preview}
        disabled={!valid || form.isSubmitting}
        onChange={(value) => setDraft(allocationDraft(value))}
      />
      <div>
        {ALLOCATION_KEYS.map((key, i) => {
          const label = ['Savings', 'Bonds', 'Stocks'][i]
          const fieldValid = toTenths(allocation[key]) !== null
          return (
            <div
              className={styles.allocationRow}
              key={key}
              data-cy={`allocation-${key}`}
            >
              <span className={styles.swatch} data-asset={key} />
              <label
                htmlFor={`allocation-${key}`}
                className={styles.assetLabel}
              >
                {label}
                <span>{['No risk', 'Some risk', 'High risk'][i]}</span>
              </label>
              <span className={styles.assetAmount}>
                {fieldValid ? formatCHF((assets * allocation[key]) / 100) : '—'}
              </span>
              <div className={styles.percentageInput}>
                <input
                  id={`allocation-${key}`}
                  name={key}
                  aria-label={label}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.values[key]}
                  disabled={form.isSubmitting}
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
              </div>
              {!fieldValid && (
                <p id={`error-${key}`} className={styles.fieldError}>
                  Enter 0–100%, in steps of 0.1%.
                </p>
              )}
            </div>
          )
        })}
      </div>
      <div
        id="allocation-feedback"
        aria-live="polite"
        className={!valid || form.status ? styles.feedback : styles.srOnly}
      >
        {!valid && (
          <p>
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
        {form.status?.error && <p role="alert">{form.status.error}</p>}
        {form.status?.success && <p>{form.status.success}</p>}
      </div>
      <Link
        href="/play/cockpit?tab=market"
        shallow
        className={styles.marketOutlook}
      >
        <strong>Market outlook</strong>
        <span>
          Bonds {expectation(scenario?.trendBonds)} · Stocks{' '}
          {expectation(scenario?.trendStocks)}
        </span>
        <span aria-hidden="true" className={styles.chevron}>
          ›
        </span>
      </Link>
    </form>
  )
}
