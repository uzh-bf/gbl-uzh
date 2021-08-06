interface Props {
  title: string
  duration: string
  children: React.ReactNode
}

function ProjectPhase({ title, duration, children }: Props) {
  return (
    <div className="flex flex-col flex-1 last:mt-2 sm:last:mt-0 sm:last:ml-4">
      <div className="flex-initial p-2 font-bold text-center text-white bg-uzh-red-80">
        {title}
      </div>
      <div className="flex-1 p-4 prose bg-uzh-gray-20">
        <p>
          <span className="font-bold">Project Duration</span>
          <br />
          {duration}
        </p>
        <p>
          <span className="font-bold">Project Goals</span>
          <ul className="!mt-0">{children}</ul>
        </p>
        <p>Supported by Swissuniversities and the University of Zurich</p>
      </div>
    </div>
  )
}

export default ProjectPhase
