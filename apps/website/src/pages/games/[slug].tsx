import { faBarChart, faLanguage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { H1, H2, H3, Modal, Prose, Tag } from '@uzh-bf/design-system'
import { MDXRemote } from 'next-mdx-remote'
import Image from 'next/image'
import { useRouter } from 'next/router'
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
}

const components = {}

function Game({ source }: Props) {
  const router = useRouter()

  const { frontmatter } = source

  const radarChartData = frontmatter.radarCharts?.map((singleChart: any) => {
    const temp = singleChart.content.map((item: any) => ({
      subject: item.name,
      value: +item.value,
    }))
    return temp
  })

  const radarChartTexts = frontmatter.radarCharts?.map(
    (singleChart: any) => singleChart.text
  )

  const [zoom, setZoom] = useState(false)
  const [zoomedImage, setZoomedImage] = useState({
    imgSrc: 'images/hero.jpg',
    alt: 'demo image',
  })

  function previousImage() {
    setZoomedImage(
      frontmatter.gallery[frontmatter.gallery.indexOf(zoomedImage) - 1]
    )
  }

  function nextImage() {
    setZoomedImage(
      frontmatter.gallery[frontmatter.gallery.indexOf(zoomedImage) + 1]
    )
  }

  return (
    <>
      <div>
        <PageWithHeader title={frontmatter.title}>
          {frontmatter.thumbnail && (
            <TitleImage imgSrc={frontmatter.thumbnail}>
              <H1 className={{ root: 'mx-auto max-w-7xl md:pl-4' }}>
                {frontmatter.title}
              </H1>
            </TitleImage>
          )}

          <Content className="max-w-7xl">
            <div className="flex flex-col items-start gap-4 md:flex-row md:gap-8">
              <div className="flex-1 pb-4 md:pb-0 md:pr-8">
                <H2>{frontmatter.subtitle}</H2>
                {frontmatter.keywords && (
                  <div className="mt-2 flex flex-row gap-4">
                    <div className="flex flex-row flex-wrap justify-start gap-1">
                      {frontmatter.language?.map((item: any) => (
                        <Tag
                          key={item}
                          label={
                            (
                              <div className="flex flex-row items-center gap-2 text-base">
                                <FontAwesomeIcon icon={faLanguage} />
                                {item}
                              </div>
                            ) as any
                          }
                        />
                      ))}

                      {frontmatter.keywords.map((item: any) => (
                        <Tag
                          key={item}
                          label={item}
                          className={{ root: 'text-base' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <Prose className={{ root: 'mt-4 max-w-none' }}>
                  <MDXRemote {...source} components={components} />
                </Prose>
              </div>

              <div className="flex flex-1 flex-col gap-4 rounded md:w-[400px] md:flex-none md:border md:p-4 md:pt-2">
                <div>
                  <H3>Learning Objectives</H3>
                  <Prose>
                    <ul>
                      {frontmatter.objectives?.map((item: any) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </Prose>
                </div>

                <div>
                  <H3>Imprint</H3>
                  {/* @ts-ignore */}
                  <ReactMarkdown className="prose prose-sm text-left">
                    {frontmatter.imprint}
                  </ReactMarkdown>
                </div>

                <div>
                  <H3>Contact</H3>
                  {/* @ts-ignore */}
                  <ReactMarkdown className="prose prose-sm text-left">
                    {frontmatter.contact}
                  </ReactMarkdown>
                </div>

                {frontmatter.resources && (
                  <div>
                    <H3>Resources</H3>
                    <div className="inline md:flex md:flex-row">
                      <ul>
                        {frontmatter.resources.map((item: any) => (
                          <li key={item.name}>
                            <a
                              className="flex flex-row items-center hover:text-uzh-red-100"
                              target="_blank"
                              href={item.href}
                              rel="noreferrer"
                            >
                              <FontAwesomeIcon
                                icon={faBarChart}
                                className="mr-1 h-4"
                              />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {frontmatter['usedIn'] && (
                  <div>
                    <H3>Used In</H3>
                    <ul>
                      {frontmatter['usedIn'].map((course: any) => (
                        <li key={course.name}>
                          <p className="prose prose-sm text-center md:text-left">
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
                <div className="mt-8 flex-1 rounded border p-4 pt-2">
                  <H3>Characteristics</H3>
                  <div className="lg:flex lg:flex-row">
                    <Prose className={{ root: 'max-w-none flex-1' }}>
                      {radarChartTexts[0]}
                    </Prose>
                    <div className="w-96 flex-initial">
                      <RadarChart data={radarChartData[0]} />
                    </div>
                  </div>
                </div>
              )}

              {radarChartTexts?.[1] && (
                <div className="mt-4 flex-1 rounded border p-4 pt-2">
                  <H3>Gamification Elements</H3>
                  <div className="lg:flex lg:flex-row">
                    <Prose className={{ root: 'max-w-none flex-1' }}>
                      {radarChartTexts[1]}
                    </Prose>
                    <div className="w-96 flex-initial">
                      <RadarChart data={radarChartData[1]} />
                    </div>
                  </div>
                </div>
              )}

              {frontmatter.useCases && (
                <div className="mt-8">
                  <H3>Use Cases</H3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {frontmatter.useCases.map((item: any) => (
                      <Card
                        key={item}
                        name={item.title}
                        imgSrc={item.imgSrc}
                        disabled={!item.href}
                        onClick={() => {
                          if (item.href) router.push(item.href)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {frontmatter.gallery && (
                <div className="mt-8 flex-1">
                  <H3>Gallery</H3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {frontmatter.gallery?.map((image: any) => (
                      <Card
                        colored
                        objectFit="contain"
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
            </div>
          </Content>
        </PageWithHeader>
      </div>

      {frontmatter.gallery && (
        <Modal
          open={zoom}
          onClose={() => setZoom(false)}
          onNext={
            frontmatter.gallery.indexOf(zoomedImage) <
            frontmatter.gallery.length - 1
              ? nextImage
              : undefined
          }
          onPrev={
            frontmatter.gallery.indexOf(zoomedImage) > 0
              ? previousImage
              : undefined
          }
        >
          <div className="relative h-full w-full">
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
