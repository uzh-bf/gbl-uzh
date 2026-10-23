import { UserRound } from 'lucide-react'
import Image from 'next/image'
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
  return (
    <aside
      aria-label="Your bank preview"
      className="border-player-border tablet:block hidden min-w-0 border-l px-[24px] py-[28px]"
    >
      <h2 className="text-player-muted m-0 mb-[20px] text-[14px] font-bold tracking-[1px] uppercase">
        Your bank
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
        {name.trim() || 'Bank name'}
      </strong>
      <p className="text-player-muted m-0 mt-[8px] text-[14px] [overflow-wrap:anywhere]">
        {avatar?.label ?? 'Avatar'} ·{' '}
        {location ? `HQ ${location.label}` : 'location'}
      </p>
      {!editing && (
        <div className="border-player-border mt-[20px] border-t pt-[16px]">
          <span className="text-player-body text-[14px]">Starting capital</span>
          <strong className="mt-[6px] block text-[24px] leading-[1.2]">
            10&apos;000.00 CHF
          </strong>
          <p className="text-player-muted m-0 mt-[8px] text-[14px]">
            Same for every team
          </p>
        </div>
      )}
    </aside>
  )
}
