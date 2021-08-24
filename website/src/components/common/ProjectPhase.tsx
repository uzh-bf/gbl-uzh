import Header from './Header'

interface Props {
  title: string
  duration: string
  children: React.ReactNode
}

function ProjectPhase({ title, duration, children }: Props) {
  return (
    <div className="flex flex-col flex-1 last:mt-2 sm:last:mt-0 sm:last:ml-4">
      <div className="prose">
        <Header.H3 className="flex-initial pb-2 md:pl-4 pt-2 -mb-4 !text-white bg-uzh-red-80">
          {title}
        </Header.H3>
      </div>

      <div className="flex-1 p-4 prose bg-uzh-gray-20">
        <Header.H4 className="!text-left">Project Duration</Header.H4>
        <p>{duration}</p>
        <Header.H4 className="!text-left">Project Goals</Header.H4>
        <p>
          <ul className="!mt-0">{children}</ul>
        </p>
        <p>Supported by Swissuniversities and the University of Zurich</p>
      </div>
    </div>
  )
}

export default ProjectPhase
