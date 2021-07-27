import Image from 'next/image'
import { useEffect } from 'react'
import ProjectImage from '../../public/images/projects.png'
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
        <Image src={ProjectImage} alt="Projects" placeholder="blur" />

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
