import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from '../components/common/Button'
import HeroImage from '../components/common/HeroImage'
import Title from '../components/common/Title'
import TitleImage from '../components/common/TitleImage'
import GameCard from '../components/games/GameCard'
import PageWithHeader from '../components/PageWithHeader'
import HomeSection from '../components/sections/HomeSection'
import HomeSection2 from '../components/sections/HomeSection2'

function Home() {
  const router = useRouter()

  return (
    <PageWithHeader title="Home">
      <Head>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js" />
      </Head>

      <TitleImage imgSrc="/images/header_temp2.png">
        <Title title="Learning-by-doing." />
        <Title title="Literally." />
      </TitleImage>

      <div className="py-16 bg-uzh-gray-20">
        <HeroImage.Group>
          <Link href="/kb">
            <HeroImage
              className="bg-white bg-opacity-70"
              href="/kb"
              imgSrc="/images/vorlesung_icon.svg"
              label="for teachers"
            />
          </Link>
          <Link href="/dbf">
            <HeroImage
              className="bg-white bg-opacity-70"
              href="/dbf"
              imgSrc="/images/gruppenarbeit_icon.svg"
              label="for students"
            />
          </Link>
          <Link href="/resources">
            <HeroImage
              className="bg-white bg-opacity-70"
              href="/resources"
              imgSrc="/images/einzelarbeit_icon.svg"
              label="for developers"
            />
          </Link>
        </HeroImage.Group>
      </div>

      <HomeSection title="GBL in Use">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="mb-2 prose md:prose-lg max-w-none">
              Games and simulations developed at the Department of Banking and
              Finance, as well as courses supported with Game-Based Learning.
            </div>
            <div className="mb-2 md:mb-4">
              <div className="flex flex-col md:flex-wrap md:flex-row">
                {[
                  ['Portfolio Management Simulation', '/games/pfm'],
                  ['Derivatives Game', '/games/derivatives'],
                  ['Banking Game', '/games/banking'],
                ].map(([name, href]) => (
                  <GameCard name={name} linkHref={href} />
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

      <HomeSection2>
        <HomeSection2.Content
          title="Knowledge Base"
          content="Get to know the various terms and definitions in the fields of gamification and Game-Based Learning. Our knowledge base contains information on basic terms as well as a compilation of our best practices."
        >
          <Button className="mt-4">
            <Button.Arrow />
            Knowledge Base
          </Button>
        </HomeSection2.Content>
        <HomeSection2.Hero src="/images/hero3.jpg" />
      </HomeSection2>

      <HomeSection2>
        <HomeSection2.Hero src="/images/dev_workflow.png" />
        <HomeSection2.Content
          title="Development Workflow"
          content="Learn how you can proceed if you want to develop your own simulation or serious game. Use our resources as a support and for guidance in your own development."
        >
          <Button className="mt-4">
            <Button.Arrow />
            Development Workflow
          </Button>
        </HomeSection2.Content>
      </HomeSection2>

      <HomeSection2>
        <HomeSection2.Content
          title="Roadmap"
          content="We are working on a Game-Based Learning project supported by the
          University of Zurich and Swissuniversities. Get involved now: Ask
          questions, let us know what would be useful for you in terms of
          content, exchange game ideas, and join our community!"
        >
          <Button className="mt-4">
            <Button.Arrow />
            Roadmap
          </Button>
        </HomeSection2.Content>
        <HomeSection2.Hero src="/images/hero3.jpg" />
      </HomeSection2>

      <HomeSection2>
        <HomeSection2.Hero src="/images/hero3.jpg" />
        <HomeSection2.Content
          title="“"
          content="“Traditional learning has provided superficial learning through text books. Games are best at teaching a deeper level of learning.” Eric Klopfer, MIT"
        />
      </HomeSection2>
    </PageWithHeader>
  )
}

export default Home
