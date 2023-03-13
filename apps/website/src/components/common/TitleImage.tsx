import { twMerge } from 'tailwind-merge'
import TitleBackground from './TitleBackground'

interface Props {
  imgSrc: string
  children: React.ReactNode
}

function TitleImage({ imgSrc, children }: Props) {
  return (
    <div className={twMerge(imgSrc && 'border-uzh-red-100 bg-slate-50')}>
      <div className="flex justify-center">
        <div
          className={twMerge(
            'relative max-h-[25rem] overflow-hidden',
            !imgSrc && 'min-h-[3rem] w-full'
          )}
        >
          {imgSrc && (
            <img
              className="h-auto w-full min-h-[10rem] max-w-[100rem] saturate-50"
              src={imgSrc}
              alt=""
            />
          )}

          <TitleBackground
            className={twMerge(
              'p-4 md:p-6',
              imgSrc &&
                'p-4 absolute bottom-0 md:bottom-3 sm:top-auto bg-opacity-90 border-b border-slate-300'
            )}
          >
            {children}
          </TitleBackground>
        </div>
      </div>
    </div>
  )
}

export default TitleImage
