import { H1, H2, Prose } from '@uzh-bf/design-system'
import { useEffect } from 'react'
import RolandImage from '../../public/images/schlaefli_roland.jpg'
import DavidImage from '../../public/images/schmocker_david.jpg'
import BenjaminImage from '../../public/images/wilding_benjamin.jpg'
import AnjaImage from '../../public/images/zgraggen_anja.jpg'
import Contact from '../components/common/Contact'
import ProjectPhase from '../components/common/ProjectPhase'
import TitleBackground from '../components/common/TitleBackground'
import Content from '../components/Content'
import PageWithHeader from '../components/PageWithHeader'

function About() {
  useEffect(() => {
    const s: any = document.createElement('script')
    const options = {
      id: 13,
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
    <PageWithHeader title="About Us">
      <TitleBackground>
        <H1 className={{ root: 'max-w-6xl mx-auto lg:pl-4' }}>About Us</H1>
      </TitleBackground>

      <Content>
        <H2>Project Overview</H2>
        <div className="flex flex-col sm:flex-row">
          <ProjectPhase duration="2019-2021" title="Project 1">
            <li>
              Conduct workshops for lecturers and students supported by experts.
            </li>
            <li>
              Implement the results of workshops and theses, in which lecturers
              and students created their own simulations.
            </li>
            <li>
              Develop initial guidelines for the efficient implementation of
              simulations.
            </li>
            <li>Incorporate new simulations in the regular degree programs.</li>
          </ProjectPhase>
          <ProjectPhase duration="2021-2023" title="Project 2">
            <li>
              Support the creation process of digital learning games (especially
              serious games and simulations using newly created content-related,
              didactic and technical resources.
            </li>
            <li>
              Establish and maintain a Game-Based Learning community for higher
              education.
            </li>
            <li>
              Develop an overview of Game-Based Learning in practice at the
              University of Zurich.
            </li>
          </ProjectPhase>
        </div>

        <H2 className={{ root: 'mt-8' }}>Project Team</H2>
        <div className="grid gap-4 md:grid-cols-2">
          <Contact
            name="Dr. Benjamin Wilding"
            institution="Department of Banking and Finance, University of Zurich"
            role="Managing Director and Head of Teaching"
            link="https://www.bf.uzh.ch/en/persons/wilding-benjamin"
            imgSrc={BenjaminImage}
          />

          <Contact
            name="Dr. David Schmocker"
            institution="Center for University Teaching and Learning, Digitalization and Innovation, University of Zurich"
            role=""
            link="https://www.le.uzh.ch/en/about-us/Community/davidschmocker"
            imgSrc={DavidImage}
          />

          <Contact
            name="Anja Zgraggen"
            institution="Department of Banking and Finance, University of Zurich"
            role="Program and Project Manager"
            link="https://www.bf.uzh.ch/en/persons/zgraggen-anja"
            imgSrc={AnjaImage}
          />

          <Contact
            name="Roland Schläfli"
            institution="Department of Banking and Finance, University of Zurich"
            role="IT Project Manager and Developer"
            link="https://www.bf.uzh.ch/en/persons/schlaefli-roland"
            imgSrc={RolandImage}
          />
        </div>

        <H2 className={{ root: 'mt-8' }}>Get In Touch</H2>
        <Prose>
          <p className="mb-4 prose max-w-none">
            If you would like to contact our project team, please fill out the
            following form and we will gladly get in touch.
          </p>
          <div className="max-w-lg border">
            <div id="c7">
              Fill in the{' '}
              <a href="https://www.bf-tools.uzh.ch/applications/easyforms/index.php?r=app%2Fform&id=13">
                online form
              </a>
              .
            </div>
          </div>
        </Prose>
      </Content>
    </PageWithHeader>
  )
}

export default About
