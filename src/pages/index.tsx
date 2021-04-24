import Head from 'next/head'
import PageWithHeader from '../components/PageWithHeader'

function HomeSection({ title, children }) {
  return (
    <div className="mt-4 md:mt-8">
      <h1 className="mb-1 text-xl md:text-3xl md:mb-2">{title}</h1>
      <div className="p-2 border md:p-4">{children}</div>
    </div>
  )
}

function Home() {
  return (
    <PageWithHeader>
      <Head>
        <title>GBL @ DBF</title>
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
