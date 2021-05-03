import { useEffect } from 'react'
import Header from '../components/common/Header'
import Title from '../components/common/Title'
import TitleBackground from '../components/common/TitleBackground'
import PageWithHeader from '../components/PageWithHeader'

function Roadmap() {
  useEffect(() => {
    const s: any = document.createElement('script')
    const options = {
      id: 12,
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
    <PageWithHeader title="Roadmap">
      <TitleBackground>
        <Title title="Project Roadmap" />
      </TitleBackground>

      <div className="max-w-6xl p-4 m-auto">
        <Header.H2>Current Focus Areas</Header.H2>
        <p className="prose max-w-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora rerum
          ea assumenda temporibus incidunt ratione recusandae est officiis
          sapiente, quos quia sint delectus, nobis eum repudiandae aliquid
          reiciendis nam nesciunt?
        </p>

        <Header.H2 className="mt-8">Future Focus Areas</Header.H2>
        <p className="prose max-w-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora rerum
          ea assumenda temporibus incidunt ratione recusandae est officiis
          sapiente, quos quia sint delectus, nobis eum repudiandae aliquid
          reiciendis nam nesciunt?
        </p>

        <Header.H2 className="mt-8">Get Involved</Header.H2>
        <p className="mb-4 prose max-w-none">
          We strive to develop our roadmap and goals based on the needs of the
          community. If you are interested in game-based learning and would like
          to be involved in the project, please fill out the following form to
          join our user group.
        </p>
        <div className="max-w-lg border">
          <div id="c7">
            Fill in the{' '}
            <a href="https://www.bf-tools.uzh.ch/applications/easyforms/index.php?r=app%2Fform&id=12">
              online form
            </a>
            .
          </div>
        </div>
      </div>
    </PageWithHeader>
  )
}

export default Roadmap
