import { faBarChart, faLanguage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { H1, H2, H3, Modal, Prose, Tag } from '@uzh-bf/design-system'
import { MDXRemote } from 'next-mdx-remote'
import Image from 'next/image'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import RadarChart from '../../components/charts/RadarChart'
import Card from '../../components/common/Card'

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
              <H1 className={{ root: 'max-w-7xl mx-auto md:pl-4' }}>
                {frontMatter.title}
              </H1>
            </TitleImage>
          )}

          <Content className="max-w-7xl">
            <div className="flex flex-col items-start gap-4 md:gap-8 md:flex-row">
              <div className="flex-1 pb-4 md:pb-0 md:pr-8">
                <H2>{frontMatter.subtitle}</H2>
                {frontMatter.keywords && (
                  <div className="flex flex-row gap-4 mt-2">
                    <div className="flex flex-row flex-wrap justify-start gap-1">
                      {frontMatter.language?.map((item: any) => (
                        <Tag
                          key={item}
                          label={
                            <div className="flex flex-row items-center gap-2 text-base">
                              <FontAwesomeIcon icon={faLanguage} />
                              {item}
                            </div>
                          }
                        />
                      ))}

                      {frontMatter.keywords.map((item: any) => (
                        <Tag
                          key={item}
                          label={item}
                          className={{ root: 'text-base' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <Prose className={{ root: 'max-w-none mt-4' }}>
                  <MDXRemote {...source} components={components} />
                </Prose>
              </div>

              <div className="flex flex-col flex-1 gap-4 md:p-4 md:pt-2 md:border rounded md:flex-none md:w-[400px]">
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
                  <H3>Imprint</H3>
                  <ReactMarkdown className="prose-sm prose text-left">
                    {frontMatter.imprint}
                  </ReactMarkdown>
                </div>

                <div>
                  <H3>Contact</H3>
                  <ReactMarkdown className="prose-sm prose text-left">
                    {frontMatter.contact}
                  </ReactMarkdown>
                </div>

                {frontMatter.resources && (
                  <div>
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
            <div>
              {radarChartTexts?.[0] && (
                <div className="flex-1 p-4 pt-2 mt-8 border rounded">
                  <H3>Characteristics</H3>
                  <div className="lg:flex lg:flex-row">
                    <Prose className={{ root: 'flex-1 max-w-none' }}>
                      {radarChartTexts[0]}
                    </Prose>
                    <div className="flex-initial w-96">
                      <RadarChart data={radarChartData[0]} />
                    </div>
                  </div>
                </div>
              )}

              {radarChartTexts?.[1] && (
                <div className="flex-1 p-4 pt-2 mt-4 border rounded">
                  <H3>Gamification Elements</H3>
                  <div className="lg:flex lg:flex-row">
                    <Prose className={{ root: 'flex-1 max-w-none' }}>
                      {radarChartTexts[1]}
                    </Prose>
                    <div className="flex-initial w-96">
                      <RadarChart data={radarChartData[1]} />
                    </div>
                  </div>
                </div>
              )}

              {frontMatter.gallery && (
                <div className="flex-1 mt-8">
                  <H3>Gallery</H3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {frontMatter.gallery?.map((image: any) => (
                      <Card
                        colored
                        name={image.name}
                        key={image.imgSrc}
                        imgSrc={image.imgSrc}
                        onClick={() => {
                          setZoomedImage(image)
                          setZoom(true)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {frontMatter.useCases && (
                <div className="mt-8">
                  <H3>Use Cases</H3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {frontMatter.useCases.map((item: any) => (
                      <Card key={item} name={item} imgSrc={''} />
                    ))}
                  </div>
                </div>
              )}
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
          <div className="relative w-full h-full">
            <Image
              src={zoomedImage.imgSrc}
              alt="Magnified Image"
              fill
              className="object-contain"
            />
          </div>
        </Modal>
      )}
    </>
  )
}

export const getStaticProps = Util.getStaticProps('games')
export const getStaticPaths = Util.getStaticPaths('games')

export default Game
