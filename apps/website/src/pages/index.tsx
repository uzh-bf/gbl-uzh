import { faArrowRight, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, H1, H2, Prose } from '@uzh-bf/design-system'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DevIcon from '../../public/images/einzelarbeit_icon.svg'
import StudentIcon from '../../public/images/gruppenarbeit_icon.svg'
import PFMImage from '../../public/images/pfm_game.png'
import AdvisorImage from '../../public/images/tablet_icon.svg'
import uFinImage from '../../public/images/ufin.jpg'
import TeacherIcon from '../../public/images/vorlesung_icon.svg'
import Advisor from '../components/Advisor'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'
import HeroImage from '../components/common/HeroImage'
import TitleImage from '../components/common/TitleImage'
import GameCard from '../components/games/GameCard'
import HomeSection from '../components/sections/HomeSection'
import EscapeUZHImage from '/public/images/escape_hero.png'

function Home() {
  const router = useRouter()

  return (
    <PageWithHeader title="Home">
      <TitleImage imgSrc="/images/DSC01864_cut4.jpg">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-end md:justify-between">
          <div className="">
            <H1 className={{ root: 'text-3xl sm:text-4xl' }}>
              Game-Based Learning
            </H1>
            <div className="text-2xl font-light">
              Learning-by-doing. Literally.
            </div>
          </div>
          <a
            className="hidden flex-row items-center gap-4 md:flex"
            href="https://community.klicker.uzh.ch"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              className={{
                root: 'gap-4 border-0 bg-uzh-red-100 text-white md:gap-8 md:px-4 md:py-3 md:text-xl',
              }}
            >
              <Button.Icon>
                <FontAwesomeIcon icon={faUsers} />
              </Button.Icon>
              <Button.Label>Join the community</Button.Label>
            </Button>
          </a>
        </div>
      </TitleImage>

      <Content>
        <div className="md:py-4">
          <div className="m-auto max-w-6xl rounded bg-slate-100 p-6 shadow">
            <div>
              <div className="flex flex-col items-center gap-16 md:flex-row">
                <div className="relative hidden h-44 w-44 md:block md:flex-initial">
                  <Image alt="Advisor" src={AdvisorImage} fill />
                </div>
                <div className="flex-1">
                  <H2>Advisory Wizard</H2>
                  <Prose className={{ root: 'max-w-none md:prose-lg' }}>
                    Don&apos;t know where to start? Get personalized
                    recommendations with our Gamification and Game-Based
                    Learning advisory wizard.
                  </Prose>

                  <div className="mt-4">
                    <Advisor />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-4">
          <HeroImage.Group>
            <Link href="/kb" passHref legacyBehavior>
              <HeroImage
                href="/kb"
                imgSrc={TeacherIcon}
                label="GBL for teachers"
              />
            </Link>
            <Link href="/games" passHref legacyBehavior>
              <HeroImage
                href="/games"
                imgSrc={StudentIcon}
                label="GBL for students"
              />
            </Link>
            <Link href="/dev" passHref legacyBehavior>
              <HeroImage
                href="/dev"
                imgSrc={DevIcon}
                label="GBL for developers"
              />
            </Link>
          </HeroImage.Group>
        </div>

        <div className="py-4 md:py-8">
          <div className="m-auto max-w-6xl">
            <H2>Games & Courses</H2>
            <div>
              <div className="flex flex-col md:flex-row">
                <div className="flex-1">
                  <div className="prose mt-2 max-w-none md:prose-lg">
                    Games and simulations developed at the Department of Banking
                    and Finance, as well as courses supported with Game-Based
                    Learning.
                  </div>
                  <div className="mt-4">
                    <div className="gap-1 sm:grid sm:grid-cols-3 sm:gap-2 md:gap-4">
                      {[
                        {
                          name: 'EscapeUZH Scavenger Hunt',
                          href: '/games/escape-uzh',
                          imgSrc: EscapeUZHImage,
                        },
                        {
                          name: 'Portfolio Management Simulation',
                          href: '/games/portfolio-management-simulation',
                          imgSrc: PFMImage,
                        },
                        {
                          name: 'uFin: The Challenge',
                          href: '/games/u-fin',
                          imgSrc: uFinImage,
                        },
                      ].map(({ name, href, imgSrc }: any) => (
                        <GameCard
                          key="name"
                          name={name}
                          imgSrc={imgSrc}
                          linkHref={href}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    className={{ root: 'mt-4' }}
                    onClick={() => router.push('/games')}
                  >
                    <Button.Icon>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Button.Icon>
                    <Button.Label>Games and Courses</Button.Label>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HomeSection>
          <HomeSection.Hero src="/images/escape_phones.png" />
          <HomeSection.Content
            title="EscapeUZH Platform"
            content="Play our UZH scavenger hunt or design your own digital escape rooms on our EscapeUZH platform."
          >
            <Button
              className={{ root: 'mt-4' }}
              onClick={() => router.push('/escape')}
            >
              <Button.Icon>
                <FontAwesomeIcon icon={faArrowRight} />
              </Button.Icon>
              <Button.Label>EscapeUZH</Button.Label>
            </Button>
          </HomeSection.Content>
        </HomeSection>
        <HomeSection>
          <HomeSection.Content
            title="Knowledge Base"
            content="Get to know the terms and definitions in the fields of gamification and Game-Based Learning. Our knowledge base includes basic terms as well as our best practices."
          >
            <Button
              className={{ root: 'mt-4' }}
              onClick={() => router.push('/kb')}
            >
              <Button.Icon>
                <FontAwesomeIcon icon={faArrowRight} />
              </Button.Icon>
              <Button.Label>Knowledge Base</Button.Label>
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
            <Button
              className={{ root: 'mt-4' }}
              onClick={() => router.push('/dev')}
            >
              <Button.Icon>
                <FontAwesomeIcon icon={faArrowRight} />
              </Button.Icon>
              <Button.Label>Development Practices</Button.Label>
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
            <Button
              className={{ root: 'mt-4' }}
              onClick={() => router.push('/about')}
            >
              <Button.Icon>
                <FontAwesomeIcon icon={faArrowRight} />
              </Button.Icon>
              <Button.Label>Roadmap</Button.Label>
            </Button>
          </HomeSection.Content>
          <HomeSection.Hero
            src="/images/DSC01645_cut1.jpg"
            className="saturate-50"
          />
        </HomeSection>

        <HomeSection>
          <HomeSection.Hero
            src="/images/group_play.png"
            className="saturate-50"
          />
          <HomeSection.Content title="“">
            <Prose>
              <p className="prose-lg">
                “I absolutely loved the{' '}
                <Link href="/games/portfolio-management-simulation">
                  Portfolio Management Game
                </Link>
                , it was great fun and required us to apply our knowledge and to
                work meticulously to come up with good decisions for our
                portfolio, our customers, and our bank in general. It&apos;s a
                very educational, fun tool.”
              </p>
              <p className="mt-4 italic">
                Student from our International Summer School in 2020
              </p>
            </Prose>
          </HomeSection.Content>
        </HomeSection>
        <HomeSection>
          <HomeSection.Content title="“">
            <Prose>
              <p className="prose-lg">
                “Traditional learning has provided superficial learning through
                text books. Games are best at teaching a deeper level of
                learning.”
              </p>
              <p className="mt-4 italic">Eric Klopfer, MIT</p>
            </Prose>
          </HomeSection.Content>
          <HomeSection.Hero src="/images/hero_1.jpg" className="saturate-50" />
        </HomeSection>
      </Content>
    </PageWithHeader>
  )
}

export default Home
