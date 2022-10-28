import { twMerge } from 'tailwind-merge'
import { MDXRemote } from 'next-mdx-remote'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import RadarChart from '../../components/charts/RadarChart'
import Header from '../../components/common/Header'
import Tag from '../../components/common/Tag'
import Title from '../../components/common/Title'
import TitleImage from '../../components/common/TitleImage'
import Content from '../../components/Content'
import PageWithHeader from '../../components/PageWithHeader'
import * as Util from '../../lib/util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBarChart,
  faChevronLeft,
  faChevronRight,
  faX,
} from '@fortawesome/free-solid-svg-icons'
import { Button, Modal } from '@uzh-bf/design-system'
import Image from 'next/image'

interface Props {
  source: any
  frontMatter: any
}

const components = {}

function UseCase({ source, frontMatter }: Props) {
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
              <Title title={frontMatter.title} />
            </TitleImage>
          )}

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
                  {radarChartTexts?.[0] && (
                    <div className="flex-1 mt-8">
                      <Header.H3>Characteristics</Header.H3>
                      <div className="inline lg:flex lg:flex-row">
                        <p className="flex-1 prose-sm prose">
                          {radarChartTexts[0]}
                        </p>
                        <div className="flex-1 mt-3 mb-6 lg:mt-0">
                          <RadarChart data={radarChartData[0]} />
                        </div>
                      </div>
                    </div>
                  )}

                  {radarChartTexts?.[1] && (
                    <div className="flex-1 mt-4">
                      <Header.H3>Gamification Elements</Header.H3>
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
                      <Header.H3>Gallery</Header.H3>
                      <div className="container grid grid-cols-3 gap-2 mx-auto sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
                        {frontMatter.gallery?.map((image: any) => (
                          <div
                            className="m-auto rounded hover:opacity-70"
                            key={frontMatter.gallery.indexOf(image)}
                          >
                            <div
                              className="inline-block bg-center bg-cover rounded shadow-md cursor-[zoom-in] w-[28vw] h-[28vw] sm:w-28 sm:h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:h-36 lg:h-36"
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
                      <Header.H3>Resources</Header.H3>
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

              <div className="flex-1 p-4 border rounded md:flex-initial md:w-96 bg-uzh-grey-20 md:max-w-[33%] lg:max-w-full">
                <Header.H3 className="!text-gray-600">
                  Learning Objectives
                </Header.H3>
                <p className="prose-sm prose">
                  <ul>
                    {frontMatter.objectives?.map((item: any) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </p>

                <Header.H3 className="mt-6 !text-gray-600">Keywords</Header.H3>
                <div className="flex flex-row flex-wrap justify-center gap-1 md:justify-start">
                  {frontMatter.keywords?.map((item: any) => (
                    <Tag key={item} label={item} />
                  ))}
                </div>

                <Header.H3 className="mt-6 !text-gray-600">Languages</Header.H3>
                <div className="flex flex-row flex-wrap justify-center gap-1 md:justify-start">
                  {frontMatter.language?.map((item: any) => (
                    <Tag key={item} label={item} />
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
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export const getStaticProps = Util.getStaticProps('use-cases')
export const getStaticPaths = Util.getStaticPaths('use-cases')

export default UseCase
