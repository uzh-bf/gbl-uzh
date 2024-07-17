import { sortBy } from 'ramda'
import { useEffect, useMemo } from 'react'
import TimelineEntry from './TimelineEntry'

// TODO(JJ):
// - typing
// - Currently it is very specific to the derivative game
//   -> adjust s.t. it's generic
function Timeline({
  periods,
  entries,
  activePeriodIx,
  activeSegmentIx,
}: {
  periods: any[]
  entries: any[]
  activePeriodIx: number
  activeSegmentIx: number
}) {
  console.log(periods, entries, activePeriodIx, activeSegmentIx)

  const data = useMemo(() => {
    const periodData = periods
      .flatMap((period: any) =>
        period.segments.map((segment: any) => ({
          ...segment,
          periodIx: period.index,
          periodFacts: period.facts,
        }))
      )
      .reduce((acc: any, element: any) => {
        return {
          ...acc,
          [`${element.periodIx + 1}${element.index + 1}`]: element,
        }
      }, {})

    console.log(periodData)

    const mapped: any[] = entries.flatMap((item: any) => {
      if (item.type === 'PERIOD_START') return []
      if (item.type === 'SEGMENT_START') return []

      console.log(item)

      const periodIx = item.period.index
      const segmentIx =
        (item.type === 'PERIOD_START' && -1) ||
        (item.type === 'PERIOD_END' && 4) ||
        item.segment?.index
      const key = `${periodIx + 1}${segmentIx + 1}`

      console.log(key)

      const matchingData = periodData[key]

      return [
        {
          ...item,
          key,
          data: matchingData,
        },
      ]
    })

    console.log(mapped)

    return sortBy((item) => item.key, mapped)
  }, [entries, periods])

  useEffect(() => {
    document.getElementById('current')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [entries])

  return (
    <div className="flex flex-row gap-2 overflow-x-auto">
      {data.map((item, ix, all) => {
        const prev = all[ix - 1]

        const spotPrice =
          item.data?.facts.spotPrice ?? item.facts.finalSpotPrice
        const futuresPrice =
          item.data?.facts.futuresPrice ?? item.facts.finalSpotPrice

        const spotPriceDelta =
          prev?.data?.facts.spotPrice &&
          (spotPrice / prev.data.facts.spotPrice - 1) * 100

        const futuresPriceDelta =
          prev?.data?.facts.futuresPrice &&
          (futuresPrice / prev.data.facts.futuresPrice - 1) * 100

        return (
          <TimelineEntry
            key={`${item.period.index}-${item.segment?.index}`}
            periodIx={item.period.index}
            segmentIx={item.segment?.index}
            isCurrentEntry={
              item.period.index === activePeriodIx &&
              item.segment?.index === activeSegmentIx
            }
            isPastEntry={item.period.index < activePeriodIx}
            type={item.type}
            cashBalance={item.facts.cashBalance}
            storageAmount={item.facts.storageAmount}
            spotPrice={spotPrice}
            futuresPrice={futuresPrice}
            spotPriceDelta={spotPriceDelta}
            futuresPriceDelta={futuresPriceDelta}
            t={item.data?.facts.t ?? (item.type === 'PERIOD_END' && 0)}
          />
        )
      })}
    </div>
  )
}

export default Timeline
