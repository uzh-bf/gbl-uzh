import { useEffect } from 'react'
import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import PageWithHeader from '../components/PageWithHeader'

function About() {
  useEffect(() => {
    const s: any = document.createElement('script')
    const options = {
      id: 13,
      theme: 0,
      container: 'c7',
      height: '479px',
      form:
        '//www.bf-tools.uzh.ch/applications/easyforms/index.php?r=app%2Fembed',
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

      <div className="max-w-6xl p-4 m-auto">
        <Header.H2>Projects</Header.H2>
        ...
        <Header.H2>Project Team</Header.H2>
        ...
        <Header.H2>Get In Touch</Header.H2>
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
      </div>
    </PageWithHeader>
  )
}

export default About
