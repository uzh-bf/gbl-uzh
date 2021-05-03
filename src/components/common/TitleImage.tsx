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
      <img className="z-0 opacity-80" width="100%" src={imgSrc} alt="" />
    </div>
  )
}

export default TitleImage
