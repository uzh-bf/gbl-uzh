import { H3, Prose, Tag } from '@uzh-bf/design-system'
import { MDXRemote } from 'next-mdx-remote'

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
        <H3>{name}</H3>
        <Prose>{<MDXRemote {...description} />}</Prose>
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
