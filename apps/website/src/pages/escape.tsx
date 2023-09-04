import { H1 } from '@uzh-bf/design-system'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'
import TitleBackground from '../components/common/TitleBackground'

function EscapeUZH() {
  return (
    <PageWithHeader title="About Us">
      <TitleBackground>
        <H1 className={{ root: 'max-w-6xl mx-auto lg:pl-4' }}>Escape @ UZH</H1>
      </TitleBackground>

      <Content>escape.uzh.ch</Content>
    </PageWithHeader>
  )
}

export default EscapeUZH
