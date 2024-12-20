import { faArrowRight, faChalkboardTeacher, faGamepad, faChartLine } from '@fortawesome/free-solid-svg-icons'
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

  const useCasesDidactics = sortBy(
    ({ frontmatter }: any) => frontmatter.title,
    sourceArr[0]
  ).filter(({ frontmatter }) => frontmatter.type === 'didactics')
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
        <div className="space-y-12">
          <section>
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="h-6 w-6 text-orange-600" />
                </div>
                <H2 className={{ root: 'mb-0 text-3xl' }}>Didactics</H2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {useCasesDidactics.map(({ frontmatter }: any, ix) => (
                <div 
                  key={frontmatter.slug}
                  className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-orange-200 hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img 
                      src={frontmatter.imgSrc} 
                      alt={frontmatter.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <div className="relative p-6">
                    <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                    <h3 className="mb-2 text-xl font-bold">{frontmatter.title}</h3>
                    <p className="mb-4 text-slate-600">{frontmatter.abstract}</p>
                    <Button
                      onClick={() => router.push(`/use-cases/${frontmatter.slug}`)}
                      className={{ root: 'group/button' }}
                    >
                      <Button.Label>Read more</Button.Label>
                      <Button.Icon>
                        <FontAwesomeIcon 
                          icon={faArrowRight} 
                          className="transition-transform group-hover/button:translate-x-0.5" 
                        />
                      </Button.Icon>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <FontAwesomeIcon icon={faGamepad} className="h-6 w-6 text-orange-600" />
                </div>
                <H2 className={{ root: 'mb-0 text-3xl' }}>Game Development</H2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {useCasesDevelopment.map(({ frontmatter }: any, ix) => (
                <div 
                  key={frontmatter.slug}
                  className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-orange-200 hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img 
                      src={frontmatter.imgSrc} 
                      alt={frontmatter.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <div className="relative p-6">
                    <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                    <h3 className="mb-2 text-xl font-bold">{frontmatter.title}</h3>
                    <p className="mb-4 text-slate-600">{frontmatter.abstract}</p>
                    <Button
                      onClick={() => router.push(`/use-cases/${frontmatter.slug}`)}
                      className={{ root: 'group/button' }}
                    >
                      <Button.Label>Read more</Button.Label>
                      <Button.Icon>
                        <FontAwesomeIcon 
                          icon={faArrowRight} 
                          className="transition-transform group-hover/button:translate-x-0.5" 
                        />
                      </Button.Icon>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-orange-600" />
                </div>
                <H2 className={{ root: 'mb-0 text-3xl' }}>Simulations</H2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {useCasesSimulations.map(({ frontmatter }: any, ix) => (
                <div 
                  key={frontmatter.slug}
                  className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-orange-200 hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img 
                      src={frontmatter.imgSrc} 
                      alt={frontmatter.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <div className="relative p-6">
                    <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                    <h3 className="mb-2 text-xl font-bold">{frontmatter.title}</h3>
                    <p className="mb-4 text-slate-600">{frontmatter.abstract}</p>
                    <Button
                      onClick={() => router.push(`/use-cases/${frontmatter.slug}`)}
                      className={{ root: 'group/button' }}
                    >
                      <Button.Label>Read more</Button.Label>
                      <Button.Icon>
                        <FontAwesomeIcon 
                          icon={faArrowRight} 
                          className="transition-transform group-hover/button:translate-x-0.5" 
                        />
                      </Button.Icon>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default GBLUseCases
export const getStaticProps = Util.getStaticPropsFolders(['use-cases'])
