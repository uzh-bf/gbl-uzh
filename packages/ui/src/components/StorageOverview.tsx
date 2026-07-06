import { repeat } from 'ramda'
import React, { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

const baseStyle =
  'w-2 h-2 md:w-4 md:h-4 text-xs flex items-center justify-center rounded-full text-lg'

interface Props {
  storageUsed: number
  storageTotal: number
  icon: React.ReactNode
}

function StorageOverview({ storageUsed, storageTotal, icon }: Props) {
  const storageEmpty = useMemo(
    () => storageTotal - storageUsed,
    [storageTotal, storageUsed]
  )

  // ⚡ Bolt Performance Optimization:
  // - Extracted React.isValidElement(icon) and twMerge calls outside of the map loop.
  // - Expected Impact: Reduces computation time per render from O(N) to O(1) where N is storageUsed + storageEmpty.
  // - Using idx for map keys instead of value '1' from Ramda repeat to prevent React warning/duplicate key performance degradation.
  const isReactNode = React.isValidElement(icon)
  const usedStyle = twMerge(baseStyle, !isReactNode ? ' bg-slate-900' : '')
  const emptyStyle = twMerge(
    baseStyle,
    'opacity-30',
    !isReactNode ? ' bg-slate-900 ' : ''
  )

  return (
    <div className="">
      <h2 className="mb-2 font-bold">Storage</h2>
      <div className="flex w-auto flex-wrap gap-1 p-2 bg-white border rounded shadow">
        {repeat(1, storageUsed).map((_, idx: number) => {
          return (
            <div key={`used-${idx}`} className={usedStyle}>
              {isReactNode && icon}
            </div>
          )
        })}
        {repeat(1, storageEmpty).map((_, idx: number) => {
          return (
            <div key={`empty-${idx}`} className={emptyStyle}>
              {isReactNode && icon}
            </div>
          )
        })}
      </div>
      <div className="flex flex-row flex-wrap gap-2 p-2 text-xs md:gap-4">
        <div className="flex flex-row items-center gap-2">
          <div className="text-base text-slate-900">{storageUsed}</div>
          <div className={usedStyle}>{isReactNode && icon}</div>
          <div>Storage</div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="text-base text-slate-500">{storageEmpty}</div>
          <div className={emptyStyle}>{isReactNode && icon}</div>
          <div>Empty</div>
        </div>
      </div>
    </div>
  )
}

export { StorageOverview }
