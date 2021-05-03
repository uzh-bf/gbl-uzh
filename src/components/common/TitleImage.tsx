interface Props {
  imgSrc: string
  title: string
}

function TitleImage({ imgSrc, title }: Props) {
  return (
    <div className="relative shadow-lg">
      <div className="absolute z-10 w-full p-4 shadow bg-uzh-gray-20 bottom-5 sm:top-auto sm:bottom-10 bg-opacity-80">
        <div className="max-w-6xl m-auto font-mono text-2xl font-bold text-center text-uzh-red-80 sm:text-4xl lg:text-6xl">
          {title}
        </div>
      </div>
      <img className="z-0 opacity-80" width="100%" src={imgSrc} alt="" />
    </div>
  )
}

export default TitleImage
