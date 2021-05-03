import Header from '../common/Header'

interface Props {
  name: string
  ects: number
}

function CourseEntry({ name, ects }: Props) {
  return (
    <div className="flex flex-row items-center justify-between px-2 py-1 mb-2 border rounded cursor-pointer hover:shadow last:mb-0">
      <Header.H3 className="mb-0">{name}</Header.H3>
      <div>{ects} ECTS</div>
    </div>
  )
}

export default CourseEntry
