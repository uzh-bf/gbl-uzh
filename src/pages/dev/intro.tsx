import ContentBlock from '../../components/common/ContentBlock'
import Title from '../../components/common/Title'
import TitleBackground from '../../components/common/TitleBackground'
import Content from '../../components/Content'
import PageWithHeader from '../../components/PageWithHeader'

function GameConcept() {
  // const router = useRouter()

  return (
    <PageWithHeader title="Development Workflow">
      <TitleBackground>
        <Title title="Introduction to Game-Based Learning" />
      </TitleBackground>
      <Content>
        <ContentBlock title="Gamification in Context">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis,
          modi totam rem quos cumque minus doloremque? Aut, culpa asperiores non
          quas vitae, iste repellat perferendis assumenda iusto nam ipsum
          quaerat.
          <ul>
            <li>...</li>
            <li>...</li>
          </ul>
        </ContentBlock>

        <ContentBlock title="Why Game-Based Learning?">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis,
          modi totam rem quos cumque minus doloremque? Aut, culpa asperiores non
          quas vitae, iste repellat perferendis assumenda iusto nam ipsum
          quaerat.
          <ul>
            <li>...</li>
            <li>...</li>
          </ul>
        </ContentBlock>

        <ContentBlock title="How does Game-Based Learning work?">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis,
          modi totam rem quos cumque minus doloremque? Aut, culpa asperiores non
          quas vitae, iste repellat perferendis assumenda iusto nam ipsum
          quaerat.
          <ul>
            <li>...</li>
            <li>...</li>
          </ul>
        </ContentBlock>
      </Content>
    </PageWithHeader>
  )
}

export default GameConcept
