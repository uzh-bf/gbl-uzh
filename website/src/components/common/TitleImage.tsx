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
            !imgSrc && 'min-h-[3rem] w-full'
          )}
        >
          <TitleBackground
            className={clsx(
              'p-4 md:p-8',
              imgSrc &&
                'p-4 absolute z-10 bottom-0 md:bottom-5 sm:top-auto bg-opacity-80'
            )}
          >
            {children}
          </TitleBackground>

          {imgSrc && (
            <img
              className="z-0 h-auto w-full min-h-[10rem] max-w-[100rem] saturate-50"
              src={imgSrc}
              alt=""
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default TitleImage
