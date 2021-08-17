import clsx from 'clsx'

interface Props {
  title: string
  videoSrc?: string
  children: React.ReactNode
  keyTakeaways?: any[]
}

function VideoWithSummary({ title, videoSrc, children, keyTakeaways }: Props) {
  return (
    <div>
      <p className="prose text-justify max-w-none">{children}</p>
      {videoSrc && (
        <div className="flex flex-col justify-between mt-4 md:flex-row">
          <div className="flex-initial w-full border rounded shadow h-80 md:flex-1">
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
          <div className="flex-1 mt-4 md:mt-0 md:pl-6">
            <p className="prose">
              {Array.isArray(keyTakeaways) ? (
                <ul className="!mt-0">
                  {keyTakeaways.map((item, ix) => (
                    <li className={clsx(ix === 0 && '!mt-0')} key={item}>
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
