import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import CourseEntry from '../components/courses/CourseEntry'
import GameCard from '../components/games/GameCard'
import PageWithHeader from '../components/PageWithHeader'

const GAMES = [
  {
    href: '/games/pfm',
    name: 'Portfolio Management Simulation',
    tags: ['simulation', 'advanced', 'seminar'],
  },
  {
    href: '/games/derivatives',
    name: 'Derivatives Game',
    tags: ['simulation', 'basic'],
  },
  {
    href: '/games/ufin',
    name: 'uFin',
    tags: ['serious game', 'advanced'],
  },
]
const COURSES = [
  { name: 'Advanced Portfolio Management Game', ects: 6 },
  { name: 'Business and Finance Game', ects: 6 },
]

function GBLAtDBF() {
  return (
    <PageWithHeader title="Games and Courses">
      <TitleBackground>
        <Title title="Our Games and Courses" />
      </TitleBackground>

      <Content>
        <Header.H2>Games</Header.H2>
        <div className="flex flex-col md:flex-row">
          {GAMES.map((game) => (
            <GameCard name={game.name} tags={game.tags} linkHref={game.href} />
          ))}
        </div>

        <Header.H2 className="mt-4 md:mt-8">Courses</Header.H2>
        <div className="">
          {COURSES.map((course) => (
            <CourseEntry name={course.name} ects={course.ects} />
          ))}
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default GBLAtDBF
