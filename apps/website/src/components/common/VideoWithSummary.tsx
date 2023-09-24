import { twMerge } from 'tailwind-merge'

interface Props {
  title: string
  videoSrc?: string
  children: React.ReactNode
  keyTakeaways?: any[]
}

function VideoWithSummary({ title, videoSrc, children, keyTakeaways }: Props) {
  return (
    <div>
      <p className="prose hidden max-w-none text-justify md:block">
        {children}
      </p>
      {videoSrc && (
        <div className="mt-4 flex flex-col justify-between md:flex-row">
          <div className="h-80 w-full flex-initial rounded border shadow md:flex-1">
            <iframe
              title={title}
              width="100%"
              height="100%"
              src={videoSrc}
              frameBorder="0"
              allow="fullscreen"
              allowFullScreen
            />
          </div>
          <div className="mt-4 flex-1 md:mt-0 md:pl-6">
            <p className="prose mb-5 max-w-none text-justify md:hidden">
              {children}
            </p>
            <p className="prose">
              {Array.isArray(keyTakeaways) ? (
                <ul className="!mt-0">
                  {keyTakeaways.map((item, ix) => (
                    <li className={twMerge(ix === 0 && '!mt-0')} key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="relative">{keyTakeaways}</div>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

VideoWithSummary.defaultProps = {
  videoSrc: undefined,
  keyTakeaways: undefined,
}

export default VideoWithSummary
