import { push } from '@socialgouv/matomo-next'
import { H1 } from '@uzh-bf/design-system'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Panel from '../components/common/Panel'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'
import * as Util from '../lib/util'

interface Props {
  sourceArr: any
}
function DevelopmentWorkflow({ sourceArr }: Props) {
  const [activePanel, setActivePanel] = useState(0)

  useEffect(() => {
    push(['trackEvent', 'GBL Workflow', 'Panel Activated', activePanel])
  }, [activePanel])

  return (
    <PageWithHeader title="Game Development">
      <TitleBackground>
        <H1 className={{ root: 'max-w-6xl mx-auto lg:pl-4' }}>
          Game Development
        </H1>
      </TitleBackground>
      <Content>
        {sourceArr.map(({ frontmatter }: any, ix: number) => {
          const keyTakeaways = () => {
            if (frontmatter.keyTakeawayList) {
              return frontmatter.keyTakeawayList
            } else {
              return (
                <Image
                  // placeholder="blur"
                  src={frontmatter.keyTakeawayImage.src}
                  alt={frontmatter.title}
                  width={frontmatter.keyTakeawayImage.width}
                  height={frontmatter.keyTakeawayImage.height}
                />
              )
            }
          }

          if (ix < 1) {
            return (
              <Panel
                key={ix}
                duration={frontmatter.duration}
                isOpen={activePanel === ix}
                isCompleted={activePanel > ix}
                title={frontmatter.title}
                videoSrc={frontmatter.videoSrc}
                keyTakeaways={keyTakeaways()}
                resources={frontmatter.resources.map((resource: any) => ({
                  name: resource.name,
                  href: resource.href,
                }))}
                onNext={() => setActivePanel(ix + 1)}
                onActivate={() => setActivePanel(ix)}
              >
                {frontmatter.description}
              </Panel>
            )
          } else if (ix == sourceArr.length - 1) {
            return (
              <Panel
                key={ix}
                duration={frontmatter.duration}
                isOpen={activePanel === ix}
                isCompleted={activePanel > ix}
                title={frontmatter.title}
                videoSrc={frontmatter.videoSrc}
                keyTakeaways={keyTakeaways()}
                resources={frontmatter.resources.map((resource: any) => ({
                  name: resource.name,
                  href: resource.href,
                }))}
                onPrevious={() => setActivePanel(ix - 1)}
                onActivate={() => setActivePanel(ix)}
              >
                {frontmatter.description}
              </Panel>
            )
          } else {
            return (
              <Panel
                key={ix}
                duration={frontmatter.duration}
                isOpen={activePanel === ix}
                isCompleted={activePanel > ix}
                title={frontmatter.title}
                videoSrc={frontmatter.videoSrc}
                keyTakeaways={keyTakeaways()}
                resources={frontmatter.resources.map((resource: any) => ({
                  name: resource.name,
                  href: resource.href,
                }))}
                onNext={() => setActivePanel(ix + 1)}
                onPrevious={() => setActivePanel(ix - 1)}
                onActivate={() => setActivePanel(ix)}
              >
                {frontmatter.description}
              </Panel>
            )
          }
        })}
      </Content>
    </PageWithHeader>
  )
}

export default DevelopmentWorkflow
export const getStaticProps = Util.getStaticPropsFolder(
  'workflow',
  'resources',
  'GBL Toolbox'
)
