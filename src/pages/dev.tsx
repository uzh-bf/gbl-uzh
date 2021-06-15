import { useRouter } from 'next/router'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'

function DevelopmentWorkflow() {
  const router = useRouter()

  return (
    <PageWithHeader title="Game Development">
      <TitleBackground>
        <Title title="Game Development" />
      </TitleBackground>
      <Content>
        <Header.H2>Introduction</Header.H2>
        <p className="prose max-w-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis
          nostrum praesentium vitae reprehenderit incidunt libero. Fugit harum,
          aut repellendus impedit tempore cum iure, alias ipsam earum facere
          praesentium doloribus deserunt.
        </p>
        <Button className="mt-4" onClick={() => router.push('/dev/intro')}>
          <Button.Arrow />
          Details
        </Button>

        <Header.H2 className="mt-16">Game Topic</Header.H2>
        <p className="prose max-w-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis
          nostrum praesentium vitae reprehenderit incidunt libero. Fugit harum,
          aut repellendus impedit tempore cum iure, alias ipsam earum facere
          praesentium doloribus deserunt.
        </p>

        <Header.H2 className="mt-16">Game Development</Header.H2>
        <p className="prose max-w-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis
          nostrum praesentium vitae reprehenderit incidunt libero. Fugit harum,
          aut repellendus impedit tempore cum iure, alias ipsam earum facere
          praesentium doloribus deserunt.
        </p>

        <Header.H2 className="mt-16">Game Execution</Header.H2>
        <p className="prose max-w-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis
          nostrum praesentium vitae reprehenderit incidunt libero. Fugit harum,
          aut repellendus impedit tempore cum iure, alias ipsam earum facere
          praesentium doloribus deserunt.
        </p>
      </Content>
    </PageWithHeader>
  )
}

export default DevelopmentWorkflow
