import { ALLOCATION_KEYS, type Allocation } from '~/lib/allocation'
import styles from './Cockpit.module.css'

export const assetLabels = {
  bank: { name: 'Savings', risk: 'No risk' },
  bonds: { name: 'Bonds', risk: 'Some risk' },
  stocks: { name: 'Stocks', risk: 'High risk' },
} as const

export default function AllocationBar({
  value,
  className = '',
}: {
  value: Allocation
  className?: string
}) {
  return (
    <div className={`${styles.sliderTrack} ${className}`} aria-hidden="true">
      {ALLOCATION_KEYS.map((key) => (
        <div
          key={key}
          className={styles.mixSegment}
          data-asset={key}
          style={{ width: `${value[key]}%` }}
        >
          <div
            className={value[key] < 20 ? styles.smallMixLabel : styles.mixLabel}
          >
            <strong>{value[key]}%</strong>
            {value[key] >= 20 && <span>{assetLabels[key].name}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
