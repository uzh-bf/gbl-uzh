import TitleBackground from './TitleBackground'

interface Props {
  imgSrc: string
  children: React.ReactNode
}

function TitleImage({ imgSrc, children }: Props) {
  return (
    <div className="relative shadow-lg">
      <TitleBackground className="absolute z-10 p-4 bottom-5 sm:top-auto sm:bottom-10 bg-opacity-80">
        {children}
      </TitleBackground>
      <div className="bg-gray-100">
        <img
          className="z-0 w-auto m-auto opacity-100 max-h-[35rem]"
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
