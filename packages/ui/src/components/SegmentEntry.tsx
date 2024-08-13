import { twMerge } from 'tailwind-merge'
import { faCalendar } from '@fortawesome/free-regular-svg-icons'
import { faCheck, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
  segment: {
    id: number
    index: number
    storyElements: any[]
    learningElements: any[]
  }
}

// TODO(JJ):
// - isSegmentActive
// - isSegmentCompleted

function SegmentEntry({ segment }: Props) {
  const isSegmentActive = false
  const isSegmentCompleted = false
  return (
    <div
      className={twMerge(
        'flex-initial rounded border p-2 text-center',
        isSegmentActive && 'border-green-600 bg-green-100',
        isSegmentCompleted && ' text-gray-400'
      )}
      key={segment.id}
    >
      <div className="flex flex-row gap-2">
        <div>
          {!isSegmentActive && !isSegmentCompleted && (
            <FontAwesomeIcon icon={faCalendar} />
          )}
          {isSegmentActive && <FontAwesomeIcon icon={faSync} />}
          {isSegmentCompleted && <FontAwesomeIcon icon={faCheck} />}
        </div>
        <div className="whitespace-nowrap text-right">
          {/* <div className="text-sm">
                            S = {segment.facts.spotPrice.toFixed()}
                          </div> */}

          {/* <div className="text-sm">
                            F = {segment.facts.futuresPrice.toFixed()}
                          </div> */}
          <div className="flex flex-row gap-2">
            <div className="text-sm">Story: {segment.storyElements.length}</div>
            <div className="text-sm">
              Learn: {segment.learningElements.length}
            </div>
          </div>

          {/* <div className="text-sm">
                            K = +
                            {optionalValueToCHFString(
                              segment.facts.cashInflow * 1.1
                            )}
                          </div>

                          <div className="text-sm">
                            VK = +
                            {optionalValueToCHFString(
                              segment.facts.cashInflow * 0.1
                            )}
                          </div> */}

          {/* {dice1 && dice2 && (
                            <div className="text-sm">
                              <Link
                                href={`/admin/dice/${period.facts.trendE}/${period.facts.trendGap}/${dice1}-${dice2}`}
                                target="_blank"
                              >
                                Dice ={dice1}+{dice2}={dice1 + dice2}
                              </Link>
                            </div>
                          )} */}
        </div>
      </div>
    </div>
  )
}

export { SegmentEntry }
