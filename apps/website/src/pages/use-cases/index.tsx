import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, H1, H2 } from '@uzh-bf/design-system'
import { useRouter } from 'next/router'
import { sortBy } from 'ramda'
import { twMerge } from 'tailwind-merge'
import Content from '../../components/Content'
import PageWithHeader from '../../components/PageWithHeader'
import TitleBackground from '../../components/common/TitleBackground'
import HomeSection from '../../components/sections/HomeSection'
import * as Util from '../../lib/util'

interface Props {
  sourceArr: any
}

function GBLUseCases({ sourceArr }: Props) {
  const router = useRouter()

  const useCasesDevelopment = sortBy(
    ({ frontmatter }: any) => frontmatter.title,
    sourceArr[0]
  ).filter(({ frontmatter }) => frontmatter.type === 'development')
  const useCasesSeriousGames = sortBy(
    ({ frontmatter }: any) => frontmatter.title,
    sourceArr[0]
  ).filter(({ frontmatter }) => frontmatter.type === 'serious-games')
  const useCasesSimulations = sortBy(
    ({ frontmatter }: any) => frontmatter.title,
    sourceArr[0]
  ).filter(({ frontmatter }) => frontmatter.type === 'simulations')

  return (
    <PageWithHeader title="Use Cases">
      <TitleBackground>
        <H1 className={{ root: 'mx-auto max-w-6xl lg:pl-4' }}>Use Cases</H1>
      </TitleBackground>

      <Content>
        <H2>Game Development</H2>
        <div className="">
          {useCasesDevelopment.map(({ frontmatter }: any, ix) => (
            <HomeSection key={frontmatter.slug}>
              <HomeSection.Content
                className={twMerge(ix % 2 === 0 ? 'order-1' : 'order-2')}
                title={frontmatter.title}
                content={frontmatter.abstract}
              >
                <Button
                  className={{ root: 'mt-4' }}
                  onClick={() => router.push(`/use-cases/${frontmatter.slug}`)}
                >
                  <Button.Icon>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Button.Icon>
                  <Button.Label>Read more</Button.Label>
                </Button>
              </HomeSection.Content>
              <HomeSection.Hero
                className={twMerge('', ix % 2 === 0 ? 'order-2' : 'order-1')}
                src={frontmatter.imgSrc}
              />
            </HomeSection>
          ))}
        </div>

        <H2 className={{ root: 'mt-6' }}>Simulations</H2>
        <div className="">
          {useCasesSimulations.map(({ frontmatter }: any, ix: number) => (
            <HomeSection key={frontmatter.slug}>
              <HomeSection.Content
                className={twMerge(ix % 2 === 0 ? 'order-1' : 'order-2')}
                title={frontmatter.title}
                content={frontmatter.abstract}
              >
                <Button
                  className={{ root: 'mt-4' }}
                  onClick={() => router.push(`/use-cases/${frontmatter.slug}`)}
                >
                  <Button.Icon>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Button.Icon>
                  <Button.Label>Read more</Button.Label>
                </Button>
              </HomeSection.Content>
              <HomeSection.Hero
                className={twMerge(ix % 2 === 0 ? 'order-2' : 'order-1')}
                src={frontmatter.imgSrc}
              />
            </HomeSection>
          ))}
        </div>

        {/* <H2 className={{ root: 'mt-6' }}>Serious Games</H2>
        <div className="">Coming Soon</div> */}
      </Content>
    </PageWithHeader>
  )
}

export default GBLUseCases
export const getStaticProps = Util.getStaticPropsFolders(['use-cases'])
