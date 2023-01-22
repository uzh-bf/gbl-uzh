import { H1 } from '@uzh-bf/design-system'
import TitleBackground from '../components/common/TitleBackground'
import PageWithHeader from '../components/PageWithHeader'

function KnowledgeBase() {
  return (
    <PageWithHeader
      className="overflow-hidden"
      title="Knowledge Base"
      withFooter={false}
    >
      <TitleBackground>
        <H1 className={{ root: 'max-w-6xl mx-auto' }}>Knowledge Base</H1>
      </TitleBackground>

      <div className="h-full max-h-[calc(100vh-10rem)]">
        <iframe
          src="https://www.gbl.uzh.ch/md/"
          title="Game-Based Learning"
          height="100%"
          width="100%"
        />
      </div>
    </PageWithHeader>
  )
}

export default KnowledgeBase
