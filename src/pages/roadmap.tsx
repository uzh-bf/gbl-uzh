import { useEffect } from 'react'
import PlaceholderImage from '../../public/images/Unbenannt-2.png'
import FocusArea from '../components/common/FocusArea'
import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'

function Roadmap() {
  useEffect(() => {
    const s: any = document.createElement('script')
    const options = {
      id: 12,
      theme: 0,
      container: 'c7',
      height: '479px',
      form: '//www.bf-tools.uzh.ch/applications/easyforms/index.php?r=app%2Fembed',
    }
    s.type = 'text/javascript'
    s.src =
      'https://www.bf-tools.uzh.ch/applications/easyforms/static_files/js/form.widget.js'
    s.onload = s.onreadystatechange = function () {
      const rs = this.readyState
      if (rs) if (rs != 'complete') if (rs != 'loaded') return
      try {
        new window.EasyForms().initialize(options).display()
      } catch (e) {}
    }
    const scr = document.getElementsByTagName('script')[0]
    const par = scr.parentNode
    par.insertBefore(s, scr)
  })

  return (
    <PageWithHeader title="Roadmap">
      <TitleBackground>
        <Title title="Project Roadmap" />
      </TitleBackground>

      <Content>
        <Header.H2>Vision</Header.H2>
        <p className="mb-8 prose max-w-none">
          Game-based learning has many benefits for lecturers and students.
          However, it can be difficult to get started with developing learning
          games and integrating games with other curricular activities. We want
          to foster the application of game-based learning in the university
          context by providing foundational resources for game usage and
          development based on what we have learned on our own journey.
        </p>

        <Header.H2>Focus Areas</Header.H2>
        <div>
          <FocusArea
            imgSrc={PlaceholderImage}
            title="GBL @ UZH"
            description="Establish an overview of how game-based learning is being used at the
                University of Zurich."
          />

          <FocusArea
            className="mt-4"
            imgSrc={PlaceholderImage}
            title="GBL Knowledge Base"
            description="Develop a knowledge base and learning resources with know-how and best practices on game-based learning and game development."
          />

          <FocusArea
            className="mt-4"
            imgSrc={PlaceholderImage}
            title="Game Development Toolbox"
            description="Develop technical and content-related resources that can be used when designing and developing learning games."
          />

          <FocusArea
            className="mt-4"
            imgSrc={PlaceholderImage}
            title="Simulation Platform"
            description="Create a foundational framework that can be applied when implementing simulations."
          />

          <FocusArea
            className="mt-4"
            imgSrc={PlaceholderImage}
            title="GBL Community"
            description="Establish and foster a game-based learning community at the University of Zurich and connect with interested external parties."
          />
        </div>

        <Header.H2 className="mt-8">Get Involved</Header.H2>
        <p className="prose max-w-none">
          We strive to develop our roadmap and goals based on the needs of the
          community. If you are interested in game-based learning and would like
          to be involved in the project, please fill out the following form to
          join our user group.
        </p>
        <div className="max-w-lg mt-4 border">
          <div id="c7">
            Fill in the{' '}
            <a href="https://www.bf-tools.uzh.ch/applications/easyforms/index.php?r=app%2Fform&id=12">
              online form
            </a>
            .
          </div>
        </div>
      </Content>
    </PageWithHeader>
  )
}

export default Roadmap
