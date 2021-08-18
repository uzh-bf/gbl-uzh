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
  const radarChartTexts = frontMatter.radarCharts.map(
    (singleChart: any) => singleChart.text
  )

  return (
    <PageWithHeader title={frontMatter.title}>
      <TitleImage imgSrc={frontMatter.thumbnail}>
        <Title title={frontMatter.title} />
      </TitleImage>

      <Content>
        <Header.H2 className="mb-2 md:mb-4" align="left">
          {frontMatter.subtitle}
        </Header.H2>
        <div className="flex flex-col items-start md:flex-row">
          <div className="flex-1 pb-4 md:pb-0 md:pr-8">
            <p className="prose max-w-none">
              <MDXRemote {...source} components={components} />
            </p>

            <div>
              <div className="flex-1 mt-8">
                <Header.H3>Characteristics</Header.H3>
                <div className="inline md:flex md:flex-row">
                  <p className="flex-1 prose-sm prose">{radarChartTexts[0]}</p>
                  <div className="mt-4 mb-6 flex-1 md:mt-0">
                    <RadarChart data={radarChartData[0]} />
                  </div>
                </div>
              </div>

              <div className="flex-1 mt-4">
                <Header.H3>Gamification Elements</Header.H3>
                <div className="inline md:flex md:flex-row">
                  <p className="flex-1 prose-sm prose">{radarChartTexts[1]}</p>
                  <div className="mt-4 mb-6 flex-1 md:mt-0">
                    <RadarChart data={radarChartData[1]} />
                  </div>
                </div>
              </div>

              {frontMatter.gallery !== '' ? (
                <div className="flex-1 mt-4 justify-center">
                  <Header.H3>Gallery</Header.H3>
                  <div className="container grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mx-auto">
                    {frontMatter.gallery.map((image: any) => (
                      <div className="rounded m-auto hover:opacity-70">
                        <img
                          className="rounded shadow-md"
                          src={image.imgSrc}
                          alt={image.alt}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 border rounded md:flex-initial md:w-96 bg-uzh-gray-20">
            <Header.H3 className="!text-gray-600">
              Learning Objectives
            </Header.H3>
            <p className="prose-sm prose">
              <ul>
                {frontMatter.objectives.map((item: any) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </p>

            <Header.H3 className="mt-6 !text-gray-600">Keywords</Header.H3>
            <div className="flex flex-row flex-wrap justify-center md:justify-start">
              {frontMatter.keywords.map((item: any) => (
                <Tag key={item} label={item} className="mb-2" />
              ))}
            </div>

            <Header.H3 className="mt-6 !text-gray-600">Languages</Header.H3>
            <div className="flex flex-row flex-wrap justify-center md:justify-start">
              {frontMatter.language.map((item: any) => (
                <Tag key={item} label={item} className="mb-1" />
              ))}
            </div>

            <Header.H3 className="mt-6 !text-gray-600">Imprint</Header.H3>
            <ReactMarkdown className="prose-sm prose text-center md:text-left">
              {frontMatter.imprint}
            </ReactMarkdown>

            <Header.H3 className="mt-6 !text-gray-600">Contact</Header.H3>
            <ReactMarkdown className="prose-sm prose text-center md:text-left">
              {frontMatter.contact}
            </ReactMarkdown>

            {frontMatter['usedIn'] && (
              <>
                <Header.H3 className="mt-6 !text-gray-600">Used In</Header.H3>
                <ul>
                  {frontMatter['usedIn'].map((course: any) => (
                    <li key={course.name}>
                      <p className="prose-sm prose text-center md:text-left">
                        {course.name}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
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
