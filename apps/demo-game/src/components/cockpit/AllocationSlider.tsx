import { useRef, useState } from 'react'
import {
  allocationBoundaries,
  fromBoundaries,
  moveBoundary,
  type Allocation,
  type Boundaries,
} from '~/lib/allocation'
import AllocationBar from './AllocationBar'

export default function AllocationSlider({
  value,
  disabled,
  onChange,
}: {
  value: Allocation
  disabled: boolean
  onChange: (value: Allocation) => void
}) {
  const track = useRef<HTMLDivElement>(null)
  const bounds = allocationBoundaries(value)
  const handles = useRef<(HTMLButtonElement | null)[]>([])
  const drag = useRef<{
    pointerId: number
    handle: 0 | 1 | null
    startX: number
    startPosition: number
    bounds: Boundaries
  } | null>(null)
  const [draggingHandle, setDraggingHandle] = useState<0 | 1 | null>(null)
  const coveringHandle =
    draggingHandle ?? (bounds[0] === 1000 ? 0 : bounds[1] === 0 ? 1 : null)
  const movePointer = (clientX: number) => {
    const gesture = drag.current
    const rect = track.current?.getBoundingClientRect()
    if (!gesture || !rect?.width) return
    const target = Math.round(
      gesture.startPosition + ((clientX - gesture.startX) / rect.width) * 1000
    )
    if (gesture.handle === null) {
      if (target === gesture.startPosition) return
      // Pick the boundary from the first movement when both handles coincide.
      // Keep it for this gesture so a later collision still pushes the other.
      gesture.handle = target < gesture.startPosition ? 0 : 1
      setDraggingHandle(gesture.handle)
      handles.current[gesture.handle]?.focus({ preventScroll: true })
    }
    gesture.bounds = moveBoundary(gesture.bounds, gesture.handle, target)
    onChange(fromBoundaries(gesture.bounds))
  }
  const endDrag = () => {
    drag.current = null
    setDraggingHandle(null)
  }

  return (
    <div className="border-player-border border-b p-[16px] min-[601px]:px-[24px] min-[601px]:pt-[20px] min-[601px]:pb-[24px]">
      <div className="text-player-muted mb-[16px] flex items-baseline justify-between gap-[12px] text-[17px] min-[601px]:mb-[20px]">
        <h2 className="m-0 text-[15px] font-semibold tracking-[1.5px] uppercase">
          Your mix
        </h2>
        <span>Drag a handle</span>
      </div>
      <div
        ref={track}
        className="relative h-[44px] min-[601px]:h-[64px]"
        data-cy="allocation-slider"
        aria-disabled={disabled}
      >
        <AllocationBar value={value} />
        {([0, 1] as const).map((handle) => (
          <button
            key={handle}
            ref={(element) => {
              handles.current[handle] = element
            }}
            type="button"
            role="slider"
            aria-label={handle === 0 ? 'Savings boundary' : 'Stocks boundary'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={bounds[handle] / 10}
            aria-valuetext={
              handle === 0
                ? `Savings ${value.bank}%, Bonds ${value.bonds}%`
                : `Bonds ${value.bonds}%, Stocks ${value.stocks}%`
            }
            aria-orientation="horizontal"
            aria-describedby="allocation-help"
            className="focus-visible:outline-player-text absolute top-1/2 z-[1] size-[44px] -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none rounded-full border-0 bg-transparent p-[6px] focus-visible:z-[2] focus-visible:outline-[3px] focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            style={{
              left: `${bounds[handle] / 10}%`,
              zIndex:
                coveringHandle === null
                  ? undefined
                  : handle === coveringHandle
                    ? 2
                    : 1,
            }}
            onPointerDown={(event) => {
              if (event.button !== 0 || drag.current) return
              const selected = bounds[0] === bounds[1] ? null : handle
              drag.current = {
                pointerId: event.pointerId,
                handle: selected,
                startX: event.clientX,
                startPosition: bounds[handle],
                bounds,
              }
              setDraggingHandle(selected)
              event.currentTarget.setPointerCapture(event.pointerId)
              event.currentTarget.focus()
            }}
            onPointerMove={(event) => {
              if (
                !disabled &&
                drag.current?.pointerId === event.pointerId &&
                event.currentTarget.hasPointerCapture(event.pointerId)
              )
                movePointer(event.clientX)
            }}
            onPointerUp={(event) => {
              if (drag.current?.pointerId !== event.pointerId) return
              endDrag()
              event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onLostPointerCapture={endDrag}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 10 : 1
              const delta = {
                ArrowLeft: -step,
                ArrowDown: -step,
                ArrowRight: step,
                ArrowUp: step,
              }[event.key]
              if (
                delta === undefined &&
                event.key !== 'Home' &&
                event.key !== 'End'
              )
                return
              event.preventDefault()
              const target =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? 1000
                    : bounds[handle] + delta
              onChange(fromBoundaries(moveBoundary(bounds, handle, target)))
            }}
          >
            <span className="border-player-primary after:bg-player-primary relative block size-full rounded-full border-[3px] bg-white after:absolute after:top-1/2 after:left-1/2 after:h-[13px] after:w-[3px] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-[4px] after:content-['']" />
          </button>
        ))}
      </div>
      <p id="allocation-help" className="sr-only">
        Use arrow keys for 0.1%, or Shift and arrow keys for 1%. When handles
        meet, they push each other. Start a new drag left or right to separate
        overlapping handles. Use the percentage fields for exact values.
      </p>
    </div>
  )
}
