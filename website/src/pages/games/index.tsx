import Header from '../../components/common/Header'
import Title from '../../components/common/Title'
import TitleBackground from '../../components/common/TitleBackground'
import Content from '../../components/Content'
import CourseEntry from '../../components/courses/CourseEntry'
import GameCard from '../../components/games/GameCard'
import PageWithHeader from '../../components/PageWithHeader'
import * as Util from '../../lib/util'

interface Props {
  sourceArr: any
  frontMatterArr: any
  filenames: any
  fileMissingArr: any
}

function GBLinUse({
  sourceArr,
  frontMatterArr,
  filenames,
  fileMissingArr,
}: Props) {
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
            {frontMatterArr[0].map((game: any) => (
              <GameCard
                key={game.title}
                name={game.title}
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
            {frontMatterArr[1].map((course: any) => (
              <CourseEntry
                key={course.name}
                name={course.name}
                ects={course.ects}
                level={course.level}
                href={course.href}
                semester={course.semester}
                institution={course.institution}
              />
            ))}
          </div>
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default GBLinUse
export const getStaticProps = Util.getStaticPropsFolders(['games', 'courses'])
