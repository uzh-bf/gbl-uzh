import hydrate from 'next-mdx-remote/hydrate'
import RadarChart from '../../components/charts/RadarChart'
import Header from '../../components/common/Header'
import PageWithHeader from '../../components/PageWithHeader'
import * as Util from '../../lib/util'

interface Props {
  source: any
  frontMatter: any
}

const components = {}

function Game({ source, frontMatter }: Props) {
  const content = hydrate(source, { components })

  return (
    <PageWithHeader title={frontMatter.title}>
      <img className="rounded" src={frontMatter.thumbnail} alt="thumbnail" />

      <div className="flex flex-col pt-4 md:flex-row">
        <div className="flex-1 pb-4 md:pb-0 md:pr-4">
          <Header.H1>{frontMatter.title}</Header.H1>
          <Header.H2 className="mb-2 md:mb-4">{frontMatter.subtitle}</Header.H2>
          <p className="prose">{content}</p>
        </div>
        <div className="flex-1 p-4 border rounded md:flex-initial md:w-96">
          <div>
            <Header.H3>Competencies</Header.H3>
            <div className="flex flex-row">
              <RadarChart width={150} height={150} />
              <RadarChart width={150} height={150} />
            </div>
          </div>

          <div className="mt-2">
            <Header.H3>Learning Objectives</Header.H3>
            <p className="prose-sm prose">
              <ul>
                {frontMatter.objectives.map((item) => (
                  <li>{item}</li>
                ))}
              </ul>
            </p>
          </div>

          <div className="mt-2">
            <Header.H3>Keywords</Header.H3>
            <p className="prose-sm prose">
              <ul>
                {frontMatter.keywords.map((item) => (
                  <li>{item}</li>
                ))}
              </ul>
            </p>
          </div>

          <div className="mt-2">
            <Header.H3>Languages</Header.H3>
            <p className="prose-sm prose">
              <ul>
                {frontMatter.language.map((item) => (
                  <li>{item}</li>
                ))}
              </ul>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-4 md:flex-row">
        <div className="flex-1 p-4 border rounded">
          <Header.H3>Imprint</Header.H3>
          <p className="prose-sm prose">{frontMatter.imprint}</p>
        </div>
        <div className="flex-1 p-4 mt-4 border rounded md:mt-0 md:ml-4">
          <Header.H3>Contact</Header.H3>
          <p className="prose-sm prose">{frontMatter.contact}</p>
        </div>
      </div>
    </PageWithHeader>
  )
}

export const getStaticProps = Util.getStaticProps('games')
export const getStaticPaths = Util.getStaticPaths('games')

export default Game
