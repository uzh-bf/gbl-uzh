import Head from 'next/head'
import Navigation from '../components/Navigation'

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
    <div className="p-4">
      <Head>
        <title>GBL @ DBF</title>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js" />
      </Head>

      <div>
        <div className="flex flex-col justify-between border-blue-700 md:border-b-8 md:items-end md:flex-row">
          <div className="flex-1 mb-4 md:flex-initial md:mb-0">
            <img
              className="m-auto md:m-0"
              width="150"
              height="75"
              src="https://place-hold.it/150x75/D3D3D3?text=GBL @ UZH"
              alt=""
            />
          </div>
          <div className="flex-initial border-l-8 border-blue-700 md:border-none">
            <Navigation />
          </div>
        </div>

        <div className="mt-4 md:mt-8">
          <img
            width="1200"
            height="250"
            src="https://place-hold.it/1200x250/D3D3D3?text=HERO"
            alt=""
          />
        </div>
      </div>

      <HomeSection title="Game-Based Learning">hello world</HomeSection>

      <HomeSection title="GBL @ DBF">hello world</HomeSection>

      <HomeSection title="Development Workflow">hello world</HomeSection>

      <HomeSection title="Roadmap">hello world</HomeSection>
    </div>
  )
}

export default Home
