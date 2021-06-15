import Image from 'next/image'
import { useRouter } from 'next/router'
import WorkflowImage from '../../public/images/dev_workflow.png'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'

function DevelopmentWorkflow() {
  const router = useRouter()

  return (
    <PageWithHeader title="Game Development">
      <TitleBackground>
        <Title title="Game Development" />
      </TitleBackground>
      <Content>
        <Header.H2 className="mt-4">
          Principles of Game-Based Learning
        </Header.H2>
        <p className="prose max-w-none">
          To get started with game development in the context of game-based
          learning, it is important to first understand the terminology, as well
          as its key effects. Our resources will help you understand if you
          should apply game-based learning to your use case and what results you
          can expect.
        </p>
        <Button className="mt-4" onClick={() => router.push('/dev/intro')}>
          <Button.Arrow />
          Details
        </Button>
        <Header.H2 className="mt-16">Game Development Workflow</Header.H2>
        <Image src={WorkflowImage} alt="Game Development Workflow" />
        <Header.H3 className="mt-8">Game Topic</Header.H3>
        <p className="prose max-w-none">
          Before starting with the actual game development, it is necessary to
          evaluate which topics are suitable and useful for an implementation in
          the form of game-based learning. Game-based learning is a form of
          teaching and learning that can be particularly motivating and
          sustainable. However, it is recommended to conduct a cost-benefit
          analysis before making the actual development decision. The
          implementation of complex content in a playable form requires a
          considerable amount of resources in terms of content and technology.
        </p>
        <Button disabled className="mt-4">
          <Button.Arrow />
          Coming Soon
        </Button>
        <Header.H3 className="mt-8">Game Development</Header.H3>
        <p className="prose max-w-none">
          After the decision to implement a particular game idea, the actual
          game development takes place. A loop-like approach involving the
          content and technical developers is recommended. Individual game
          elements should be tested and evaluated on an ongoing basis so that
          corrective measures can be taken promptly if necessary.
        </p>
        <Button disabled className="mt-4">
          <Button.Arrow />
          Coming Soon
        </Button>
        <Header.H3 className="mt-8">Game Execution</Header.H3>
        <p className="prose max-w-none">
          When a game (part) is ready to play, it should be implemented in a
          suitable learning setting. Necessary theories and teaching materials
          should be taught at appropriate points before, during or after the
          game itself. Whether in the virtual or physical classroom - a
          didactically sound embedding in the flow of the lesson is important
          for a sustainable learning success of the participants. In order to
          find a suitable game setting and to further develop the game (part),
          it is helpful to always ask for feedback and to regularly evaluate the
          game and the game setting.
        </p>
        <Button disabled className="mt-4">
          <Button.Arrow />
          Coming Soon
        </Button>
      </Content>
    </PageWithHeader>
  )
}

export default DevelopmentWorkflow
