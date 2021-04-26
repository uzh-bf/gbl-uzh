import Button from '../components/Button'
import PageWithHeader from '../components/PageWithHeader'

function KnowledgeBase() {
  return (
    <PageWithHeader title="Knowledge Base">
      <h1 className="mb-1 text-xl md:text-3xl md:mb-2">Knowledge Base</h1>

      <img
        className="w-auto h-[500px] border mb-2 md:mb-4"
        alt="Knowledge Graph"
        src="/images/knowledge_base.png"
      />

      <Button
        onClick={() =>
          window.location.replace(
            'https://hypernotes.zenkit.com/c/5bSlQ32jUN/notes?v=trbPByPXAP'
          )
        }
      >
        Open Knowledge Base
      </Button>
    </PageWithHeader>
  )
}

export default KnowledgeBase
