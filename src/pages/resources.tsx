import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import PageWithHeader from '../components/PageWithHeader'

function Resources() {
  return (
    <PageWithHeader title="Resources">
      <TitleBackground>
        <Title title="Resources" />
      </TitleBackground>

      <div className="max-w-6xl py-8 m-auto">
        <Header.H2>Videos</Header.H2>

        <Header.H2>Workshop Materials</Header.H2>
        <div className="flex flex-row py-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <div className="ml-2">document</div>
        </div>

        <Header.H2>Development Toolbox</Header.H2>

        <Header.H3>Simulation Platform</Header.H3>

        <Header.H3>Development Tooling</Header.H3>

        <Header.H2>Literature</Header.H2>
      </div>
    </PageWithHeader>
  )
}

export default Resources
