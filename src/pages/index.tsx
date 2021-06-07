import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from '../components/common/Button'
import HeroImage from '../components/common/HeroImage'
import Title from '../components/common/Title'
import TitleImage from '../components/common/TitleImage'
import GameCard from '../components/games/GameCard'
import PageWithHeader from '../components/PageWithHeader'
import BannerSection from '../components/sections/BannerSection'
import CitationSection from '../components/sections/CitationSection'
import HomeSection from '../components/sections/HomeSection'
import PaddedSection from '../components/sections/PaddedSection'

function Home() {
  const router = useRouter()

  return (
    <PageWithHeader title="Home">
      <Head>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js" />
      </Head>

      <TitleImage imgSrc="/images/header_temp.jpg">
        <Title  title="Learning-by-doing." />
        <Title  title="Literally." />
      </TitleImage>

      <PaddedSection className="bg-uzh-gray-20">
        <CitationSection>
          Current research in the field of Game-Based Learning shows that
          learning complex topics as well as gaining experience in realistic,
          digital business games increases learning success among students. The
          aim of our Game-Based Learning project is to apply the experience
          gained so far when using and developing games to develop materials and
          frameworks supporting teachers in the design and creation of their own
          browser-based simulations and serious games.
        </CitationSection>
      </PaddedSection>

      <PaddedSection>
        <HeroImage.Group>
          <Link href="/kb">
            <HeroImage
              href="/kb"
              imgSrc="/images/vorlesung_icon.svg"
              label="for teachers"
            />
          </Link>
          <Link href="/dbf">
            <HeroImage
              href="/dbf"
              imgSrc="/images/gruppenarbeit_icon.svg"
              label="for students"
            />
          </Link>
          <Link href="/resources">
            <HeroImage
              href="/resources"
              imgSrc="/images/einzelarbeit_icon.svg"
              label="for developers"
            />
          </Link>
        </HeroImage.Group>
      </PaddedSection>

      <HomeSection title="GBL in Use" className="bg-uzh-gray-20">
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
      <HomeSection title="GBL Knowledge Base">
        <HomeSection.IconContent
          iconSrc="images/netzwerk_icon.svg"
          iconAlt="Knowledge Graph"
        >
          Get to know the various terms and definitions in the fields of
          gamification and Game-Based Learning. Our knowledge base contains
          information on basic terms as well as a compilation of our best
          practices.
        </HomeSection.IconContent>

        <Button onClick={() => router.push('/kb')}>
          <Button.Arrow />
          Knowledge Base
        </Button>
      </HomeSection>

      <BannerSection imgSrc="/images/hero3.jpg">
        &ldquo;Traditional learning has provided superficial learning through
        text books. Games are best at teaching a deeper level of
        learning.&rdquo; Eric Klopfer, MIT
      </BannerSection>

      <HomeSection title="Development Workflow">
        <div className="mb-2 prose md:prose-lg max-w-none">
          Learn how you can proceed if you want to develop your own simulation
          or serious game. Use our resources as a support and for guidance in
          your own development.
        </div>
        <div className="max-w-xl mt-4 mb-8">
          <img
            alt="Development Workflow"
            width="100%"
            src="/images/dev_workflow.png"
          />
        </div>
        <Button onClick={() => router.push('/dev')}>
          <Button.Arrow />
          Development Workflow
        </Button>
      </HomeSection>

      <HomeSection title="Roadmap" className="bg-uzh-gray-20">
        <HomeSection.IconContent
          iconSrc="images/lernziele_icon.svg"
          iconAlt="Roadmap"
        >
          We are working on a Game-Based Learning project supported by the
          University of Zurich and Swissuniversities. Get involved now: Ask
          questions, let us know what would be useful for you in terms of
          content, exchange game ideas, and join our community!
        </HomeSection.IconContent>

        <Button onClick={() => router.push('/roadmap')}>
          <Button.Arrow />
          Roadmap
        </Button>
      </HomeSection>

      {/* <BannerSection imgSrc="/images/hero3.jpg">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum
        expedita fugiat ipsum est non minus aspernatur suscipit, soluta ipsa
        sint maiores aliquam facilis accusantium vel voluptas consequatur
        voluptatum molestiae exercitationem!
      </BannerSection> */}
    </PageWithHeader>
  )
}

export default Home
