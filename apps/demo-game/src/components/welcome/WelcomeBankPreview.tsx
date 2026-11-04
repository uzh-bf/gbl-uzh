import { UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useLanguage } from '~/i18n/Language'
import { INITIAL_CAPITAL } from '~/lib/constants'
import CantonFlagBadge from '../CantonFlagBadge'
import type { Option } from './OptionPicker'

export default function WelcomeBankPreview({
  name,
  avatar,
  location,
  editing,
}: {
  name: string
  avatar?: Option
  location?: Option
  editing: boolean
}) {
  const t = useTranslations()
  const { formatCHF } = useLanguage()
  return (
    <aside
      aria-label={t('player.setup.previewTitle')}
      className="border-player-border tablet:block hidden min-w-0 border-l px-[24px] py-[28px]"
    >
      <h2 className="text-player-muted m-0 mb-[20px] text-[14px] font-bold tracking-[1px] uppercase">
        {t('player.setup.bank')}
      </h2>
      <div className="relative mb-[16px] size-[72px]">
        {avatar ? (
          <>
            <Image
              src={avatar.value}
              alt=""
              width={72}
              height={72}
              className="size-full rounded-full object-cover"
            />
            <CantonFlagBadge location={location?.value} />
          </>
        ) : (
          <div className="border-player-input text-player-disabled grid size-full place-items-center rounded-full border border-dashed">
            <UserRound size={28} aria-hidden="true" />
          </div>
        )}
      </div>
      <strong className="block text-[20px] leading-[1.25] [overflow-wrap:anywhere]">
        {name.trim() || t('player.setup.bankName')}
      </strong>
      <p className="text-player-muted m-0 mt-[8px] text-[14px] [overflow-wrap:anywhere]">
        {avatar?.label ?? t('player.setup.avatar')} ·{' '}
        {location
          ? t('player.setup.locationName', { location: location.label })
          : t('player.setup.locationPlaceholder')}
      </p>
      {!editing && (
        <div className="border-player-border mt-[20px] border-t pt-[16px]">
          <span className="text-player-body text-[14px]">
            {t('player.setup.capital')}
          </span>
          <strong className="mt-[6px] block text-[24px] leading-[1.2]">
            {formatCHF(INITIAL_CAPITAL)}
          </strong>
          <p className="text-player-muted m-0 mt-[8px] text-[14px]">
            {t('player.setup.sameForTeams')}
          </p>
        </div>
      )}
    </aside>
  )
}
