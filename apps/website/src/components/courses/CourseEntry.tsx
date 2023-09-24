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
      <div className="h-full cursor-pointer rounded border bg-white px-2 py-2 hover:shadow">
        <H3 className={{ root: 'text-sm' }}>{name}</H3>
        <Prose>
          <MDXRemote {...description} />
        </Prose>
        <div className="mt-2 flex flex-row gap-1">
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
