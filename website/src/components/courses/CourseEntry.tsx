import { MDXRemote } from 'next-mdx-remote'
import Tag from '../common/Tag'

interface Props {
  name: string
  ects: number
  level: string
  semester: string
  href: string
  institution: string
  description?: any
}

function CourseEntry({
  name,
  ects,
  level,
  semester,
  institution,
  href,
  description,
}: Props) {
  return (
    <a
      className="flex-1 mt-4 first:mt-0"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <div className="px-2 py-2 bg-white border rounded cursor-pointer hover:shadow">
        <div className="flex">
          <h3 className="text-base font-bold text-left text-gray-700 sm:text-lg lg:text-xl font-kollektif md:text-left">
            {name}
          </h3>
        </div>
        <p className="max-w-4xl prose-sm prose">
          {<MDXRemote {...description} />}
        </p>
        <div className="flex flex-col gap-1 md:flex-row">
          {institution && <Tag label={institution} />}
          {semester && <Tag label={`${semester} Semester`} />}
          {level && <Tag label={level} />}{' '}
          {ects && <Tag label={`${ects} ECTS`} />}
        </div>
      </div>
    </a>
  )
}

export default CourseEntry
