import PageWithHeader from '../components/PageWithHeader'

function KnowledgeBase() {
  return (
    <PageWithHeader title="Knowledge Base">
      <iframe
        src="https://www.gbl.uzh.ch/md/"
        title="Game-Based Learning"
        height="100%"
        width="100%"
      />
    </PageWithHeader>
  )
}

export default KnowledgeBase
