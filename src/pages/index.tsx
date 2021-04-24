import Head from 'next/head'
import PageWithHeader from '../components/PageWithHeader'

interface HomeSectionProps {
  title: string
  children: React.ReactNode
}

function HomeSection({ title, children }: HomeSectionProps) {
  return (
    <div className="mt-4 md:mt-8">
      <h1 className="mb-1 text-xl md:text-3xl md:mb-2">{title}</h1>
      <div className="p-2 border md:p-4">{children}</div>
    </div>
  )
}

function Home() {
  return (
    <PageWithHeader title="Home">
      <Head>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js" />
      </Head>

      <img
        width="1200"
        height="250"
        src="https://place-hold.it/1200x250/D3D3D3?text=HERO"
        alt=""
      />

      <HomeSection title="Game-Based Learning">hello world</HomeSection>

      <HomeSection title="GBL @ DBF">hello world</HomeSection>

      <HomeSection title="Development Workflow">hello world</HomeSection>

      <HomeSection title="Roadmap">hello world</HomeSection>
    </PageWithHeader>
  )
}

export default Home
