import clsx from 'clsx'
import TitleBackground from './TitleBackground'

interface Props {
  imgSrc: string
  children: React.ReactNode
}

function TitleImage({ imgSrc, children }: Props) {
  return (
    <div className={clsx(imgSrc && 'border-uzh-red-100 bg-uzh-gray-20')}>
      <div className="flex justify-center">
        <div
          className={clsx(
            'relative max-h-[23rem] overflow-hidden',
            imgSrc && 'min-h-[7rem]',
            !imgSrc && 'min-h-[3rem] min-w-full'
          )}
        >
          <TitleBackground
            className={clsx(
              'p-4 md:p-8 bg-opacity-70',
              imgSrc && 'p-4 absolute z-10 bottom-5 sm:top-auto sm:bottom-10 '
            )}
          >
            {children}
          </TitleBackground>

          <img
            className="z-0 opacity-100 saturate-50 w-auto min-w-[80vw] min-h-full"
            width="100%"
            height="100%"
            src={imgSrc}
            alt=""
          />
        </div>
      </div>
    </div>
  )
}

export default TitleImage
