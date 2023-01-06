import { H1, H2, Prose } from '@uzh-bf/design-system'
import { sortBy } from 'ramda'
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
        <H1 className={{ root: 'max-w-6xl mx-auto lg:pl-4' }}>GBL in Use</H1>
      </TitleBackground>

      <Content>
        <div>
          <H2>Games</H2>
          <Prose className={{ root: 'max-w-none' }}>
            Simulations and Serious Games that have been developed or are being
            developed at institutions of the University of Zurich.
          </Prose>
          <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2 md:grid-cols-3">
            {sortBy((game: any) => game.title, frontMatterArr[0]).map(
              (game: any) => (
                <GameCard
                  key={game.title}
                  name={game.title}
                  tags={game.tags}
                  linkHref={`/games/${game.slug}`}
                  imgSrc={game.imgSrc}
                />
              )
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-8">
          <H2>Courses</H2>
          <Prose className={{ root: 'max-w-none' }}>
            A selection of lectures and seminars at the University of Zurich
            that contain Game-Based Learning elements.
          </Prose>
          <div className="flex flex-col gap-2 mt-2 md:grid md:grid-cols-2">
            {frontMatterArr[1].map((course: any, ix: number) => (
              <CourseEntry
                key={course.name}
                name={course.name}
                ects={course.ects}
                level={course.level}
                href={course.href}
                semester={course.semester}
                institution={course.institution}
                description={sourceArr[1][ix]}
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
