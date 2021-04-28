import Link from 'next/link'
import Header from '../components/common/Header'
import PageWithHeader from '../components/PageWithHeader'

const GAMES = [
  {
    name: 'Portfolio Management Simulation',
    tags: ['simulation', 'advanced', 'seminar'],
  },
  {
    name: 'Derivatives Game',
    tags: ['simulation', 'basic'],
  },
  {
    name: 'uFin',
    tags: ['serious game', 'advanced'],
  },
]
const COURSES = [
  { name: 'Advanced Portfolio Management Game', ects: 6 },
  { name: 'Business and Finance Game', ects: 6 },
]

export function GameCard({ name, tags }) {
  return (
    <div className="flex flex-col items-center p-2 mb-2 border rounded md:mb-0 md:mr-2 md:last:mr-0">
      <div className="flex flex-row">
        <svg height="35" width="35">
          <circle
            cx="15"
            cy="15"
            r="15"
            stroke="black"
            strokeWidth="1"
            fill="grey"
          />
        </svg>
        <svg height="35" width="35">
          <circle
            cx="15"
            cy="15"
            r="15"
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <svg height="35" width="35">
          <circle
            cx="15"
            cy="15"
            r="15"
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <img src="https://place-hold.it/300x100/D3D3D3?text=SCREENSHOT" />
      <Header.H3 className="mt-2 md:text-base">
        {name}
        <Link href="/games/ufin"> [TO]</Link>
      </Header.H3>

      <div className="flex flex-row flex-wrap">
        {tags.map((tag) => (
          <div className="px-2 mr-1 text-sm border rounded">{tag}</div>
        ))}
      </div>
    </div>
  )
}

function CourseEntry({ name, ects }) {
  return (
    <div className="flex flex-row items-center justify-between px-2 py-1 mb-2 border rounded last:mb-0">
      <Header.H3 className="mb-0">{name}</Header.H3>
      <div>{ects} ECTS</div>
    </div>
  )
}

function GBLAtDBF() {
  return (
    <PageWithHeader title="Games and Courses">
      <Header.H1>Games</Header.H1>
      <div className="flex flex-col md:flex-row">
        {GAMES.map((game) => (
          <GameCard name={game.name} tags={game.tags} />
        ))}
      </div>

      <Header.H1 className="mt-4 md:mt-8">Courses</Header.H1>
      <div className="">
        {COURSES.map((course) => (
          <CourseEntry name={course.name} ects={course.ects} />
        ))}
      </div>
    </PageWithHeader>
  )
}

export default GBLAtDBF
