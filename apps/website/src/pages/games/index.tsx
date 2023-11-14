import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, H1, H2, Prose } from '@uzh-bf/design-system'
import { sortBy } from 'ramda'
import Content from '../../components/Content'
import PageWithHeader from '../../components/PageWithHeader'
import TitleBackground from '../../components/common/TitleBackground'
import CourseEntry from '../../components/courses/CourseEntry'
import GameCard from '../../components/games/GameCard'
import * as Util from '../../lib/util'

interface Props {
  sourceArr: any[]
}

function GBLinUse({ sourceArr }: Props) {
  console.warn(sourceArr)
  return (
    <PageWithHeader title="GBL in Use">
      <TitleBackground>
        <H1 className={{ root: 'mx-auto max-w-6xl lg:pl-4' }}>GBL in Use</H1>
      </TitleBackground>

      <Content>
        <div>
          <H2>Serious games and simulations developed at UZH</H2>
          <Prose className={{ root: 'max-w-none' }}>
            Serious games and simulations that have been developed or are being
            developed at institutions of the University of Zurich.
          </Prose>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {sortBy(
              ({ frontmatter }: any) => frontmatter.title,
              sourceArr[0].filter((item: any) => !item.frontmatter.external)
            ).map(({ frontmatter }) => (
              <GameCard
                key={frontmatter.title}
                name={frontmatter.title}
                tags={frontmatter.tags}
                linkHref={`/games/${frontmatter.slug}`}
                imgSrc={frontmatter.imgSrc}
              />
            ))}
            <a href="https://forms.office.com/e/UL1CWut5ya" target="_blank">
              <Button
                fluid
                className={{
                  root: 'h-full flex-col border-uzh-red-40 bg-uzh-red-20 text-lg',
                }}
              >
                <Button.Icon>
                  <FontAwesomeIcon icon={faPlus} />
                </Button.Icon>
                <Button.Label>Submit your own game</Button.Label>
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-4 md:mt-8">
          <H2>Serious games and simulations developed at other institutions</H2>
          <Prose className={{ root: 'max-w-none' }}>
            Serious games and simulations of other educational institutions.
          </Prose>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {sortBy(
              ({ frontmatter }: any) => frontmatter.title,
              sourceArr[0].filter((item: any) => item.frontmatter.external)
            ).map(({ frontmatter }) => (
              <GameCard
                key={frontmatter.title}
                name={frontmatter.title}
                tags={frontmatter.tags}
                linkHref={`/games/${frontmatter.slug}`}
                imgSrc={frontmatter.imgSrc}
              />
            ))}
            <a href="https://forms.office.com/e/UL1CWut5ya" target="_blank">
              <Button
                fluid
                className={{
                  root: 'h-full flex-col border-uzh-red-40 bg-uzh-red-20 text-lg',
                }}
              >
                <Button.Icon>
                  <FontAwesomeIcon icon={faPlus} />
                </Button.Icon>
                <Button.Label>Submit your own game</Button.Label>
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-4 md:mt-8">
          <H2>Courses</H2>
          <Prose className={{ root: 'max-w-none' }}>
            A selection of lectures and seminars at the University of Zurich
            that contain Game-Based Learning elements.
          </Prose>
          <div className="mt-2 flex flex-col gap-2 md:grid md:grid-cols-2">
            {sourceArr[1].map(({ frontmatter, ...source }: any, ix: number) => (
              <CourseEntry
                key={frontmatter.name}
                name={frontmatter.name}
                ects={frontmatter.ects}
                level={frontmatter.level}
                href={frontmatter.href}
                semester={frontmatter.semester}
                institution={frontmatter.institution}
                highlight={frontmatter.highlight}
                description={source}
              />
            ))}

            <a href="https://forms.office.com/e/nieHr9d1EX" target="_blank">
              <Button fluid className={{ root: 'h-full gap-4 text-lg' }}>
                <Button.Icon>
                  <FontAwesomeIcon icon={faPlus} />
                </Button.Icon>
                <Button.Label>Submit your own course</Button.Label>
              </Button>
            </a>
          </div>
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default GBLinUse
export const getStaticProps = Util.getStaticPropsFolders(['games', 'courses'])
