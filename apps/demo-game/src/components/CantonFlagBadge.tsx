import Image from 'next/image'
import { LOCATIONS } from '~/lib/constants'

/** Decorative location badge; the adjacent HQ text supplies its accessible label. */
export default function CantonFlagBadge({ location }: { location?: string }) {
  if (!location || !LOCATIONS.Trader.includes(location)) return null

  return (
    <Image
      aria-hidden="true"
      src={`/locations/flags/${location}.svg`}
      alt=""
      width={32}
      height={32}
      className="pointer-events-none absolute -right-[2px] -bottom-[2px] size-[45%] rounded-full border border-white bg-white object-cover"
    />
  )
}
