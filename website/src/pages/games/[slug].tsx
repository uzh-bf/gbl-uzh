import { MDXRemote } from 'next-mdx-remote'
import ReactMarkdown from 'react-markdown'
import RadarChart from '../../components/charts/RadarChart'
import Header from '../../components/common/Header'
import Tag from '../../components/common/Tag'
import Title from '../../components/common/Title'
import TitleImage from '../../components/common/TitleImage'
import Content from '../../components/Content'
import PageWithHeader from '../../components/PageWithHeader'
import * as Util from '../../lib/util'

interface Props {
  source: any
  frontMatter: any
}

const components = {}

function Game({ source, frontMatter }: Props) {
  const radarChartData = frontMatter.radarCharts.map((singleChart: any) => {
    const temp = singleChart.content.map((item: any) => ({
      subject: item.name,
      value: item.value,
    }))
    return temp
  })

  return (
    <PageWithHeader title={frontMatter.title}>
      <TitleImage imgSrc={frontMatter.thumbnail}>
        <Title title={frontMatter.title} />
      </TitleImage>

      <Content>
        <Header.H2 className="mb-2 md:mb-4">{frontMatter.subtitle}</Header.H2>
        <div className="flex flex-col items-start md:flex-row">
          <div className="flex-1 pb-4 md:pb-0 md:pr-8">
            <p className="prose max-w-none">
              <MDXRemote {...source} components={components} />
            </p>

            <div>
              <div className="flex-1 mt-8">
                <Header.H3>Characteristics</Header.H3>
                <div className="flex flex-row">
                  <p className="flex-1 prose-sm prose">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Ipsum blanditiis corrupti porro tempore necessitatibus
                    dolorem dolor, animi nihil nam pariatur libero quos commodi
                    iste ipsa quae adipisci qui suscipit. Sint?
                  </p>
                  <div className="flex-1">
                    <RadarChart data={radarChartData[0]} />
                  </div>
                </div>
              </div>

              <div className="flex-1 mt-4">
                <Header.H3>Gamification Elements</Header.H3>
                <div className="flex flex-row">
                  <p className="flex-1 prose-sm prose">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Illum sint consequuntur, id ducimus eius aperiam dicta
                    sapiente, error et obcaecati temporibus soluta molestias
                    placeat. Ad quisquam impedit beatae libero quam!
                  </p>
                  <div className="flex-1">
                    <RadarChart data={radarChartData[1]} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 border rounded md:flex-initial md:w-96 bg-uzh-gray-20">
            <Header.H3 className="!text-gray-600">
              Learning Objectives
            </Header.H3>
            <p className="prose-sm prose">
              <ul>
                {frontMatter.objectives.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </p>

            <Header.H3 className="mt-6 !text-gray-600">Keywords</Header.H3>
            <div className="flex flex-row flex-wrap">
              {frontMatter.keywords.map((item) => (
                <Tag key={item} label={item} className="mb-2" />
              ))}
            </div>

            <Header.H3 className="mt-6 !text-gray-600">Languages</Header.H3>
            <div className="flex flex-row flex-wrap">
              {frontMatter.language.map((item) => (
                <Tag key={item} label={item} className="mb-1" />
              ))}
            </div>

            <Header.H3 className="mt-6 !text-gray-600">Imprint</Header.H3>
            <p className="prose-sm prose">
              <ReactMarkdown>{frontMatter.imprint}</ReactMarkdown>
            </p>

            <Header.H3 className="mt-6 !text-gray-600">Contact</Header.H3>
            <p className="prose-sm prose">
              <ReactMarkdown>{frontMatter.contact}</ReactMarkdown>
            </p>

            {frontMatter['usedIn'] && (
              <div>
                <Header.H3 className="mt-6 !text-gray-600">Used In</Header.H3>
                <ul className="prose-sm prose">
                  {frontMatter['usedIn'].map((course) => (
                    <li key={course.name}>{course.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Content>
    </PageWithHeader>
  )
}

export const getStaticProps = Util.getStaticProps('games')
export const getStaticPaths = Util.getStaticPaths('games')

export default Game
