import { useRouter } from 'next/router'
import PageWithHeader from '../components/PageWithHeader'

function KnowledgeBase() {
  const router = useRouter()

  return (
    <PageWithHeader
      className="overflow-hidden"
      title="Knowledge Base"
      withFooter={false}
    >
      <div className="h-full max-h-[calc(100vh-8rem)]">
        <iframe
          src={`https://www.gbl.uzh.ch/md/${router.query.initialPath || ''}`}
          title="Game-Based Learning"
          height="100%"
          width="100%"
        />
      </div>
    </PageWithHeader>
  )
}

export default KnowledgeBase
