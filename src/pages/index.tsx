import Link from 'next/link'
import { useRouter } from 'next/router'
import Script from 'next/script'
import DevIcon from '../../public/images/einzelarbeit_icon.svg'
import StudentIcon from '../../public/images/gruppenarbeit_icon.svg'
import PFMImage from '../../public/images/pfm_game.png'
import uFinImage from '../../public/images/ufin.jpg'
import UnderConstructionImage from '../../public/images/under_construction.jpg'
import TeacherIcon from '../../public/images/vorlesung_icon.svg'
import Button from '../components/common/Button'
import HeroImage from '../components/common/HeroImage'
import Title from '../components/common/Title'
import TitleImage from '../components/common/TitleImage'
import Content from '../components/Content'
import GameCard from '../components/games/GameCard'
import PageWithHeader from '../components/PageWithHeader'
import HomeSection from '../components/sections/HomeSection'

function Home() {
  const router = useRouter()

  return (
    <PageWithHeader title="Home">
      <Script src="https://identity.netlify.com/v1/netlify-identity-widget.js" />

      <TitleImage imgSrc="/images/hero5.jpg">
        <Title title="Learning-by-doing." />
        <Title title="Literally." />
      </TitleImage>

      <div className="px-8 py-8 md:py-16 bg-uzh-gray-20">
        <HeroImage.Group>
          <Link href="/kb" passHref>
            <HeroImage
              className="bg-white bg-opacity-70"
              href="/kb"
              imgSrc={TeacherIcon}
              label="for teachers"
            />
          </Link>
          <Link href="/games" passHref>
            <HeroImage
              className="bg-white bg-opacity-70"
              href="/games"
              imgSrc={StudentIcon}
              label="for students"
            />
          </Link>
          <Link href="/dev" passHref>
            <HeroImage
              className="bg-white bg-opacity-70"
              href="/dev"
              imgSrc={DevIcon}
              label="for developers"
            />
          </Link>
        </HeroImage.Group>
      </div>

      <Content>
        <div className="py-8 md:py-16">
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
                    <div className="sm:grid sm:grid-cols-3 sm:gap-2 md:gap-4">
                      {[
                        ['uFin: The Challenge', uFinImage],
                        ['Portfolio Management Simulation', PFMImage],
                        ['Derivatives Game', UnderConstructionImage],
                      ].map(([name, imgSrc]) => (
                        <GameCard key="name" name={name} imgSrc={imgSrc} />
                      ))}
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/games')}
                  >
                    <Button.Arrow />
                    Games and Courses
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
            title="Development Practices"
            content="Learn how you can proceed if you want to develop your own simulation or serious game. Use our resources as a support and for guidance in your own development."
          >
            <Button className="mt-4" onClick={() => router.push('/dev')}>
              <Button.Arrow />
              Development Practices
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
      </Content>
    </PageWithHeader>
  )
}

export default Home
