import { H1, H2, Prose } from '@uzh-bf/design-system'
import Link from 'next/link'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'
import TitleImage from '../components/common/TitleImage'

function EscapeUZH() {
  return (
    <PageWithHeader title="EscapeUZH">
      {/* <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32"> */}
      <TitleImage imgSrc="/images/escapeuzh_hero.png">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-end md:justify-between">
          <div className="">
            <H1 className={{ root: 'text-3xl sm:text-4xl' }}>EscapeUZH</H1>
          </div>
        </div>
      </TitleImage>

      <Content className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <H2>What is EscapeUZH?</H2>
          <Prose className={{ root: 'max-w-none' }}>
            <p>
              The EscapeUZH platform is a web-based tool that facilitates the
              creation of digital (educational) escape rooms. It is based on the
              Escapp platform (
              <a href="https://github.com/uzh-bf/escapp">
                github.com/uzh-bf/escapp
              </a>
              ) developed initially at Universidad Politécnica de Madrid and
              adapter and hosted by the Department of Banking and Finance for
              the University of Zurich.
            </p>
            <p>
              You can find more information in our use case (
              <Link href="/use-cases/escape-uzh" target="_blank">
                EscapeUZH - Developing Digital Educational Escape Rooms
              </Link>
              ) and in the details of our own escape room (
              <Link href="/games/escape-uzh" target="_blank">
                EscapeUZH - The Search for the Instant University Diploma
              </Link>
              ).
            </p>
          </Prose>
          <H2 className={{ root: 'mt-4' }}>What does EscapeUZH provide?</H2>
          <Prose className={{ root: 'max-w-none' }}>
            <p>
              We provide free access to the platform for educational use cases
              (upon request). You can use the platform to build your own digital
              (educational) escape rooms, or to play our EscapeUZH scavenger
              hunt (
              <Link href="/games/escape-uzh/" target="_blank">
                The Search for the Instant University Diploma
              </Link>
              ) with your students.
            </p>
            <p>
              We also provide a community space for exchange with us and other
              lecturers related to the platform and digital (educational) escape
              rooms and general topics related to game-based learning (
              <a href="https://community.klicker.uzh.ch">
                community.klicker.uzh.ch
              </a>
              ).
            </p>
          </Prose>
          <H2 className={{ root: 'mt-4' }}>How can I get access?</H2>
          <Prose className={{ root: 'max-w-none' }}>
            If you are interested in using the platform or our escape room for
            educational purposes, please submit your use case using the form
            available on the right (or directly on{' '}
            <a href="https://forms.office.com/e/dxZrnYmy5P" target="_blank">
              Microsoft Forms
            </a>
            ).
          </Prose>
        </div>
        <div className="min-w-[400px] flex-1">
          <iframe
            className="flex-1"
            width="100%"
            height="1000px"
            src="https://forms.office.com/Pages/ResponsePage.aspx?id=2zjkx2LkIkypCsNYsWmAs3FqIECvYGdIv-SlumKwtF1URUIwNVI2SzIzVjlGWkEzNUZGN1BKWTNLSy4u&embed=true"
          />
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default EscapeUZH
