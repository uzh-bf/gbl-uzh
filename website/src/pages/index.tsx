import { UsersIcon } from '@heroicons/react/solid'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DevIcon from '../../public/images/einzelarbeit_icon.svg'
import StudentIcon from '../../public/images/gruppenarbeit_icon.svg'
import PFMImage from '../../public/images/pfm_game.png'
import AdvisorImage from '../../public/images/tablet_icon.svg'
import uFinImage from '../../public/images/ufin.jpg'
import UnderConstructionImage from '../../public/images/under_construction.jpg'
import TeacherIcon from '../../public/images/vorlesung_icon.svg'
import Advisor from '../components/Advisor'
import Button from '../components/common/Button'
import HeroImage from '../components/common/HeroImage'
import Title from '../components/common/Title'
import TitleImage from '../components/common/TitleImage'
import Content from '../components/Content'
import GameCard from '../components/games/GameCard'
import PageWithHeader from '../components/PageWithHeader'
import HomeSection from '../components/sections/HomeSection'
import loader from '../lib/loader'

function Home() {
  const router = useRouter()

  return (
    <PageWithHeader title="Home">
      <TitleImage imgSrc="/images/DSC01864_cut4.jpg">
        <div className="flex flex-col gap-4 md:items-end md:justify-between md:flex-row">
          <div className="">
            <Title title="Game-Based Learning" className="mb-4" size="large" />
            <Title title="Learning-by-doing. Literally." size="medium" />
          </div>
          <div className="flex text-lg font-bold md:text-2xl text-uzh-red-80 hover:text-uzh-red-100">
            <a
              className="flex flex-row items-center gap-3"
              href="https://community.klicker.uzh.ch"
              target="_blank"
              rel="noreferrer"
            >
              <UsersIcon className="w-5 md:w-8" />
              Join the community
            </a>
          </div>
        </div>
      </TitleImage>

      <Content>
        <div className="py-4">
          <div className="max-w-6xl p-4 m-auto bg-gray-100 sm:py-0 rounded-xl">
            <div>
              <div className="flex flex-col items-center gap-8 md:flex-row">
                <div className="relative hidden md:block md:flex-initial">
                  <Image
                    src={AdvisorImage}
                    loader={loader}
                    layout="intrinsic"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl font-kollektif text-uzh-red-100">
                    Advisory Wizard
                  </h1>
                  <div className="mt-2 prose md:prose-lg max-w-none">
                    Don&apos;t know where to start? Get personalized
                    recommendations with our Gamification and Game-Based
                    Learning advisory wizard.
                  </div>

                  <Advisor />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-4 md:py-8">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl font-kollektif text-uzh-red-100">
            Audience
          </h1>
          <HeroImage.Group>
            <Link href="/kb" passHref>
              <HeroImage
                href="/kb"
                imgSrc={TeacherIcon}
                label="GBL for teachers"
              />
            </Link>
            <Link href="/games" passHref>
              <HeroImage
                href="/games"
                imgSrc={StudentIcon}
                label="GBL for students"
              />
            </Link>
            <Link href="/dev" passHref>
              <HeroImage
                href="/dev"
                imgSrc={DevIcon}
                label="GBL for developers"
              />
            </Link>
          </HeroImage.Group>
        </div>

        <div className="py-4 md:py-8">
          <div className="max-w-6xl m-auto">
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl font-kollektif text-uzh-red-100">
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
                        ['uFin: The Challenge', '/games/u-fin', uFinImage],
                        [
                          'Portfolio Management Simulation',
                          '/games/portfolio-management-simulation',
                          PFMImage,
                        ],
                        [
                          'Derivatives Game',
                          '/games/derivatives-game',
                          UnderConstructionImage,
                        ],
                      ].map(
                        ([name, href, imgSrc]: [
                          string,
                          string,
                          StaticImageData
                        ]) => (
                          <GameCard
                            key="name"
                            name={name}
                            imgSrc={imgSrc}
                            linkHref={href}
                          />
                        )
                      )}
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/games')}
                  >
                    <Button.Arrow />
                    <div className="ml-2">Games and Courses</div>
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
              <div className="ml-2">Knowledge Base</div>
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
              <div className="ml-2">Development Practices</div>
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
              <div className="ml-2">Roadmap</div>
            </Button>
          </HomeSection.Content>
          <HomeSection.Hero
            // src="/images/DSC01773_cut1.jpg"
            src="/images/DSC01773_cut1.jpg"
            className="saturate-50"
          />
        </HomeSection>

        <HomeSection>
          <HomeSection.Hero
            src="/images/group_play.png"
            className="saturate-50"
          />
          <HomeSection.Content title="“">
            <p className="prose prose-lg">
              “I absolutely loved the{' '}
              <Link href="/games/portfolio-management-simulation">
                Portfolio Management Game
              </Link>
              , it was great fun and required us to apply our knowledge and to
              work meticulously to come up with good decisions for our
              portfolio, our customers, and our bank in general. It&apos;s a
              very educational, fun tool.”
            </p>
            <p className="mt-4 italic prose">
              Student from our International Summer School in 2020
            </p>
          </HomeSection.Content>
        </HomeSection>
        <HomeSection>
          <HomeSection.Content title="“">
            <p className="prose prose-lg">
              “Traditional learning has provided superficial learning through
              text books. Games are best at teaching a deeper level of
              learning.”
            </p>
            <p className="mt-4 italic prose">Eric Klopfer, MIT</p>
          </HomeSection.Content>
          <HomeSection.Hero
            src="/images/DSC01645_cut1.jpg"
            className="saturate-50"
          />
        </HomeSection>
      </Content>
    </PageWithHeader>
  )
}

export default Home
