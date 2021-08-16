import PFMImage from '../../public/images/pfm_game.png'
import uFinImage from '../../public/images/ufin.jpg'
import UnderConstructionImage from '../../public/images/under_construction.jpg'
import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import CourseEntry from '../components/courses/CourseEntry'
import GameCard from '../components/games/GameCard'
import PageWithHeader from '../components/PageWithHeader'

const GAMES = [
  {
    name: 'uFin: The Challenge',
    href: '/games/ufin',
    imgSrc: uFinImage,
    tags: ['serious game', 'ethics'],
  },
  {
    name: 'Portfolio Management Simulation',
    href: '/games/portfolio-management-simulation',
    imgSrc: PFMImage,
    tags: ['simulation', 'investing'],
  },
  {
    name: 'Derivatives Game',
    href: '/games/derivatives-game',
    imgSrc: UnderConstructionImage,
    tags: ['simulation', 'trading', 'work in progress'],
  },
  {
    name: 'Private Banking Game',
    href: '/games/private-banking-game',
    imgSrc: UnderConstructionImage,
    tags: ['serious game', 'banking', 'work in progress'],
  },
]
const COURSES = [
  {
    name: 'Advanced Portfolio Management Game (S)',
    ects: 3,
    level: 'Master',
    href: 'https://studentservices.uzh.ch/uzh/anonym/vvz/?sap-language=EN&sap-ui-language=EN#/details/2021/003/SM/50499168',
  },
  {
    name: 'Banking Game: Gesamtführung einer Bank (S)',
    ects: 3,
    level: 'Bachelor',
    href: 'https://studentservices.uzh.ch/uzh/anonym/vvz/?sap-language=EN&sap-ui-language=EN#/details/2020/004/SM/50354580',
  },
  {
    name: 'Behavioral Ethics (S)',
    ects: 3,
    level: 'Bachelor',
    href: 'https://studentservices.uzh.ch/uzh/anonym/vvz/?sap-language=EN&sap-ui-language=EN#/details/2020/004/SM/50821473',
  },
  {
    name: 'Business- & Finance-Game (S)',
    ects: 3,
    level: 'Bachelor',
    href: 'https://studentservices.uzh.ch/uzh/anonym/vvz/?sap-language=EN&sap-ui-language=EN#/details/2021/003/SM/50340267',
  },
  {
    name: 'Commodity Trading (L+E)',
    ects: 3,
    level: 'Master',
    href: 'https://studentservices.uzh.ch/uzh/anonym/vvz/?sap-language=EN&sap-ui-language=EN#/details/2020/004/SM/50938958',
  },
  {
    name: 'Finance for the Future: Investments, Sustainable Finance & FinTech (Summer School)',
    ects: 6,
    level: 'Bachelor',
    href: 'https://studentservices.uzh.ch/uzh/anonym/vvz/?sap-language=EN&sap-ui-language=EN#/details/2020/004/SM/50939506',
  },
]

function GBLinUse() {
  return (
    <PageWithHeader title="GBL in Use">
      <TitleBackground>
        <Title title="GBL in Use" />
      </TitleBackground>

      <Content>
        <div>
          <Header.H2>Games</Header.H2>
          <p className="text-gray-600">
            Simulations and Serious Games that have been developed or are being
            developed at the Department of Banking and Finance of the University
            of Zurich.
          </p>
          <div className="mt-4 sm:grid sm:grid-cols-3 sm:gap-2 md:gap-4">
            {GAMES.map((game) => (
              <GameCard
                key={game.name}
                name={game.name}
                tags={game.tags}
                linkHref={game.href}
                imgSrc={game.imgSrc}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 md:mt-8">
          <Header.H2>Courses</Header.H2>
          <p className="text-gray-600">
            A selection of lectures and seminars that contain Game-Based
            Learning elements at the Department of Banking and Finance of the
            University of Zurich.
          </p>
          <div className="flex flex-col mt-4">
            {COURSES.map((course) => (
              <CourseEntry
                key={course.name}
                name={course.name}
                ects={course.ects}
                level={course.level}
                href={course.href}
              />
            ))}
          </div>
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default GBLinUse
