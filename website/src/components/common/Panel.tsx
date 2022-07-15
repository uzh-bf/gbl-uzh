import { CheckIcon, PresentationChartBarIcon } from '@heroicons/react/solid'
import clsx from 'clsx'
import Button from './Button'
import Header from './Header'
import VideoWithSummary from './VideoWithSummary'

interface Props {
  title: string
  videoSrc?: string
  duration?: string
  keyTakeaways?: any
  resources?: {
    name: string
    href: string
  }[]
  isOpen?: boolean
  isCompleted?: boolean
  onNext: () => void
  onPrevious: () => void
  onActivate: () => void
  children: React.ReactNode
}

const defaultProps = {
  isOpen: false,
  onNext: undefined,
  onPrevious: undefined,
  resources: undefined,
  videoSrc: undefined,
  duration: undefined,
  keyTakeaways: undefined,
}

function Panel({
  title,
  videoSrc,
  duration,
  keyTakeaways,
  resources,
  isOpen,
  isCompleted,
  onNext,
  onPrevious,
  onActivate,
  children,
}: Props) {
  return (
    <div className="mt-4">
      <button
        className="w-full p-4 border rounded bg-uzh-grey-20"
        onClick={onActivate}
      >
        <div className="flex flex-row items-center justify-between">
          <div>
            <Header.H2 className="flex-1 !mb-0 !text-left">{title}</Header.H2>
            <div className="text-left text-gray-700">{duration}</div>
          </div>
          <div className="flex-initial w-6">{isCompleted && <CheckIcon />}</div>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border border-t-0">
          {videoSrc && (
            <VideoWithSummary
              title={title}
              videoSrc={videoSrc}
              keyTakeaways={keyTakeaways}
            >
              {children}
            </VideoWithSummary>
          )}
          {!videoSrc && (
            <p className="block prose text-justify max-w-none">{children}</p>
          )}

          {Array.isArray(resources) && (
            <div className={clsx('mt-4', videoSrc && 'pt-4 border-t')}>
              <div className="flex flex-col md:flex-row">
                <div className="flex-1">
                  <div className="font-bold">Resources</div>
                  <ul>
                    {resources.map((item) => (
                      <li key={item.name}>
                        <a
                          className="flex flex-row items-center hover:text-uzh-blue-100"
                          target="_blank"
                          href={item.href}
                          rel="noreferrer"
                        >
                          <PresentationChartBarIcon className="h-4 mr-1" />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* <div className="flex-1 pt-4 md:pt-0 md:pl-6">
                <div className="font-bold">References</div>
                <ul>
                  <li>TBD References</li>
                </ul>
              </div> */}
              </div>
            </div>
          )}
          {/* Simpler Layout on Mobile devices (only arrows without text are visible) */}
          <div className="flex justify-between pt-4 mt-4 border-t">
            {onPrevious && (
              <Button onClick={onPrevious}>
                <Button.ArrowLeft />
                <div className="hidden ml-2 md:block">Previous Module</div>
              </Button>
            )}
            {onNext && !onPrevious && (
              <>
                <div className="flex-1"></div>
                <Button onClick={onNext}>
                  <div className="hidden mr-2 md:block">Next Module</div>
                  <Button.Arrow />
                </Button>
              </>
            )}
            {onNext && onPrevious && (
              <Button onClick={onNext}>
                <div className="hidden mr-2 md:block">Next Module</div>
                <Button.Arrow />
              </Button>
            )}
          </div>
          {/* Stacking Layout for buttons on mobile devices
          <div className="hidden justify-between pt-4 mt-4 border-t md:flex">
            {onPrevious && (
              <Button onClick={onPrevious}>
                <Button.ArrowLeft />
                <div className="hidden ml-2 md:block">Previous Module</div>
              </Button>
            )}
            {onNext && !onPrevious && (
              <>
                <div className="flex-1"></div>
                <Button onClick={onNext}>
                  <Button.Arrow />
                  <div className="hidden ml-2 md:block">Next Module</div>
                </Button>
              </>
            )}
            {onNext && onPrevious && (
              <Button onClick={onNext}>
                <Button.Arrow />
                <div className="hidden ml-2 md:block">Next Module</div>
              </Button>
            )}
          </div>
          <div className="pt-4 mt-4 border-t md:hidden">
            {onPrevious && (
              <Button
                onClick={onPrevious}
                className="w-full justify-center md:w-auto"
              >
                <Button.ArrowLeft />
                <div className="ml-2">Previous Module</div>
              </Button>
            )}
          </div>
          <div className="mt-1 md:hidden">
            {onNext && !onPrevious && (
              <>
                <div className="flex-1"></div>
                <Button
                  onClick={onNext}
                  className="w-full justify-center md:w-auto"
                >
                  <Button.Arrow />
                  <div className="ml-2">Next Module</div>
                </Button>
              </>
            )}
          </div>
          <div className="pt-1 mt-1 md:hidden">
            {onNext && onPrevious && (
              <Button
                onClick={onNext}
                className="w-full justify-center md:w-auto"
              >
                <Button.Arrow />
                <div className="ml-2">Next Module</div>
              </Button>
            )}
            </div> */}
        </div>
      )}
    </div>
  )
}

Panel.defaultProps = defaultProps

export default Panel
