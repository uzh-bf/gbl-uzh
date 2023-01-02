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
    <a href={href} target="_blank" rel="noreferrer">
      <div className="h-full px-2 py-2 bg-white border rounded cursor-pointer hover:shadow">
        <H3 className={{ root: 'text-base' }}>{name}</H3>
        <Prose>{<MDXRemote {...description} />}</Prose>
        <div className="flex flex-row gap-1 mt-2">
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
