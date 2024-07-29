import { faCoins } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { twMerge } from 'tailwind-merge'

const TYPE_NAMES: { [key: string]: string } = {
  PERIOD_END: 'End',
  // SEGMENT_START: 'Start',
  // SEGMENT_END: 'End',
}

export function optionalValueToCHFString(value: number, digits = 2) {
  return value?.toLocaleString('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: digits,
  })
}

// TODO(JJ):
// - Replace img, maybe get rid of it or keep it general
// - Maybe get rid of Type names?
// - This one is very specific currently
// - Discuss with RS what data we would like to represent here in the general
//   case
// -> I think this should be more like a layout
function TimelineEntry({
  periodIx,
  segmentIx,
  isCurrentEntry,
  isPastEntry,
  type,
  cashBalance,
  storageAmount,
  spotPrice,
  spotPriceDelta,
  futuresPrice,
  futuresPriceDelta,
  t,
}: {
  periodIx: number
  segmentIx: number
  isCurrentEntry: boolean
  isPastEntry: boolean
  type: string
  cashBalance: number
  storageAmount: number
  spotPrice?: number
  spotPriceDelta?: number
  futuresPrice?: number
  futuresPriceDelta?: number
  t?: any
}) {
  return (
    <div
      id={isCurrentEntry ? 'current' : ''}
      className={twMerge(
        'flex-initial rounded border p-4 pt-3',
        isPastEntry && ' text-gray-400',
        isCurrentEntry && 'border-red-200 bg-red-50 shadow'
      )}
    >
      <div className="flex flex-row gap-1 font-bold">
        P{periodIx + 1}
        {typeof segmentIx === 'number' && <span>Q{segmentIx + 1}</span>}
        <span>{TYPE_NAMES[type]}</span>
      </div>

      <div className="flex flex-row items-center gap-2">
        <FontAwesomeIcon icon={faCoins} />
        {optionalValueToCHFString(cashBalance)}
      </div>

      <div className="flex flex-row items-center gap-2 border-b pb-2">
        <div className={twMerge('h-4 w-4', isPastEntry && 'opacity-50')}>
          <img src="/avatars/cocoa_0.png" />
        </div>
        {storageAmount.toFixed()}T
      </div>

      <div className="pt-2 text-sm">
        {typeof t === 'number' && <div>t = {t}</div>}
        {spotPrice && (
          <div className="whitespace-nowrap">
            S = {optionalValueToCHFString(spotPrice, 0)}{' '}
            {spotPriceDelta && (
              <span
                className={twMerge(
                  !isPastEntry &&
                    (spotPriceDelta > 0 ? 'text-lime-500' : 'text-red-400')
                )}
              >
                ({spotPriceDelta.toFixed(2)}%)
              </span>
            )}
          </div>
        )}
        {futuresPrice && (
          <div className="whitespace-nowrap">
            F = {optionalValueToCHFString(futuresPrice, 0)}{' '}
            {futuresPriceDelta && (
              <span
                className={twMerge(
                  !isPastEntry &&
                    (futuresPriceDelta > 0 ? 'text-lime-500' : 'text-red-400')
                )}
              >
                ({futuresPriceDelta.toFixed(2)}%)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelineEntry
