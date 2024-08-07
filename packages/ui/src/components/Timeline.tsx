import { sortBy } from 'ramda'
import { useEffect, useMemo } from 'react'
import TimelineEntry from './TimelineEntry'

// Maybe add more data, see schema.prisma
interface Segment {
  id?: number
  index: number
  facts: any
}

interface Period {
  index: number
  facts: any
  segments: Segment[]
  segmentCount: number
}

// NOTE(JJ): Entries are mainly results -> check FResultData.graphql
// - Maybe renaming? @RS
interface Entry {
  id?: number
  type: string
  facts: any
  period: {
    id?: number
    index: number
  }
  segment: {
    id?: number
    index: number
  }
}

interface DataProps {
  segmentFlat?: { facts: any }
  facts: any
}

function Timeline({
  periods,
  entries,
  activePeriodIx,
  activeSegmentIx,
  formatter,
}: {
  periods: Period[]
  entries: Entry[]
  activePeriodIx: number
  activeSegmentIx: number
  formatter: (current: DataProps, prev: DataProps) => React.ReactNode
}) {
  const data = useMemo(() => {
    // Segments of all periods with new keys
    const segmentsFlat = periods
      .flatMap((period) =>
        period.segments.map((segment) => ({
          ...segment,
          segmentCount: period.segmentCount,
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

    const mapped: any[] = entries.flatMap((item) => {
      if (item.type === 'PERIOD_START') return []
      if (item.type === 'SEGMENT_START') return []

      const periodIx = item.period.index
      const numSegments = periods[periodIx].segmentCount
      const segmentIx =
        (item.type === 'PERIOD_START' && -1) ||
        (item.type === 'PERIOD_END' && numSegments) ||
        item.segment?.index
      const key = `${periodIx + 1}${segmentIx + 1}`

      const segmentFlat = segmentsFlat[key]

      return [
        {
          ...item,
          key,
          segmentFlat,
        },
      ]
    })

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
        let entryStatus: 'PAST' | 'CURRENT' | 'FUTURE' = 'FUTURE'
        if (
          item.period.index === activePeriodIx &&
          item.segment?.index === activeSegmentIx
        ) {
          entryStatus = 'CURRENT'
        } else if (item.period.index < activePeriodIx) {
          entryStatus = 'PAST'
        }
        return (
          <TimelineEntry
            key={`${item.period.index}-${item.segment?.index}`}
            periodIx={item.period.index}
            segmentIx={item.segment?.index}
            // TODO(JJ): @RS This is not really nice, the segement count is
            // not in the period, but in the segment => provide segement count
            // in the entries (playerResult)?
            numSegments={item.segmentFlat.segmentCount}
            entryStatus={entryStatus}
            gameStatus={item.type}
          >
            {formatter(item, prev)}
          </TimelineEntry>
        )
      })}
    </div>
  )
}

export default Timeline
