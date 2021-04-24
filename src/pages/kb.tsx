import PageWithHeader from '../components/PageWithHeader'

function KnowledgeBase() {
  return (
    <PageWithHeader title="Knowledge Base">
      <h1 className="mb-1 text-xl md:text-3xl md:mb-2">Knowledge Base</h1>

      <img
        className="w-auto h-[500px] border"
        alt="Knowledge Graph"
        src="/images/knowledge_base.png"
      />
    </PageWithHeader>
  )
}

export default KnowledgeBase
