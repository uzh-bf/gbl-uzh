import { H3, Prose, Tag } from '@uzh-bf/design-system'
import { MDXRemote } from 'next-mdx-remote'
import { twMerge } from 'tailwind-merge'

interface Props {
  name: string
  ects: number
  level: string
  semester: string
  href: string
  institution: string
  highlight?: boolean
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
  highlight,
}: Readonly<Props>) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <div
        className={twMerge(
          'h-full cursor-pointer rounded border bg-white px-2 py-2 hover:shadow',
          highlight && 'border-orange-600 bg-orange-50'
        )}
      >
        <H3 className={{ root: 'text-sm' }}>{name}</H3>
        <Prose>
          <MDXRemote {...description} />
        </Prose>
        <div className="mt-2 flex flex-row gap-1">
          {institution && <Tag label={institution} />}
          {semester && <Tag label={`${semester} Semester`} />}
          {level && <Tag label={level} />}{' '}
          {typeof ects !== 'undefined' && <Tag label={`${ects} ECTS`} />}
          {highlight && (
            <Tag label="New" className={{ root: 'bg-orange-200' }} />
          )}
        </div>
      </div>
    </a>
  )
}

export default CourseEntry
