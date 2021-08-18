import clsx from 'clsx'
import TitleBackground from './TitleBackground'

interface Props {
  imgSrc: string
  children: React.ReactNode
}

function TitleImage({ imgSrc, children }: Props) {
  return (
    <div className={clsx(imgSrc && 'relative shadow-lg')}>
      <TitleBackground
        className={clsx(
          'md:p-8 bg-opacity-80',
          imgSrc && 'p-4 absolute z-10 bottom-5 sm:top-auto sm:bottom-10 '
        )}
      >
        {children}
      </TitleBackground>

      <div className="bg-gray-100">
        <img
          className="z-0 w-auto m-auto opacity-100 max-h-[28rem]"
          width="100%"
          height="100%"
          src={imgSrc}
          alt=""
        />
      </div>
    </div>
  )
}

export default TitleImage
