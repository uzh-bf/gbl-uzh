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
          src={
            process.env.NODE_ENV === 'development'
              ? `http://localhost:8080/${router.query.initialPath || 'index'}`
              : `https://www.gbl.uzh.ch/quartz/${
                  router.query.initialPath || 'index'
                }`
          }
          title="Game-Based Learning"
          height="100%"
          width="100%"
        />
      </div>
    </PageWithHeader>
  )
}

export default KnowledgeBase
