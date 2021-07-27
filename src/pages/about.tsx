import { useEffect } from 'react'
import RolandImage from '../../public/images/schlaefli_roland.jpg'
import DavidImage from '../../public/images/schmocker_david.jpg'
import BenjaminImage from '../../public/images/wilding_benjamin.jpg'
import AnjaImage from '../../public/images/zgraggen_anja.jpg'
import Contact from '../components/common/Contact'
import Header from '../components/common/Header'
import Title from '../components/common/Title'
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
    const par = scr.parentNode
    par.insertBefore(s, scr)
  })

  return (
    <PageWithHeader title="About Us">
      <TitleBackground>
        <Title title="About Us" />
      </TitleBackground>

      <Content>
        <Header.H2>Project Overview</Header.H2>
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1">
            <div className="p-2 font-bold text-center text-white bg-uzh-blue-80">
              Project 1
            </div>
            <div className="h-full p-2 prose bg-uzh-gray-20">
              <p>
                <span className="font-bold">Project Duration:</span> 2019-2021
                <br />
                Supported by Swissuniversities and the University of Zurich
              </p>
              <div className="font-bold">Project Goals</div>
              <ul>
                <li>
                  Conduct workshops for lecturers and students supported by
                  experts.
                </li>
                <li>
                  Implement the results of workshops and theses, in which
                  lecturers and students created their own simulations.
                </li>
                <li>
                  Develop initial guidelines for the efficient implementation of
                  simulations.
                </li>
                <li>
                  Incorporate new simulations in the regular degree programs.
                </li>
              </ul>
            </div>
          </div>

          <div className="flex-1 mt-4 sm:ml-4 sm:mt-0">
            <div className="p-2 font-bold text-center text-white bg-uzh-blue-80">
              Project 2
            </div>

            <div className="h-full p-2 prose bg-uzh-gray-20">
              <p>
                <span className="font-bold">Project Duration:</span> 2021-2023
                <br />
                Supported by Swissuniversities and the University of Zurich
              </p>
              <div className="font-bold">Project Goals</div>
              <ul>
                <li>
                  Support the creation process of digital learning games
                  (especially serious games and simulations using newly created
                  content-related, didactic and technical resources.
                </li>
                <li>
                  Establish and maintain a Game-Based Learning community for
                  higher education.
                </li>
                <li>
                  Develop an overview of Game-Based Learning in practice at the
                  University of Zurich.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Header.H2 className="mt-16">Project Team</Header.H2>
        <div>
          <div className="flex flex-col md:flex-row">
            <div className="flex-1">
              <Contact
                name="Dr. Benjaming Wilding"
                institution="Department of Banking and Finance, University of Zurich"
                role="Managing Director and Head of Teaching"
                link="https://www.bf.uzh.ch/en/persons/wilding-benjamin"
                imgSrc={BenjaminImage}
              />
            </div>

            <div className="flex-1 mt-8 sm:mt-0">
              <Contact
                name="Dr. David Schmocker"
                institution="Center for University Teaching and Learning, Digitalization and Innovation, University of Zurich"
                role=""
                link="https://www.hochschuldidaktik.uzh.ch/de/aboutus/team/schmocker-david.html"
                imgSrc={DavidImage}
              />
            </div>
          </div>
          <div className="flex flex-col mt-4 md:flex-row">
            <div className="flex-1 mt-8 sm:mt-0">
              <Contact
                name="Anja Zgraggen"
                institution="Department of Banking and Finance, University of Zurich"
                role="Program and Project Manager"
                link="https://www.bf.uzh.ch/en/persons/zgraggen-anja"
                imgSrc={AnjaImage}
              />
            </div>
            <div className="flex-1 mt-8 sm:mt-0">
              <Contact
                name="Roland Schläfli"
                institution="Department of Banking and Finance, University of Zurich"
                role="IT Project Manager and Developer"
                link="https://www.bf.uzh.ch/en/persons/schlaefli-roland"
                imgSrc={RolandImage}
              />
            </div>
          </div>
        </div>

        <Header.H2 className="mt-16">Get In Touch</Header.H2>
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
      </Content>
    </PageWithHeader>
  )
}

export default About
