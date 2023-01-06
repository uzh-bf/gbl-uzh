import { H1 } from '@uzh-bf/design-system'
import { useRouter } from 'next/router'
import { sortBy } from 'ramda'
import Card from '../../components/common/Card'
import TitleBackground from '../../components/common/TitleBackground'
import Content from '../../components/Content'
import PageWithHeader from '../../components/PageWithHeader'
import * as Util from '../../lib/util'

interface Props {
  sourceArr: any
  frontMatterArr: any
  filenames: any
  fileMissingArr: any
}

function GBLUseCases({
  sourceArr,
  frontMatterArr,
  filenames,
  fileMissingArr,
}: Props) {
  const router = useRouter()

  return (
    <PageWithHeader title="Use Cases">
      <TitleBackground>
        <H1 className={{ root: 'max-w-6xl mx-auto lg:pl-4' }}>Use Cases</H1>
      </TitleBackground>

      <Content>
        <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2 md:grid-cols-3">
          {sortBy((useCase: any) => useCase.title, frontMatterArr[0]).map(
            (useCase: any) => (
              <Card
                key={useCase.title}
                name={useCase.title}
                tags={useCase.tags}
                imgSrc={useCase.imgSrc}
                onClick={() => router.push(`/use-cases/${useCase.slug}`)}
              />
            )
          )}
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default GBLUseCases
export const getStaticProps = Util.getStaticPropsFolders(['use-cases'])
