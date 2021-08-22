import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PresentationChartBarIcon,
  XIcon,
} from '@heroicons/react/solid'
import clsx from 'clsx'
import { MDXRemote } from 'next-mdx-remote'
import { useState } from 'react'
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

  const [zoom, setZoom] = useState(false)
  const [zoomedImage, setZoomedImage] = useState({
    imgSrc: 'images/hero.jpg',
    alt: 'demo image',
  })

  function handlePropagationStop(e: any) {
    setZoomedImage(
      frontMatter.gallery[frontMatter.gallery.indexOf(zoomedImage) - 1]
    )
    const event = e || window.event
    event.stopPropagation()
  }

  return (
    <>
      <div className="absolute w-screen">
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
                    <div className="inline lg:flex lg:flex-row">
                      <p className="flex-1 prose-sm prose">
                        {radarChartTexts[0]}
                      </p>
                      <div className="mt-3 mb-6 flex-1 lg:mt-0">
                        <RadarChart data={radarChartData[0]} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 mt-4">
                    <Header.H3>Gamification Elements</Header.H3>
                    <div className="inline lg:flex lg:flex-row">
                      <p className="flex-1 prose-sm prose">
                        {radarChartTexts[1]}
                      </p>
                      <div className="mt-3 mb-6 flex-1 lg:mt-0">
                        <RadarChart data={radarChartData[1]} />
                      </div>
                    </div>
                  </div>

                  {frontMatter.gallery !== '' &&
                  frontMatter.gallery !== undefined ? (
                    <div className="flex-1 mt-8 justify-center">
                      <Header.H3>Gallery</Header.H3>
                      <div className="container grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 mx-auto">
                        {frontMatter.gallery.map((image: any) => (
                          <div
                            className="rounded m-auto hover:opacity-70"
                            key={frontMatter.gallery.indexOf(image)}
                          >
                            <div
                              className="inline-block bg-center bg-cover rounded shadow-md w-1/4vw h-1/4vw sm:w-28 sm:h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:h-36 lg:h-36"
                              style={{
                                cursor: 'zoom-in',
                                backgroundImage: 'url("' + image.imgSrc + '")',
                              }}
                              onClick={() => {
                                setZoomedImage(image)
                                setZoom(true)
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  {frontMatter.resources !== '' &&
                  frontMatter.resources !== undefined ? (
                    <div className="flex-1 mt-8">
                      <Header.H3>Resources</Header.H3>
                      <div className="inline md:flex md:flex-row">
                        <ul>
                          {frontMatter.resources.map((item: any) => (
                            <li key={item.name}>
                              <a
                                className="flex flex-row items-center hover:text-uzh-blue-100"
                                target="_blank"
                                href={item.href}
                                rel="noreferrer"
                              >
                                <PresentationChartBarIcon className="h-4 mr-1" />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 border rounded md:flex-initial md:w-96 bg-uzh-gray-20 md:max-w-1/3 lg:max-w-full">
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
                    <Header.H3 className="mt-6 !text-gray-600">
                      Used In
                    </Header.H3>
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
      </div>
      {zoom ? (
        <div
          className="bg-gray-900 bg-opacity-60 z-10 w-full h-full fixed"
          onClick={() => setZoom(false)}
        >
          <XIcon
            className="mt-2 mr-2 w-8 h-8 md:w-12 md:h-12 float-right hover:cursor-pointer"
            onClick={() => setZoom(false)}
          />
          <div className="absolute w-full top-1/2 left-1/2 -translate-x-2/4 -translate-y-2/4">
            <div className="flex justify-around items-stretch max-width-full">
              <div
                className={clsx(
                  frontMatter.gallery.indexOf(zoomedImage) == 0
                    ? 'invisible'
                    : '',
                  'relative hover:bg-white hover:bg-opacity-50 hover:cursor-pointer'
                )}
                style={{ flex: '0 0 50px', height: '60vh' }}
                onClick={handlePropagationStop}
              >
                <ChevronLeftIcon className="absolute top-1/2 -translate-y-2/4 w-16 -left-1 md:-left-2" />
              </div>
              <div className="w-4/5vw max-w-max mx-auto">
                <img
                  src={zoomedImage.imgSrc}
                  alt="Magnified Image"
                  style={{ cursor: 'zoom-out' }}
                  className="relative top-1/2 -translate-y-2/4"
                  onClick={() => setZoom(false)}
                />
              </div>
              <div
                className={clsx(
                  frontMatter.gallery.indexOf(zoomedImage) ==
                    frontMatter.gallery.length - 1
                    ? 'invisible'
                    : '',
                  'relative hover:bg-white hover:bg-opacity-50 hover:cursor-pointer'
                )}
                style={{ flex: '0 0 50px' }}
                onClick={() => {
                  setZoomedImage(
                    frontMatter.gallery[
                      frontMatter.gallery.indexOf(zoomedImage) + 1
                    ]
                  )
                }}
              >
                <ChevronRightIcon className="absolute top-1/2 -translate-y-2/4 w-16 -right-1 md:-right-2" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

export const getStaticProps = Util.getStaticProps('games')
export const getStaticPaths = Util.getStaticPaths('games')

export default Game
