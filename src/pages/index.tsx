import Head from 'next/head'
import { useRouter } from 'next/router'
import BannerSection from '../components/common/BannerSection'
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
          <div className="p-2 text-xl text-center rounded cursor-pointer text-uzh-red-100 hover:shadow-lg">
            <img width="150" src="/images/vorlesung_icon.png" />
            for teachers
          </div>
          <div className="p-2 text-xl text-center rounded cursor-pointer text-uzh-red-100 hover:shadow-lg">
            <img width="150" src="/images/gruppenarbeit_icon.png" />
            for students
          </div>
          <div className="p-2 text-xl text-center rounded cursor-pointer text-uzh-red-100 hover:shadow-lg">
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
        <HomeSection.IconContent
          iconSrc="images/netzwerk_icon.svg"
          iconAlt="Knowledge Graph"
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem,
          enim aspernatur! Vero laboriosam reprehenderit at, architecto odio
          deleniti mollitia illum cupiditate suscipit rerum accusantium sint
          inventore nostrum ad eveniet perferendis.
        </HomeSection.IconContent>

        <Button onClick={() => router.push('/kb')}>
          <Button.Arrow />
          Knowledge Base
        </Button>
      </HomeSection>

      <BannerSection>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum
        expedita fugiat ipsum est non minus aspernatur suscipit, soluta ipsa
        sint maiores aliquam facilis accusantium vel voluptas consequatur
        voluptatum molestiae exercitationem!
      </BannerSection>

      <HomeSection title="Development Workflow">
        <HomeSection.IconContent
          iconSrc="images/dev_workflow.png"
          iconAlt="Development Workflow"
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem,
          enim aspernatur! Vero laboriosam reprehenderit at, architecto odio
          deleniti mollitia illum cupiditate suscipit rerum accusantium sint
          inventore nostrum ad eveniet perferendis.
        </HomeSection.IconContent>

        <Button onClick={() => router.push('/dev')}>
          <Button.Arrow />
          Development Workflow
        </Button>
      </HomeSection>

      <HomeSection title="Roadmap" className="bg-gray-100">
        <HomeSection.IconContent
          iconSrc="images/lernziele_icon.svg"
          iconAlt="Roadmap"
        >
          ...
        </HomeSection.IconContent>

        <Button onClick={() => router.push('/roadmap')}>
          <Button.Arrow />
          Roadmap
        </Button>
      </HomeSection>

      <BannerSection>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum
        expedita fugiat ipsum est non minus aspernatur suscipit, soluta ipsa
        sint maiores aliquam facilis accusantium vel voluptas consequatur
        voluptatum molestiae exercitationem!
      </BannerSection>
    </PageWithHeader>
  )
}

export default Home
