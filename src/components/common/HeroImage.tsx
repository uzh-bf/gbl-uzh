interface Props {
  imgSrc: string
  label: string
}

function HeroImage({ imgSrc, label }: Props) {
  return (
    <div className="flex flex-row items-center px-2 mb-4 text-xl text-center border cursor-pointer last:mb-0 md:mb-0 md:mr-8 md:last:mr-0 rounded-xl md:p-4 md:flex-1 md:flex-col text-uzh-red-100 hover:shadow">
      <img width="150" src={imgSrc} alt="Hero" />
      <p className="pl-8 md:pl-0">{label}</p>
    </div>
  )
}

HeroImage.Group = function HeroImageGroup({
  children,
}: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-col max-w-3xl md:m-auto md:justify-between md:flex-row">
      {children}
    </div>
  )
}

export default HeroImage
