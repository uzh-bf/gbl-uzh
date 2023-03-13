import { H3, H4, Prose } from '@uzh-bf/design-system'

interface Props {
  title: string
  duration: string
  children: React.ReactNode
}

function ProjectPhase({ title, duration, children }: Props) {
  return (
    <div className="flex flex-col flex-1 last:mt-2 sm:last:mt-0 sm:last:ml-4">
      <H3
        className={{
          root: 'flex-initial pb-2 md:pl-4 pt-2 text-white bg-uzh-red-80',
        }}
      >
        {title}
      </H3>

      <div className="flex-1 p-4 bg-uzh-grey-20">
        <H4>Project Duration</H4>
        <Prose>{duration}</Prose>
        <H4>Project Goals</H4>
        <Prose>
          <ul className="!mt-0">{children}</ul>
          <p>Supported by Swissuniversities and the University of Zurich</p>
        </Prose>
      </div>
    </div>
  )
}

export default ProjectPhase
