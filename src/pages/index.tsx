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

function Home() {
  const router = useRouter()

  return (
    <PageWithHeader title="Home">
      <Head>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js" />
      </Head>

      <TitleImage imgSrc="/images/hero5.jpg">
        <Title title="Learning-by-doing." />
        <Title title="Literally." />
      </TitleImage>

      <div className="px-8 py-8 md:py-16 bg-uzh-gray-20">
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

      <div className="px-8 py-8 sm:px-8 md:py-16 md:px-4">
        <div className="max-w-6xl m-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-kollektif-bold text-uzh-red-100">
            GBL in Use
          </h1>
          <div>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1">
                <div className="mt-2 prose md:prose-lg max-w-none">
                  Games and simulations developed at the Department of Banking
                  and Finance, as well as courses supported with Game-Based
                  Learning.
                </div>
                <div className="mt-4">
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
                <Button className="mt-4" onClick={() => router.push('/dbf')}>
                  <Button.Arrow />
                  Our Games and Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomeSection>
        <HomeSection.Content
          title="Knowledge Base"
          content="Get to know the terms and definitions in the fields of gamification and Game-Based Learning. Our knowledge base includes basic terms as well as our best practices."
        >
          <Button className="mt-4" onClick={() => router.push('/kb')}>
            <Button.Arrow />
            Knowledge Base
          </Button>
        </HomeSection.Content>
        <HomeSection.Hero src="/images/kma-SiOJXlWeWc0-unsplash.jpg" />
      </HomeSection>

      <HomeSection>
        <HomeSection.Hero padded contain src="/images/dev_workflow.png" />
        <HomeSection.Content
          title="Development Workflow"
          content="Learn how you can proceed if you want to develop your own simulation or serious game. Use our resources as a support and for guidance in your own development."
        >
          <Button className="mt-4" onClick={() => router.push('/dev')}>
            <Button.Arrow />
            Development Workflow
          </Button>
        </HomeSection.Content>
      </HomeSection>

      <HomeSection>
        <HomeSection.Content
          title="Roadmap"
          content="Get involved now: Ask
          questions, let us know what would be useful for you in terms of
          content, exchange game ideas, and join our community!"
        >
          <Button className="mt-4" onClick={() => router.push('/roadmap')}>
            <Button.Arrow />
            Roadmap
          </Button>
        </HomeSection.Content>
        <HomeSection.Hero src="/images/matt-duncan-IUY_3DvM__w-unsplash.jpg" />
      </HomeSection>

      <HomeSection>
        <HomeSection.Hero src="/images/Unbenannt-2.png" />
        <HomeSection.Content
          title="“"
          content="“Traditional learning has provided superficial learning through text books. Games are best at teaching a deeper level of learning.” Eric Klopfer, MIT"
        />
      </HomeSection>
    </PageWithHeader>
  )
}

export default Home
