import { H1, H2, H3 } from '@uzh-bf/design-system'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'
import TitleBackground from '../components/common/TitleBackground'

function Resources() {
  return (
    <PageWithHeader title="Resources">
      <TitleBackground>
        <H1 className={{ root: 'mx-auto max-w-6xl' }}>Resources</H1>{' '}
      </TitleBackground>

      <Content>
        <H2>Videos</H2>

        <H2>Workshop Materials</H2>
        <div className="flex flex-row py-2">
          <svg
            className="h-6 w-6"
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

        <H2>Development Toolbox</H2>

        <H3>Simulation Platform</H3>

        <H3>Development Tooling</H3>

        <H2>Literature</H2>
      </Content>
    </PageWithHeader>
  )
}

export default Resources
