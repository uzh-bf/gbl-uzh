import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import CourseEntry from '../components/courses/CourseEntry'
import GameCard from '../components/games/GameCard'
import PageWithHeader from '../components/PageWithHeader'
import * as Util from '../lib/util'

interface Props {
  source: any
  frontMatter: any
  cwd: string
}

function GBLinUse({ source, frontMatter }: Props) {
  return (
    <PageWithHeader title="GBL in Use">
      <TitleBackground>
        <Title title="GBL in Use" />
      </TitleBackground>

      <Content>
        <div>
          <Header.H2>Games</Header.H2>
          <p className="text-gray-600">{frontMatter.games_description}</p>
          <div className="mt-4 sm:grid sm:grid-cols-3 sm:gap-2 md:gap-4">
            {frontMatter.games.map((game: any) => (
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
          <p className="text-gray-600">{frontMatter.courses_description}</p>
          <div className="flex flex-col mt-4">
            {frontMatter.courses.map((course: any) => (
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
export const getStaticProps = Util.getStaticPropsSinglePage(
  'resources',
  'GBL in Use'
)
