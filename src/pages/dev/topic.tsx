import Header from '../../components/common/Header'
import PageWithHeader from '../../components/PageWithHeader'

function GameConcept() {
  return (
    <PageWithHeader title="Development Workflow">
      <Header.H1>Development Workflow - Game Topic</Header.H1>
      <div className="flex flex-col md:flex-row">
        <div className="flex-initial w-full h-64 md:w-1/3 md:h-52">
          <iframe
            width="100%"
            height="100%"
            src="https://tube.switch.ch/embed/2f78e8bf"
            frameBorder="0"
            allow="fullscreen"
            allowFullScreen
          />
        </div>
        <div className="flex-1 mt-4 md:mt-0 md:px-4">
          <Header.H2>Workflow</Header.H2>
          <Header.H2>Summary</Header.H2>
        </div>
      </div>
      <div className="py-4">
        <Header.H2 className="border-b">Conceptualize Game Ideas</Header.H2>
        <div className="flex flex-col py-2 md:flex-row">
          <div className="flex-1">...</div>
          <div className="flex-initial pl-4 border-l w-60">...</div>
        </div>
        <Header.H2 className="mt-4 border-b">Evaluate Game Ideas</Header.H2>
        <div className="flex flex-col py-2 md:flex-row">
          <div className="flex-1">...</div>
          <div className="flex-initial pl-4 border-l w-60">...</div>
        </div>
      </div>
    </PageWithHeader>
  )
}

export default GameConcept
