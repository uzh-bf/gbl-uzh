import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from '../components/common/Button'
import HomeSection from '../components/common/HomeSection'
import PaddedSection from '../components/common/PaddedSection'
import PageWithHeader from '../components/PageWithHeader'

function Home() {
  const router = useRouter()

  return (
    <PageWithHeader title="Home">
      <Head>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js" />
      </Head>

      <div className="relative">
        <div className="absolute w-full p-4 bg-white top-5 sm:top-auto sm:bottom-10 bg-opacity-60">
          <div className="max-w-6xl m-auto text-3xl font-medium text-center text-uzh-red-80 sm:text-4xl lg:text-6xl">
            Digital Game-Based Learning
          </div>
        </div>
        <img width="100%" src="/images/hero2.jpg" alt="" />
      </div>

      <PaddedSection className="bg-gray-200">
        <div className="max-w-3xl px-8 pb-3 m-auto prose prose-lg text-center border-b border-gray-300">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum
          expedita fugiat ipsum est non minus aspernatur suscipit, soluta ipsa
          sint maiores aliquam facilis accusantium vel voluptas consequatur
          voluptatum molestiae exercitationem!
        </div>
      </PaddedSection>

      <PaddedSection>
        <div className="flex flex-row justify-between max-w-3xl pb-8 m-auto">
          <div className="text-xl text-center text-uzh-red-100">
            <img width="150" src="/images/vorlesung_icon.png" />
            for teachers
          </div>
          <div className="text-xl text-center text-uzh-red-100">
            <img width="150" src="/images/gruppenarbeit_icon.png" />
            for students
          </div>
          <div className="text-xl text-center text-uzh-red-100">
            <img width="150" src="/images/einzelarbeit_icon.png" />
            for developers
          </div>
        </div>
      </PaddedSection>

      <HomeSection title="GBL @ DBF" className="bg-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="mb-2 md:mb-4">
              <div className="flex flex-col md:flex-wrap md:flex-row">
                {[
                  'Portfolio Management Simulation',
                  'Derivatives Game',
                  'Banking Game',
                ].map((game) => (
                  <div className="relative flex-1 mr-2 border rounded-lg last:mr-0">
                    <div className="absolute left-0 right-0 py-1 text-base text-center text-white bg-gray-600 bottom-2">
                      {game}
                    </div>
                    <img
                      width="100%"
                      src="https://place-hold.it/400x200/D3D3D3?text=SCREENSHOT"
                      alt={game}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => router.push('/dbf')}>
              <Button.Arrow />
              Our Games and Courses
            </Button>
          </div>
        </div>
      </HomeSection>

      <HomeSection title="GBL Knowledge Base">
        <div className="relative flex flex-row mb-2 md:mb-4">
          <img
            className="w-24 md:w-40"
            src="images/netzwerk_icon.png"
            alt="Knowledge Graph"
          />
          <p className="p-2 prose md:p-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem,
            enim aspernatur! Vero laboriosam reprehenderit at, architecto odio
            deleniti mollitia illum cupiditate suscipit rerum accusantium sint
            inventore nostrum ad eveniet perferendis.
          </p>
        </div>

        <Button onClick={() => router.push('/kb')}>
          <Button.Arrow />
          Knowledge Base
        </Button>
      </HomeSection>

      <div className="py-4 bg-gray-100 md:py-16">
        <div className="relative">
          <img src="/images/hero3.jpg" className="opacity-20" />
          <div className="absolute max-w-3xl p-4 m-auto prose prose-lg text-center bottom-5 rounded-xl md:px-0 bg-opacity-40">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum
            expedita fugiat ipsum est non minus aspernatur suscipit, soluta ipsa
            sint maiores aliquam facilis accusantium vel voluptas consequatur
            voluptatum molestiae exercitationem!
          </div>
        </div>
      </div>

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
