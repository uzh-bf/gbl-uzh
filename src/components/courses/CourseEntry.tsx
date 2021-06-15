interface Props {
  name: string
  ects: number
  level: string
  href: string
}

function CourseEntry({ name, ects, level, href }: Props) {
  return (
    <a className="flex-1 mt-2 first:mt-0" href={href}>
      <div className="flex flex-row items-center justify-between px-2 py-1 border rounded cursor-pointer hover:shadow">
        <div className="flex">
          <h3 className="text-base text-center text-gray-700 sm:text-lg lg:text-xl font-kollektif-bold md:text-left">
            {name}
          </h3>
        </div>
        <div className="text-right">
          <div>{ects} ECTS</div>
          <div>{level}</div>
        </div>
      </div>
    </a>
  )
}

export default CourseEntry
