import { Check, Clock3, Info, LockKeyhole } from 'lucide-react'
import { ALLOCATION_KEYS, formatCHF, type Allocation } from '~/lib/allocation'
import AllocationBar, { assetLabels } from './AllocationBar'
import styles from './Cockpit.module.css'

export default function AllocationSummary({
  allocation,
  assets,
  quarterNumber,
  ready,
}: {
  allocation: Allocation
  assets: number
  quarterNumber: number
  ready: boolean
}) {
  return (
    <div data-cy="allocation-summary">
      {!ready && (
        <div className={styles.noticeSection}>
          <div
            className={`${styles.notice} ${styles.successNotice}`}
            role="status"
          >
            <Check aria-hidden="true" />
            <div>
              <strong>Allocation submitted</strong>
              <p>
                Stored for quarter {quarterNumber}. Change it as often as you
                like until you mark yourself ready.
              </p>
            </div>
          </div>
        </div>
      )}
      <section className={styles.summaryMix} aria-label="Submitted allocation">
        <div className={styles.summaryHeading}>
          {ready ? (
            <span className={styles.lockedLabel}>
              <LockKeyhole aria-hidden="true" />
              Locked mix for quarter {quarterNumber}
            </span>
          ) : (
            <h2>Submitted mix</h2>
          )}
          <strong>{formatCHF(assets)}</strong>
        </div>
        <AllocationBar value={allocation} className={styles.summaryBar} />
      </section>
      <dl className={styles.summaryRows}>
        {ALLOCATION_KEYS.map((key) => (
          <div
            className={`${styles.allocationRow} ${styles.summaryRow}`}
            key={key}
            data-cy={`submitted-${key}`}
          >
            <span
              className={styles.swatch}
              data-asset={key}
              aria-hidden="true"
            />
            <dt className={styles.assetLabel}>
              {assetLabels[key].name}
              <span>{assetLabels[key].risk}</span>
            </dt>
            <dd className={styles.assetAmount}>
              {formatCHF((assets * allocation[key]) / 100)}
            </dd>
            <dd className={styles.savedPercentage}>{allocation[key]}%</dd>
          </div>
        ))}
      </dl>
      <div className={styles.noticeSection}>
        {ready ? (
          <div className={`${styles.notice} ${styles.waitingNotice}`}>
            <Info aria-hidden="true" />
            <p>
              Results appear automatically when the instructor closes the
              quarter. Market and History stay open while you wait.
            </p>
          </div>
        ) : (
          <div className={`${styles.notice} ${styles.pendingNotice}`}>
            <Clock3 aria-hidden="true" />
            <div>
              <strong>Not ready yet</strong>
              <p>
                Turning Ready on tells the instructor you are done. The quarter
                can then close early.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
