import Header from '../../components/common/Header'
import Title from '../../components/common/Title'
import TitleBackground from '../../components/common/TitleBackground'
import PageWithHeader from '../../components/PageWithHeader'

function GameConcept() {
  // const router = useRouter()

  return (
    <PageWithHeader title="Development Workflow">
      <TitleBackground>
        <Title title="Game Topic" />
      </TitleBackground>

      <div className="max-w-6xl py-8 m-auto">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="flex-initial w-full h-64 border rounded shadow md:w-1/2 md:h-auto">
            <img
              src="/images/gbl_video_thumb.png"
              width="100%"
              alt="Video Thumbnail"
            />
            {/* <iframe
              title="Video"
              width="100%"
              height="100%"
              src="https://tube.switch.ch/embed/2f78e8bf"
              frameBorder="0"
              allow="fullscreen"
              allowFullScreen
            /> */}
          </div>
          <div className="flex-1 mt-4 md:mt-0 md:pl-8">
            <img
              src="/images/dev_workflow_small.png"
              className="p-2 m-auto w-60"
              alt="Workflow Step"
            />
            {/* <Button onClick={() => router.push('/dev/development')}>
              <Button.Arrow />
              Game Development
            </Button> */}
            <p className="p-4 mt-4 prose prose-lg text-justify max-w-none">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum
              temporibus, quasi quos laboriosam deleniti optio soluta quam nihil
              saepe veritatis minus ipsum modi non vero enim, labore, beatae
              aperiam corrupti.
            </p>
          </div>
        </div>

        <div className="pt-8">
          <Header.H2 className="border-b">Conceptualize Game Ideas</Header.H2>
          <div className="flex flex-col py-1 md:flex-row">
            <p className="flex-1 prose max-w-none">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Id
              placeat expedita hic modi ipsum, dolores beatae autem optio
              perferendis dolore doloremque odit numquam aut sint obcaecati
              maxime molestiae ex saepe!
              <ul>
                <li>...</li>
                <li>...</li>
              </ul>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Id
              placeat expedita hic modi ipsum, dolores beatae autem optio
              perferendis dolore doloremque odit numquam aut sint obcaecati
              maxime molestiae ex saepe!
            </p>
            <div className="flex-initial pl-16 w-72">
              <div className="flex flex-row py-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <div className="ml-2">document</div>
              </div>
              <div className="flex flex-row py-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <div className="ml-2">computation</div>
              </div>
            </div>
          </div>

          <Header.H2 className="mt-8 border-b">Evaluate Game Ideas</Header.H2>
          <div className="flex flex-col py-1 md:flex-row">
            <p className="flex-1 prose max-w-none">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis,
              modi totam rem quos cumque minus doloremque? Aut, culpa asperiores
              non quas vitae, iste repellat perferendis assumenda iusto nam
              ipsum quaerat.
              <ul>
                <li>...</li>
                <li>...</li>
              </ul>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Id
              placeat expedita hic modi ipsum, dolores beatae autem optio
              perferendis dolore doloremque odit numquam aut sint obcaecati
              maxime molestiae ex saepe!
            </p>
            <div className="flex-initial pl-16 w-72">
              <div className="flex flex-row py-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <div className="ml-2">external resource</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWithHeader>
  )
}

export default GameConcept
