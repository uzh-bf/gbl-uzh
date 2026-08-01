import {
  faChalkboardTeacher,
  faChartLine,
  faGamepad,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { H1, Prose } from '@uzh-bf/design-system'
import { MDXRemote } from 'next-mdx-remote'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { twMerge } from 'tailwind-merge'
import TitleBackground from '../../components/common/TitleBackground'

import Content from '../../components/Content'
import PageWithHeader from '../../components/PageWithHeader'
import * as Util from '../../lib/util'

interface Props {
  useCaseData: {
    source: any
  }
  overviewData: {
    sourceArr: any[]
  }
}

const components = {}

function UseCase({
  useCaseData: { source },
  overviewData: { sourceArr },
}: Props) {
  const router = useRouter()

  return (
    <>
      <div>
        <PageWithHeader title={source.frontmatter.title}>
          <TitleBackground>
            <H1 className={{ root: 'mx-auto max-w-6xl md:pl-4' }}>Use Cases</H1>
          </TitleBackground>

          <Content>
            <div className="flex flex-row gap-8">
              <div className="hidden w-80 flex-initial md:block">
                {['didactics', 'development', 'simulations'].map((type) => {
                  const useCases = sourceArr[0].filter(
                    ({ frontmatter }: any) => frontmatter.type === type
                  )
                  if (useCases.length === 0) return null

                  const icon =
                    type === 'didactics'
                      ? faChalkboardTeacher
                      : type === 'development'
                        ? faGamepad
                        : faChartLine

                  return (
                    <div key={type} className="mb-6 last:mb-0">
                      <div className="mb-2 flex items-center gap-2 rounded bg-slate-100 px-3 py-2">
                        <FontAwesomeIcon
                          icon={icon}
                          className="h-4 w-4 text-slate-600"
                        />
                        <h3 className="font-bold text-slate-700 capitalize">
                          {type === 'development' ? 'Game Development' : type}
                        </h3>
                      </div>
                      <ul className="text-sm">
                        {useCases.map(({ frontmatter }: any) => (
                          <Link
                            className="block"
                            key={frontmatter.slug}
                            href={`/use-cases/${frontmatter.slug}`}
                          >
                            <li
                              className={twMerge(
                                'relative border-b py-3 pl-3 transition-all duration-150',
                                'hover:bg-slate-50',
                                router.query.slug === frontmatter.slug && [
                                  'font-medium text-orange-600',
                                  'before:absolute before:top-0 before:left-0 before:h-full before:w-0.5 before:bg-orange-600',
                                ]
                              )}
                            >
                              {frontmatter.title}
                            </li>
                          </Link>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
              <div className="flex-1">
                <H1 className={{ root: 'mb-8' }}>{source.frontmatter.title}</H1>
                <Prose
                  className={{
                    root: 'prose-headings:mb-[0.5em] prose-headings:font-sans prose-h2:text-xl max-w-none',
                  }}
                >
                  <MDXRemote {...source} components={components} />
                </Prose>
              </div>
            </div>
          </Content>
        </PageWithHeader>
      </div>
    </>
  )
}

export const getStaticProps = async (pageProps: any) => {
  const overviewData = await Util.getStaticPropsFolders(['use-cases'])()
  const useCaseData = await Util.getStaticProps('use-cases')(pageProps)
  return {
    props: {
      useCaseData: useCaseData.props,
      overviewData: overviewData.props,
    },
  }
}
export const getStaticPaths = Util.getStaticPaths('use-cases')

export default UseCase
