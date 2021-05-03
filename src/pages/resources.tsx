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

      <div className="max-w-6xl p-4 m-auto">
        <Header.H2>Videos</Header.H2>
        <Header.H2>Workshop Materials</Header.H2>
        <Header.H2>Development Toolbox</Header.H2>
        <Header.H3>Simulation Platform</Header.H3>
        <Header.H3>Development Tooling</Header.H3>
        <Header.H2>Literature</Header.H2>
      </div>
    </PageWithHeader>
  )
}

export default Resources
