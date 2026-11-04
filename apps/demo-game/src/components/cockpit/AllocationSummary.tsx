import { LockKeyhole } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLanguage } from '~/i18n/Language'
import { ALLOCATION_KEYS, type Allocation } from '~/lib/allocation'
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
  const t = useTranslations()
  const { share, formatCHF } = useLanguage()
  return (
    <div data-cy="allocation-summary">
      {!ready && (
        <AllocationNotice
          variant="success"
          title={t('player.allocation.submitted')}
        >
          {t('player.allocation.storedForQuarter')} {quarterNumber}
          {t('player.allocation.editUntilReady')}
        </AllocationNotice>
      )}
      <section
        className="border-player-border mobile:p-app-4 tablet:px-[12px] tablet:py-[8px] border-b min-[641px]:p-[24px]"
        aria-label={t('player.allocation.submittedDescription')}
      >
        <div className="mobile:mb-app-4 tablet:mb-[8px] mobile:gap-app-3 flex flex-wrap items-baseline justify-between gap-[12px] min-[641px]:mb-[20px]">
          {ready ? (
            <span className="text-player-muted mobile:gap-app-2 mobile:app-caption tablet:text-[12px] tablet:gap-[8px] flex items-center min-[641px]:gap-[10px] min-[641px]:text-[17px]">
              <LockKeyhole
                aria-hidden="true"
                className="tablet:size-[16px] size-[20px] shrink-0 min-[641px]:size-[22px]"
              />
              {t('player.allocation.lockedForQuarter')} {quarterNumber}
            </span>
          ) : (
            <h2 className="text-player-muted mobile:app-caption tablet:text-[12px] m-0 text-[15px] font-semibold tracking-[1px] uppercase">
              {t('player.allocation.submittedMix')}
            </h2>
          )}
          <strong className="mobile:app-value tablet:text-[20px] tablet:leading-[1.2] tabular-nums min-[641px]:text-[30px]">
            {formatCHF(assets)}
          </strong>
        </div>
        <AllocationBar
          value={allocation}
          className="tablet:h-[40px] h-[44px] min-[641px]:h-[64px]"
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
            <dd className="mobile:app-body tablet:app-caption m-0 text-right font-bold tabular-nums min-[641px]:text-[20px]">
              {share(allocation[key])}
            </dd>
          </AllocationRow>
        ))}
      </dl>
      {ready ? (
        <AllocationNotice variant="informational">
          {t('player.allocation.resultsHint')}
        </AllocationNotice>
      ) : (
        <AllocationNotice
          variant="pending"
          title={t('player.allocation.notReady')}
        >
          {t('player.allocation.readyHint')}
        </AllocationNotice>
      )}
    </div>
  )
}
