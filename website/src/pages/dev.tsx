import Image from 'next/image'
import { useState } from 'react'
import Panel from '../components/common/Panel'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'
import * as Util from '../lib/util'

const Modules = (
  frontMatterArr: any,
  activePanel: number,
  setActivePanel: any
) => {
  let output = new Array(frontMatterArr.length)
  frontMatterArr.forEach((module: any) => {
    const keyTakeaways = () => {
      if (module.keyTakeawayList) {
        return module.keyTakeawayList
      } else {
        return (
          <Image
            src={module.keyTakeawayImage.src}
            alt={module.title}
            width={module.keyTakeawayImage.width}
            height={module.keyTakeawayImage.height}
          />
        )
      }
    }

    if (module.order < 1) {
      output.splice(
        module.order,
        1,
        <Panel
          key={module.order}
          duration={module.duration}
          isOpen={activePanel === module.order}
          isCompleted={activePanel > module.order}
          title={module.title}
          videoSrc={module.videoSrc}
          keyTakeaways={keyTakeaways()}
          resources={module.resources.map((resource: any) => ({
            name: resource.name,
            href: resource.href,
          }))}
          onNext={() => setActivePanel(module.order + 1)}
          onActivate={() => setActivePanel(module.order)}
        >
          {module.description}
        </Panel>
      )
    } else if (module.order == frontMatterArr.length - 1) {
      output.splice(
        module.order,
        1,
        <Panel
          key={module.order}
          duration={module.duration}
          isOpen={activePanel === module.order}
          isCompleted={activePanel > module.order}
          title={module.title}
          videoSrc={module.videoSrc}
          keyTakeaways={keyTakeaways()}
          resources={module.resources.map((resource: any) => ({
            name: resource.name,
            href: resource.href,
          }))}
          onPrevious={() => setActivePanel(module.order - 1)}
          onActivate={() => setActivePanel(module.order)}
        >
          {module.description}
        </Panel>
      )
    } else {
      output.splice(
        module.order,
        1,
        <Panel
          key={module.order}
          duration={module.duration}
          isOpen={activePanel === module.order}
          isCompleted={activePanel > module.order}
          title={module.title}
          videoSrc={module.videoSrc}
          keyTakeaways={keyTakeaways()}
          resources={module.resources.map((resource: any) => ({
            name: resource.name,
            href: resource.href,
          }))}
          onNext={() => setActivePanel(module.order + 1)}
          onPrevious={() => setActivePanel(module.order - 1)}
          onActivate={() => setActivePanel(module.order)}
        >
          {module.description}
        </Panel>
      )
    }
  })
  return output
}

interface Props {
  sourceArr: any
  frontMatterArr: any
  filenames: any
  fileMissingArr: any
}
function DevelopmentWorkflow({
  sourceArr,
  frontMatterArr,
  filenames,
  fileMissingArr,
}: Props) {
  const [activePanel, setActivePanel] = useState(0)
  return (
    <PageWithHeader title="Game Development">
      <TitleBackground>
        <Title title="Game Development" />
      </TitleBackground>
      <Content>{Modules(frontMatterArr, activePanel, setActivePanel)}</Content>

      {/*
      <PageWithHeader title={frontMatter.title}><TitleBackground>
        <Title title={frontMatter.title} />
      </TitleBackground>
      <Content>
        {frontMatter.modules.map((module: any) => {
          const index = frontMatter.modules.indexOf(module)

          const keyTakeaways = () => {
            if (module.keyTakeawayList) {
              return module.keyTakeawayList
            } else {
              return (
                <Image
                  src={module.keyTakeawayImage.src}
                  alt={module.title}
                  width={module.keyTakeawayImage.width}
                  height={module.keyTakeawayImage.height}
                />
              )
            }
          }
          if (index < 1) {
            return (
              <Panel
                duration={module.duration}
                isOpen={activePanel === index}
                isCompleted={activePanel > index}
                title={module.title}
                videoSrc={module.videoSrc}
                keyTakeaways={keyTakeaways()}
                resources={module.resources.map((resource: any) => ({
                  name: resource.name,
                  href: resource.href,
                }))}
                onNext={() => setActivePanel(index + 1)}
                onActivate={() => setActivePanel(index)}
              >
                {module.description}
              </Panel>
            )
          } else if (index == frontMatter.modules.length - 1) {
            return (
              <Panel
                duration={module.duration}
                isOpen={activePanel === index}
                isCompleted={activePanel > index}
                title={module.title}
                videoSrc={module.videoSrc}
                keyTakeaways={keyTakeaways()}
                resources={module.resources.map((resource: any) => ({
                  name: resource.name,
                  href: resource.href,
                }))}
                onPrevious={() => setActivePanel(index - 1)}
                onActivate={() => setActivePanel(index)}
              >
                {module.description}
              </Panel>
            )
          } else {
            return (
              <Panel
                duration={module.duration}
                isOpen={activePanel === index}
                isCompleted={activePanel > index}
                title={module.title}
                videoSrc={module.videoSrc}
                keyTakeaways={keyTakeaways()}
                resources={module.resources.map((resource: any) => ({
                  name: resource.name,
                  href: resource.href,
                }))}
                onNext={() => setActivePanel(index + 1)}
                onPrevious={() => setActivePanel(index - 1)}
                onActivate={() => setActivePanel(index)}
              >
                {module.description}
              </Panel>
            )
          }
        })}
      </Content>*/}
    </PageWithHeader>
  )
}

export default DevelopmentWorkflow
/*export const getStaticProps = Util.getStaticPropsSinglePage(
  'resources',
  'Development'
)*/
export const getStaticProps = Util.getStaticPropsFolder('development')
