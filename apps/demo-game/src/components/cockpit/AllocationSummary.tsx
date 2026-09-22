import { LockKeyhole } from 'lucide-react'
import { ALLOCATION_KEYS, formatCHF, type Allocation } from '~/lib/allocation'
import AllocationBar from './AllocationBar'
import AllocationNotice from './AllocationNotice'
import AllocationRow from './AllocationRow'

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
        <AllocationNotice variant="success" title="Allocation submitted">
          Stored for quarter {quarterNumber}. Change it as often as you like
          until you mark yourself ready.
        </AllocationNotice>
      )}
      <section
        className="border-player-border mobile:p-app-4 border-b min-[601px]:p-[24px]"
        aria-label="Submitted allocation"
      >
        <div className="mobile:mb-app-4 mobile:gap-app-3 flex flex-wrap items-baseline justify-between gap-[12px] min-[601px]:mb-[20px]">
          {ready ? (
            <span className="text-player-muted mobile:gap-app-2 mobile:app-caption flex items-center min-[601px]:gap-[10px] min-[601px]:text-[17px]">
              <LockKeyhole
                aria-hidden="true"
                className="size-[20px] shrink-0 min-[601px]:size-[22px]"
              />
              Locked mix for quarter {quarterNumber}
            </span>
          ) : (
            <h2 className="text-player-muted mobile:app-caption m-0 text-[15px] font-semibold tracking-[1px] uppercase">
              Submitted mix
            </h2>
          )}
          <strong className="mobile:app-value tabular-nums min-[601px]:text-[30px]">
            {formatCHF(assets)}
          </strong>
        </div>
        <AllocationBar
          value={allocation}
          className="h-[44px] min-[601px]:h-[64px]"
        />
      </section>
      <dl className="m-0">
        {ALLOCATION_KEYS.map((key) => (
          <AllocationRow
            key={key}
            asset={key}
            amount={(assets * allocation[key]) / 100}
            saved
          >
            <dd className="mobile:app-body m-0 text-right font-bold tabular-nums min-[601px]:text-[20px]">
              {allocation[key]}%
            </dd>
          </AllocationRow>
        ))}
      </dl>
      {ready ? (
        <AllocationNotice variant="informational">
          Results appear automatically when the instructor closes the quarter.
          Market and History stay open while you wait.
        </AllocationNotice>
      ) : (
        <AllocationNotice variant="pending" title="Not ready yet">
          Turning Ready on tells the instructor you are done. The quarter can
          then close early.
        </AllocationNotice>
      )}
    </div>
  )
}
