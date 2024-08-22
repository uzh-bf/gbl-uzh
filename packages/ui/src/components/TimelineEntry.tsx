import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

// TODO(JJ):
// - Add max num periods?

interface Props {
  children?: ReactNode
  periodIx: number
  segmentIx: number
  numSegments: number
  gameStatus: string
  entryStatus: 'PAST' | 'CURRENT' | 'FUTURE'
  periodName?: string
  segmentName?: string
}

function TimelineEntry({
  children,
  periodIx,
  segmentIx,
  numSegments,
  gameStatus,
  entryStatus,
  periodName = 'Period',
  segmentName = 'Segment',
}: Props) {
  return (
    <div
      id={entryStatus === 'CURRENT' ? 'current' : undefined}
      className={twMerge(
        'flex flex-col rounded border p-4 pt-2 w-max',
        entryStatus === 'PAST' && 'text-gray-400',
        entryStatus === 'CURRENT' && 'border-red-200 bg-red-50 shadow'
      )}
    >
      <header className="flex flex-col">
        <div className="flex gap-x-2">
          <div className="font-bold">
            {periodName} {periodIx + 1}
          </div>
          <div>
            {segmentName} {segmentIx + 1}/{numSegments}
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

export { TimelineEntry }
