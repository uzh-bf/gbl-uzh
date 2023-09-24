import { H3, H4, Prose } from '@uzh-bf/design-system'

interface Props {
  title: string
  duration: string
  children: React.ReactNode
}

function ProjectPhase({ title, duration, children }: Props) {
  return (
    <div className="flex flex-1 flex-col last:mt-2 sm:last:ml-4 sm:last:mt-0">
      <H3
        className={{
          root: 'flex-initial bg-uzh-red-80 pb-2 pt-2 text-white md:pl-4',
        }}
      >
        {title}
      </H3>

      <div className="flex-1 bg-uzh-grey-20 p-4">
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
