import { H1, H2, Prose } from '@uzh-bf/design-system'
import { useEffect } from 'react'
import TreeIcon from '../../public/images/baum_icon.svg'
import ToolboxIcon from '../../public/images/innovation_icon.svg'
import NetworkIcon from '../../public/images/netzwerk_icon.svg'
import ProcessIcon from '../../public/images/prozess_icon.svg'
import UZHIcon from '../../public/images/uzh_icon.svg'
import FocusArea from '../components/common/FocusArea'
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
    const par: any = scr.parentNode
    par.insertBefore(s, scr)
  })

  return (
    <PageWithHeader title="Roadmap">
      <TitleBackground>
        <H1 className={{ root: 'max-w-6xl mx-auto lg:pl-4' }}>
          Project Roadmap
        </H1>
      </TitleBackground>

      <Content>
        <H2>Vision</H2>
        <Prose className={{ root: 'max-w-none' }}>
          Game-based learning has many benefits for lecturers and students.
          However, it can be difficult to get started with developing learning
          games and integrating games with other curricular activities. We want
          to foster the application of game-based learning in the university
          context by providing foundational resources for game usage and
          development based on what we have learned on our own journey.
        </Prose>

        <H2 className={{ root: 'mt-8' }}>Focus Areas</H2>
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

        <H2 className={{ root: 'mt-8' }}>Get Involved</H2>
        <Prose className={{ root: 'max-w-none' }}>
          <p>
            If you are interested in game-based learning and would like to get
            in touch with other lecturers to exchange ideas, we invite you to
            join our community on{' '}
            <a
              href="https://community.klicker.uzh.ch"
              target="_blank"
              rel="noreferrer"
            >
              https://community.klicker.uzh.ch
            </a>
            .
          </p>
        </Prose>
      </Content>
    </PageWithHeader>
  )
}

export default Roadmap
