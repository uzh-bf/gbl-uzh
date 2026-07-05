import { twMerge } from 'tailwind-merge'
// import { faCalendar, faPauseCircle } from '@fortawesome/free-regular-svg-icons'
import { faPauseCircle } from '@fortawesome/free-regular-svg-icons'
// import { faCheck, faPause, faSync } from '@fortawesome/free-solid-svg-icons'
import { faPause } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { STATUS } from '@gbl-uzh/platform/dist/lib/util'
import { SegmentEntry } from './SegmentEntry'

// interface Props {
//   periodStatus: string
//   segmentStatus: string
// }

function TimelineAdmin() {
  const periods = [
    {
      id: 0,
      index: 0,
      facts: {},
      segments: [
        {
          id: 0,
          index: 0,
          facts: {},
          storyElements: [],
          learningElements: [],
        },
      ],
    },
    {
      id: 1,
      index: 1,
      facts: {},
      segments: [
        {
          id: 1,
          index: 0,
          facts: {},
          storyElements: [],
          learningElements: [],
        },
      ],
    },
    {
      id: 2,
      index: 2,
      facts: {},
      segments: [
        {
          id: 2,
          index: 0,
          facts: {},
          storyElements: [],
          learningElements: [],
        },
      ],
    },
  ]
  return (
    <div className="flex flex-col gap-2 overflow-x-auto md:flex-row">
      {periods.map((period) => {
        // const periodStatus = computePeriodStatus(data.game, ix)
        const labels = ['label']
        return (
          <div
            className="flex flex-row gap-2"
            key={period.id}
            id="active-period"
          >
            <div
              className={twMerge(
                'flex flex-1 flex-col gap-1 rounded border p-2',
                'border-orange-300 bg-orange-100'
              )}
            >
              <div className="flex flex-row items-start justify-between gap-2">
                <div className="flex flex-row gap-2">
                  <div>
                    <FontAwesomeIcon icon={faPause} />
                  </div>
                  <div className="font-bold">Period {period.index + 1}</div>
                </div>
                <div className="flex flex-row gap-1">
                  {labels.map((label) => (
                    <div
                      className="rounded border px-1 font-bold text-slate-600"
                      key={label}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* <div className="flex flex-row gap-2 text-sm">
                <div>Spot: {period.facts.initialSpotPrice.toFixed()}</div>
                <div>Seed: {period.facts.randomSeed}</div>
              </div> */}

              {/* <div className="flex flex-row gap-2 text-sm">
                <div>Trend E: {(period.facts.trendE * 100).toFixed(2)}%</div>
                <div>
                  Trend Gap: {(period.facts.trendGap * 100).toFixed(2)}%
                </div>
                <div>
                  Volatility: {(period.facts.volatility * 100).toFixed(2)}%
                </div>
              </div> */}

              <div className="mt-1 flex flex-row gap-1">
                {period.segments.map((segment) => {
                  // const isSegmentActive =
                  //   periodStatus === STATUS.ACTIVE &&
                  //   segmentStatus === STATUS.ACTIVE
                  // const isSegmentCompleted =
                  //   periodStatus === STATUS.COMPLETED ||
                  //   segmentStatus === STATUS.COMPLETED

                  // const isSegmentActive = false
                  // const isSegmentCompleted = false

                  // const dice1 = segment.facts.dice1 ?? period.facts.initialDice1
                  // const dice2 = segment.facts.dice2 ?? period.facts.initialDice2

                  return <SegmentEntry segment={segment} key={segment.id} />
                })}
                {/* The new segment form was removed. Port to react-hook-form if needed later. */}
              </div>
            </div>
            <div
              className={twMerge(
                'flex flex-row items-center rounded border bg-gray-50 p-2 text-xl text-gray-300',
                // periodStatus === STATUS.RESULTS &&
                'border-red-200 text-red-400'
              )}
            >
              <FontAwesomeIcon icon={faPauseCircle} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { TimelineAdmin }
