import { H1, H2 } from '@uzh-bf/design-system'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'
import TitleBackground from '../components/common/TitleBackground'

function EscapeUZH() {
  return (
    <PageWithHeader title="EscapeUZH">
      <TitleBackground>
        <H1 className={{ root: 'max-w-6xl mx-auto lg:pl-4' }}>EscapeUZH</H1>
      </TitleBackground>

      <Content>
        <H2>hello world</H2>
        <H2>How To</H2>
        <div>hello world</div>
        <H2>Get Access</H2>
        <div className="flex flex-row gap-4">
          <div className="flex-1">hello worlddi</div>
          <iframe
            className="flex-1"
            width="640px"
            height="480px"
            src="https://forms.office.com/Pages/ResponsePage.aspx?id=2zjkx2LkIkypCsNYsWmAs3FqIECvYGdIv-SlumKwtF1URUIwNVI2SzIzVjlGWkEzNUZGN1BKWTNLSy4u&embed=true"
          />
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default EscapeUZH
