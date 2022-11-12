import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import PageWithHeader from '../components/PageWithHeader'

function KnowledgeBase() {
  return (
    <PageWithHeader title="Knowledge Base" withFooter={false}>
      <TitleBackground>
        <Title title="Knowledge Base" />
      </TitleBackground>

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
