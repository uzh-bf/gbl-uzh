import { faBarChart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { H1, H2, H3, Modal, Prose, Tag } from '@uzh-bf/design-system'
import { MDXRemote } from 'next-mdx-remote'
import Image from 'next/image'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import RadarChart from '../../components/charts/RadarChart'

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
  const radarChartData = frontMatter.radarCharts?.map((singleChart: any) => {
    const temp = singleChart.content.map((item: any) => ({
      subject: item.name,
      value: +item.value,
    }))
    return temp
  })

  const radarChartTexts = frontMatter.radarCharts?.map(
    (singleChart: any) => singleChart.text
  )

  const [zoom, setZoom] = useState(false)
  const [zoomedImage, setZoomedImage] = useState({
    imgSrc: 'images/hero.jpg',
    alt: 'demo image',
  })

  function previousImage() {
    setZoomedImage(
      frontMatter.gallery[frontMatter.gallery.indexOf(zoomedImage) - 1]
    )
  }

  function nextImage() {
    setZoomedImage(
      frontMatter.gallery[frontMatter.gallery.indexOf(zoomedImage) + 1]
    )
  }

  return (
    <>
      <div className="absolute w-screen">
        <PageWithHeader title={frontMatter.title}>
          {frontMatter.thumbnail && (
            <TitleImage imgSrc={frontMatter.thumbnail}>
              <H1 className={{ root: 'max-w-6xl mx-auto' }}>
                {frontMatter.title}
              </H1>
            </TitleImage>
          )}

          <Content>
            <H2>{frontMatter.subtitle}</H2>
            <div className="flex flex-col items-start md:flex-row">
              <div className="flex-1 pb-4 md:pb-0 md:pr-8">
                <Prose className={{ root: 'max-w-none' }}>
                  <MDXRemote {...source} components={components} />
                </Prose>

                <div>
                  {radarChartTexts?.[0] && (
                    <div className="flex-1 mt-8">
                      <H3>Characteristics</H3>
                      <div className="inline lg:flex lg:flex-row">
                        <Prose className={{ root: 'flex-1' }}>
                          {radarChartTexts[0]}
                        </Prose>
                        <div className="flex-1 mt-3 mb-6 lg:mt-0">
                          <RadarChart data={radarChartData[0]} />
                        </div>
                      </div>
                    </div>
                  )}

                  {radarChartTexts?.[1] && (
                    <div className="flex-1 mt-4">
                      <H3>Gamification Elements</H3>
                      <div className="inline lg:flex lg:flex-row">
                        <p className="flex-1 prose-sm prose">
                          {radarChartTexts[1]}
                        </p>
                        <div className="flex-1 mt-3 mb-6 lg:mt-0">
                          <RadarChart data={radarChartData[1]} />
                        </div>
                      </div>
                    </div>
                  )}

                  {frontMatter.gallery && (
                    <div className="justify-center flex-1 mt-8">
                      <H3>Gallery</H3>
                      <div className="container grid grid-cols-3 gap-2 mx-auto sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
                        {frontMatter.gallery?.map((image: any) => (
                          <div
                            className="m-auto rounded hover:opacity-70"
                            key={frontMatter.gallery.indexOf(image)}
                          >
                            <div
                              className="inline-block bg-center bg-cover rounded shadow-md cursor-[zoom-in] w-[28vw] h-[28vw] sm:w-28 sm:h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:h-36"
                              style={{
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
                  )}
                  {frontMatter.resources && (
                    <div className="flex-1 mt-8">
                      <H3>Resources</H3>
                      <div className="inline md:flex md:flex-row">
                        <ul>
                          {frontMatter.resources.map((item: any) => (
                            <li key={item.name}>
                              <a
                                className="flex flex-row items-center hover:text-uzh-red-100"
                                target="_blank"
                                href={item.href}
                                rel="noreferrer"
                              >
                                <FontAwesomeIcon
                                  icon={faBarChart}
                                  className="h-4 mr-1"
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 border rounded md:flex-initial md:w-96 md:max-w-[33%] lg:max-w-full">
                <div>
                  <H3>Learning Objectives</H3>
                  <Prose>
                    <ul>
                      {frontMatter.objectives?.map((item: any) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </Prose>
                </div>

                <div>
                  <H3>Keywords</H3>
                  <div className="flex flex-row flex-wrap justify-center gap-1 md:justify-start">
                    {frontMatter.keywords?.map((item: any) => (
                      <Tag key={item} label={item} />
                    ))}
                  </div>
                </div>

                <div>
                  <H3>Languages</H3>
                  <div className="flex flex-row flex-wrap justify-center gap-1 md:justify-start">
                    {frontMatter.language?.map((item: any) => (
                      <Tag key={item} label={item} />
                    ))}
                  </div>
                </div>

                <div>
                  <H3>Imprint</H3>
                  <ReactMarkdown className="prose-sm prose text-center md:text-left">
                    {frontMatter.imprint}
                  </ReactMarkdown>
                </div>

                <div>
                  <H3>Contact</H3>
                  <ReactMarkdown className="prose-sm prose text-center md:text-left">
                    {frontMatter.contact}
                  </ReactMarkdown>
                </div>

                {frontMatter['usedIn'] && (
                  <div>
                    <H3>Used In</H3>
                    <ul>
                      {frontMatter['usedIn'].map((course: any) => (
                        <li key={course.name}>
                          <p className="prose-sm prose text-center md:text-left">
                            {course.name}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Content>
        </PageWithHeader>
      </div>

      {frontMatter.gallery && (
        <Modal
          open={zoom}
          onClose={() => setZoom(false)}
          onNext={
            frontMatter.gallery.indexOf(zoomedImage) <
            frontMatter.gallery.length - 1
              ? nextImage
              : undefined
          }
          onPrev={
            frontMatter.gallery.indexOf(zoomedImage) > 0
              ? previousImage
              : undefined
          }
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="relative w-full h-full max-h-[15rem]">
              <Image
                src={zoomedImage.imgSrc}
                alt="Magnified Image"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export const getStaticProps = Util.getStaticProps('games')
export const getStaticPaths = Util.getStaticPaths('games')

export default Game
