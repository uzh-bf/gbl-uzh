import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from '../components/Button'
import PageWithHeader from '../components/PageWithHeader'

interface HomeSectionProps {
  title: string
  children: React.ReactNode
}

function HomeSection({ title, children }: HomeSectionProps) {
  return (
    <div className="mt-4 md:mt-8">
      <h1 className="mb-1 ml-2 text-xl md:text-2xl md:ml-4 md:mb-2">{title}</h1>
      <div className="p-2 rounded shadow md:rounded-lg md:p-4">{children}</div>
    </div>
  )
}

function Home() {
  const router = useRouter()

  return (
    <PageWithHeader title="Home">
      <Head>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js" />
      </Head>

      <img
        className="hidden md:block"
        width="1200"
        height="250"
        src="https://place-hold.it/1200x250/D3D3D3?text=HERO"
        alt=""
      />

      <HomeSection title="GBL Knowledge Base">
        <div className="flex flex-row mb-2 md:mb-4">
          <img
            className="w-32 border md:w-56"
            src="images/knowledge_base.png"
            alt="Knowledge Graph"
          />
          <p className="px-2 prose md:px-4">hello world</p>
        </div>

        <Button onClick={() => router.push('/kb')}>
          <Button.Arrow />
          Knowledge Base
        </Button>
      </HomeSection>

      <HomeSection title="GBL @ DBF">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 mb-4 md:mb-0">
            <h2 className="mb-1 text-lg md:text-xl">Games</h2>
            <div className="mb-2 md:mb-4">...</div>
            <Button onClick={() => router.push('/dbf')}>
              <Button.Arrow />
              Game Overview
            </Button>
          </div>
          <div className="flex-1">
            <h2 className="mb-1 text-lg md:text-xl">Courses</h2>
            <div className="mb-2 md:mb-4">...</div>
            <div>
              <Button onClick={() => router.push('/dbf')}>
                <Button.Arrow />
                Course Overview
              </Button>
            </div>
          </div>
        </div>
      </HomeSection>

      <HomeSection title="Development Workflow">
        <img
          className="mb-2 md:mb-4"
          src="images/dev_workflow.png"
          alt="Knowledge Graph"
        />
        <Button onClick={() => router.push('/dev')}>
          <Button.Arrow />
          Development Workflow
        </Button>
      </HomeSection>

      <HomeSection title="Roadmap">
        <div className="mb-2 md:mb-4">...</div>
        <Button onClick={() => router.push('/roadmap')}>
          <Button.Arrow />
          Roadmap
        </Button>
      </HomeSection>
    </PageWithHeader>
  )
}

export default Home
