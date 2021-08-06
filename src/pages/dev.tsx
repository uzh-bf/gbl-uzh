import { CheckIcon, PresentationChartBarIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import Image from 'next/image'
import { useState } from 'react'
import WorkflowImage from '../../public/images/dev_workflow.png'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import VideoWithSummary from '../components/common/VideoWithSummary'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'

function Panel({
  title,
  videoSrc,
  duration,
  keyTakeaways,
  resources,
  isOpen,
  isCompleted,
  onNext,
  onPrevious,
  onActivate,
  children,
}) {
  return (
    <div className="mt-4">
      <button
        className="w-full p-4 border rounded bg-uzh-gray-20"
        onClick={onActivate}
      >
        <div className="flex flex-row items-center justify-between">
          <div>
            <Header.H2 className="flex-1 !mb-0">{title}</Header.H2>
            <div className="text-left text-gray-700">{duration}</div>
          </div>
          <div className="flex-initial w-6">{isCompleted && <CheckIcon />}</div>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border border-t-0">
          <VideoWithSummary
            title={title}
            videoSrc={videoSrc}
            keyTakeaways={keyTakeaways}
          >
            {children}
          </VideoWithSummary>

          {Array.isArray(resources) && (
            <div className={clsx('mt-4', videoSrc && 'pt-4 border-t')}>
              <div className="flex flex-col md:flex-row">
                <div className="flex-1">
                  <div className="font-bold">Resources</div>
                  <ul>
                    {resources.map((item) => (
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
                {/* <div className="flex-1 pt-4 md:pt-0 md:pl-6">
                <div className="font-bold">References</div>
                <ul>
                  <li>TBD References</li>
                </ul>
              </div> */}
                {/* <div className="flex-1">
                <div className="font-bold">Resources</div>
              </div> */}
              </div>
            </div>
          )}
          <div className="flex justify-between pt-4 mt-4 border-t">
            <div>
              {onPrevious && (
                <Button onClick={onPrevious}>
                  <Button.ArrowLeft />
                  Previous Module
                </Button>
              )}
            </div>
            <div>
              {onNext && (
                <Button onClick={onNext}>
                  <Button.Arrow />
                  Next Module
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

Panel.defaultProps = {
  isOpen: false,
  onNext: undefined,
  onPrevious: undefined,
  resources: undefined,
}

function DevelopmentWorkflow() {
  const [activePanel, setActivePanel] = useState(0)

  return (
    <PageWithHeader title="Game Development">
      <TitleBackground>
        <Title title="Game Development" />
      </TitleBackground>
      <Content>
        <Panel
          duration="10min"
          isOpen={activePanel === 0}
          isCompleted={activePanel > 0}
          title="Introduction to Digital Game-Based Learning"
          videoSrc="https://tube.switch.ch/embed/fZLlA3PQVf"
          keyTakeaways={[
            `Game-Based Learning is a growing field of interest with a
            potential of supporting teaching, improving learning, and making
            the entire learning process more engaging.`,
            `Simulations and serious games can be used for such educational
            purposes. Whereas simulations represent a simplified real life
            situation, serious games can be realistic but also seek to
            educate in a more entertaining manner.`,
            `Game-Based Learning works because content is learned and
            retained more easily due to improved engagement with the
            learning matter and because intrinsic motivation is fostered by
            the gamified approach.`,
          ]}
          resources={[
            {
              name: 'Slides (PDF)',
              href: '/assets/Introduction_to_DGBL.pdf',
            },
          ]}
          onNext={() => setActivePanel(1)}
          onActivate={() => setActivePanel(0)}
        >
          To get started with game development in the context of game-based
          learning, it is important to first understand the terminology, as well
          as its key effects. Our resources will help you understand if you
          should apply game-based learning to your use case and what results you
          can expect.
        </Panel>

        <Panel
          duration="5min"
          isOpen={activePanel === 1}
          isCompleted={activePanel > 1}
          title="Game Development Workflow"
          videoSrc="https://tube.switch.ch/embed/2wGzCrU0Vm"
          keyTakeaways={
            <Image src={WorkflowImage} alt="Game Development Workflow" />
          }
          resources={[
            {
              name: 'Slides (PDF)',
              href: '/assets/Game_Development_Workflow.pdf',
            },
          ]}
          onNext={() => setActivePanel(2)}
          onPrevious={() => setActivePanel(0)}
          onActivate={() => setActivePanel(1)}
        >
          Learn how you can proceed if you want to develop your own simulation
          or serious game. Use our resources as a support and for guidance in
          your own development.
        </Panel>

        <Panel
          duration="10min"
          isOpen={activePanel === 2}
          isCompleted={activePanel > 2}
          title="Game Topic"
          videoSrc="https://tube.switch.ch/embed/mnDicHBlUI"
          keyTakeaways={[
            `Evaluate first whether a learning game is a good fit for your problem,
            as other teaching methods can work better depending on your use case.`,
            `Involve potential users in the idea generation process to get a broader perspective.`,
            `Ensure that the knowledge level of the potential users and the learning goals of your game match well.`,
          ]}
          resources={[
            {
              name: 'Slides (PDF)',
              href: '/assets/Game_Topic.pdf',
            },
          ]}
          onNext={() => setActivePanel(3)}
          onPrevious={() => setActivePanel(1)}
          onActivate={() => setActivePanel(2)}
        >
          Before starting with the actual game development, it is necessary to
          evaluate which topics are suitable and useful for an implementation in
          the form of game-based learning. Game-based learning is a form of
          teaching and learning that can be particularly motivating and
          sustainable. However, it is recommended to conduct a cost-benefit
          analysis before making the actual development decision. The
          implementation of complex content in a playable form requires a
          considerable amount of resources in terms of content and technology.
        </Panel>

        <Panel
          duration="10min"
          isOpen={activePanel === 3}
          isCompleted={activePanel > 3}
          title="Game Development"
          videoSrc="https://tube.switch.ch/embed/DzvtvEspwp"
          keyTakeaways={[
            `Let potential users test your game regularly throughout the development process.
            Organize small testing sessions with a few participants to evaluate interactions.`,
            `Evaluate testing sessions with user-centered approaches to investigate the player workflow and potential usability issues.
            Investigate how players approach and reach their learning objectives during play.`,
            `Focus on your prioritized development goals and keep a wish list for further development.
            Ensure that what is built is of high quality and fits together well.`,
          ]}
          resources={[
            {
              name: 'Slides (PDF)',
              href: '/assets/Game_Development.pdf',
            },
          ]}
          onNext={() => setActivePanel(4)}
          onPrevious={() => setActivePanel(2)}
          onActivate={() => setActivePanel(3)}
        >
          After the decision to implement a particular game idea, the actual
          game development takes place. A loop-like approach involving the
          content and technical developers is recommended. Individual game
          elements should be tested and evaluated on an ongoing basis so that
          corrective measures can be taken promptly if necessary.
        </Panel>

        <Panel
          duration="15min"
          isOpen={activePanel === 4}
          isCompleted={activePanel > 4}
          title="Game Execution"
          videoSrc="https://tube.switch.ch/embed/9noiwL00Oi"
          keyTakeaways={[
            `Ensure that the students have the relevant theoretical background before they play the game
            (e.g., provide prerequisites, readings, or an introductory session).`,
            `Prepare a sound didactical concept that embes the game into your course or similar setting.`,
            `Provide regular feedback to the players so that they can continuously improve their knowledge throughout the game.`,
          ]}
          resources={[
            {
              name: 'Slides (PDF)',
              href: '/assets/Game_Execution.pdf',
            },
          ]}
          onNext={() => setActivePanel(5)}
          onPrevious={() => setActivePanel(3)}
          onActivate={() => setActivePanel(4)}
        >
          When a game (part) is ready to play, it should be implemented in a
          suitable learning setting. Necessary theories and teaching materials
          should be taught at appropriate points before, during or after the
          game itself. Whether in the virtual or physical classroom - a
          didactically sound embedding in the flow of the lesson is important
          for a sustainable learning success of the participants. In order to
          find a suitable game setting and to further develop the game (part),
          it is helpful to always ask for feedback and to regularly evaluate the
          game and the game setting.
        </Panel>

        <Panel
          isOpen={activePanel === 5}
          isCompleted={activePanel > 5}
          title="Further Resources and References"
          resources={[
            {
              name: 'Slides (PDF)',
              href: '/assets/Sources.pdf',
            },
          ]}
          onPrevious={() => setActivePanel(4)}
          onActivate={() => setActivePanel(5)}
        >
          Our workflow and best practices are based on the works of many
          practicioners and researchers. For an overview of our references, as
          well as further resources, we have prepared a short summary for you to
          look at.
        </Panel>
      </Content>
    </PageWithHeader>
  )
}

export default DevelopmentWorkflow
