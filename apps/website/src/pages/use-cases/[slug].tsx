import { H1, H2, Prose } from '@uzh-bf/design-system'
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
            <H1 className={{ root: 'mx-auto max-w-6xl md:pl-4' }}>
              {source.frontmatter.title}
            </H1>
          </TitleBackground>

          <Content>
            <div className="flex flex-row gap-8">
              <div className="hidden w-80 flex-initial rounded border bg-slate-50 p-4 md:block">
                <H2>Use Cases</H2>
                <ul className="text-sm">
                  {sourceArr[0].map(({ frontmatter }: any) => (
                    <Link
                      className="block border-b py-1 last:border-b-0"
                      key={frontmatter.slug}
                      href={`/use-cases/${frontmatter.slug}`}
                    >
                      <li
                        className={twMerge(
                          'hover:cursor-pointer hover:text-orange-600',
                          router.query.slug === frontmatter.slug && 'font-bold'
                        )}
                      >
                        {frontmatter.title}
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
              <Prose
                className={{
                  root: 'max-w-none flex-1 prose-headings:mb-[0.5em] prose-headings:font-sans prose-h2:text-xl',
                }}
              >
                <MDXRemote {...source} components={components} />
              </Prose>
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
