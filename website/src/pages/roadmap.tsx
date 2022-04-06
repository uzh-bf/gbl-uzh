import { useEffect } from 'react'
import TreeIcon from '../../public/images/baum_icon.svg'
import ToolboxIcon from '../../public/images/innovation_icon.svg'
import NetworkIcon from '../../public/images/netzwerk_icon.svg'
import ProcessIcon from '../../public/images/prozess_icon.svg'
import UZHIcon from '../../public/images/uzh_icon.svg'
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
            imgSrc={UZHIcon}
            title="GBL in Use"
            description="Establish an overview of how game-based learning is being used at the
                University of Zurich."
            // roadmapHref="https://gbl-uzh.feedbear.com/boards/gbl-in-use"
          />

          <FocusArea
            className="mt-4"
            imgSrc={NetworkIcon}
            title="GBL Knowledge Base"
            description="Develop a knowledge base and learning resources with know-how and best practices on game-based learning and game development."
            // roadmapHref="https://gbl-uzh.feedbear.com/boards/gbl-knowledge-base"
          />

          <FocusArea
            className="mt-4"
            imgSrc={ToolboxIcon}
            title="GBL Toolbox"
            description="Develop technical and content-related resources that can be used when designing and developing learning games."
            // roadmapHref="https://gbl-uzh.feedbear.com/boards/gbl-toolbox"
          />

          <FocusArea
            className="mt-4"
            imgSrc={ProcessIcon}
            title="Simulation Platform"
            description="Create a foundational framework that can be applied when implementing simulations."
            // roadmapHref="https://gbl-uzh.feedbear.com/boards/simulation-platform"
          />

          <FocusArea
            className="mt-4"
            imgSrc={TreeIcon}
            title="GBL Community"
            description="Establish and foster a game-based learning community at the University of Zurich and connect with interested external parties."
            // roadmapHref="https://gbl-uzh.feedbear.com/boards/gbl-community"
          />
        </div>

        <Header.H2 className="mt-8">Get Involved</Header.H2>
        <p className="prose max-w-none">
          We strive to develop our roadmap and goals based on the needs of the
          community. If you are interested in game-based learning and would like
          to be involved in the project, please fill out the following form to
          join our community.
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
