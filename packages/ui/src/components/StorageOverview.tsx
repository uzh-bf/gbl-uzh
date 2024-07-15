import { repeat } from 'ramda'
import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

const baseStyle =
  'w-2 h-2 md:w-4 md:h-4 text-xs flex items-center justify-center rounded-full text-lg'

interface Props {
  storageUsed: number
  storageTotal: number
  imgSrcUsed: string
  imgSrcTotal: string
}

function StorageOverview({
  storageUsed,
  storageTotal,
  imgSrcUsed,
  imgSrcTotal,
}: Props) {
  const storageEmpty = useMemo(
    () => storageTotal - storageUsed,
    [storageTotal, storageUsed]
  )

  return (
    <div className="">
      <h2 className="mb-2 font-bold">Storage</h2>
      <div className="grid grid-cols-10 gap-1 p-2 bg-white border rounded shadow aspect-square">
        {repeat(1, storageUsed).map((ix: number) => (
          <div
            key={ix}
            className={twMerge(
              baseStyle,
              'bg-transparent text-amber-800 border-none'
            )}
          >
            <img src={imgSrcUsed} />
          </div>
        ))}
        {repeat(1, storageEmpty).map((ix: number) => (
          <div
            key={ix}
            className={twMerge(baseStyle, 'text-gray-200 bg-gray-100')}
          >
            <img src={imgSrcTotal} className="opacity-30" />
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
            <img src={imgSrcUsed} />
          </div>
          <div>Storage</div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="text-base text-gray-500">{storageEmpty}</div>
          <div
            className={twMerge(baseStyle, 'text-gray-200 bg-gray-100 w-4 h-4')}
          >
            <img src={imgSrcTotal} className="opacity-30" />{' '}
          </div>
          <div>Empty</div>
        </div>
      </div>
    </div>
  )
}

export default StorageOverview
