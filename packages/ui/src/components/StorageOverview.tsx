import { repeat } from 'ramda'
import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

const baseStyle =
  'w-2 h-2 md:w-4 md:h-4 text-xs flex items-center justify-center rounded-full text-lg'

interface Props {
  storageUsed: number
  storageTotal: number
  imgPathEmpty: string
  imgPathFull: string
}

function StorageOverview({
  storageUsed,
  storageTotal,
  imgPathEmpty,
  imgPathFull,
}: Props) {
  const storageEmpty = useMemo(
    () => storageTotal - storageUsed,
    [storageTotal, storageUsed]
  )

  return (
    <div className="">
      <h2 className="mb-2 font-bold">Storage</h2>
      <div className="flex w-auto flex-wrap gap-1 p-2 bg-white border rounded shadow">
        {repeat(1, storageUsed).map((ix: number) => (
          <div
            key={ix}
            className={twMerge(
              baseStyle,
              'bg-transparent text-amber-800 border-none'
            )}
          >
            <img src={imgPathEmpty} />
          </div>
        ))}
        {repeat(1, storageEmpty).map((ix: number) => (
          <div
            key={ix}
            className={twMerge(baseStyle, 'text-gray-200 bg-gray-100')}
          >
            <img src={imgPathFull} className="opacity-30" />
          </div>
        ))}
      </div>
      <div className="flex flex-row flex-wrap gap-2 p-2 text-xs md:gap-4">
        <div className="flex flex-row items-center gap-2">
          <div className="text-base text-amber-800">{storageUsed}</div>
          <div
            className={twMerge(
              baseStyle,
              'bg-transparent text-amber-800 border-none w-4 h-4'
            )}
          >
            <img src={imgPathEmpty} />
          </div>
          <div>Storage</div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="text-base text-gray-500">{storageEmpty}</div>
          <div
            className={twMerge(baseStyle, 'text-gray-200 bg-gray-100 w-4 h-4')}
          >
            <img src={imgPathFull} className="opacity-30" />{' '}
          </div>
          <div>Empty</div>
        </div>
      </div>
    </div>
  )
}

export default StorageOverview
