import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

// TODO(JJ):
// - Add max num periods?
// - Add max num segments?

interface Props {
  children?: ReactNode
  periodIx: number
  segmentIx: number
  isCurrentEntry: boolean
  isPastEntry: boolean
  gameStatus: string
  periodName?: string
  segmentName?: string
}

function TimelineEntry({
  children,
  periodIx,
  segmentIx,
  isCurrentEntry,
  isPastEntry,
  gameStatus,
  periodName = 'Period',
  segmentName = 'Segment',
}: Props) {
  return (
    <div
      id={isCurrentEntry ? 'current' : ''}
      className={twMerge(
        'flex flex-col rounded border p-4 pt-2 w-max',
        isPastEntry && ' text-gray-400',
        isCurrentEntry && 'border-red-200 bg-red-50 shadow'
      )}
    >
      <header className="flex flex-col">
        <div className="flex gap-x-2">
          <div className="font-bold">
            {periodName} {periodIx + 1}
          </div>
          <div>
            {segmentName} {segmentIx + 1}
          </div>
        </div>
        <div className="text-xs">
          <div>Status: {gameStatus}</div>
        </div>
      </header>

      <main className="mt-2">{children}</main>
    </div>
  )
}

export default TimelineEntry
