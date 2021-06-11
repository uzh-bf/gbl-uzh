import { useEffect } from 'react'
import Card from '../components/common/Card'
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

      <div className="max-w-6xl p-4 m-auto">
        <Header.H2>Vision</Header.H2>
        <p className="mb-8 prose max-w-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, hic
          et. Dolorem, consectetur explicabo corporis omnis repudiandae autem
          repellendus voluptatum quam id magni provident dolorum, aliquid fugit
          saepe? Quaerat, eligendi.
        </p>

        <Header.H2>Focus Areas</Header.H2>
        <div>
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 md:flex-initial md:w-60">
              <Card name="GBL @ UZH" />
            </div>
            <p className="flex-1 prose md:pl-4 max-w-none">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
              rerum ea assumenda temporibus incidunt ratione recusandae est
              officiis sapiente, quos quia sint delectus, nobis eum repudiandae
              aliquid reiciendis nam nesciunt?
              <ul>
                <li>...</li>
                <li>...</li>
              </ul>
            </p>
          </div>

          <div className="flex flex-col mt-4 md:flex-row">
            <div className="flex-1 md:flex-initial md:w-60">
              <Card name="Game Development Process" />
            </div>
            <p className="flex-1 prose md:pl-4 max-w-none">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
              rerum ea assumenda temporibus incidunt ratione recusandae est
              officiis sapiente, quos quia sint delectus, nobis eum repudiandae
              aliquid reiciendis nam nesciunt?
              <ul>
                <li>...</li>
                <li>...</li>
              </ul>
            </p>
          </div>

          <div className="flex flex-col mt-4 md:flex-row">
            <div className="flex-1 md:flex-initial md:w-60">
              <Card name="Game Development Toolbox" />
            </div>
            <p className="flex-1 prose md:pl-4 max-w-none">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
              rerum ea assumenda temporibus incidunt ratione recusandae est
              officiis sapiente, quos quia sint delectus, nobis eum repudiandae
              aliquid reiciendis nam nesciunt?
              <ul>
                <li>...</li>
                <li>...</li>
              </ul>
            </p>
          </div>

          <div className="flex flex-col mt-4 md:flex-row">
            <div className="flex-1 md:flex-initial md:w-60">
              <Card name="Simulation Platform" />
            </div>
            <p className="flex-1 prose md:pl-4 max-w-none">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
              rerum ea assumenda temporibus incidunt ratione recusandae est
              officiis sapiente, quos quia sint delectus, nobis eum repudiandae
              aliquid reiciendis nam nesciunt?
              <ul>
                <li>...</li>
                <li>...</li>
              </ul>
            </p>
          </div>

          <div className="flex flex-col mt-4 md:flex-row">
            <div className="flex-1 md:flex-initial md:w-60">
              <Card name="GBL Community" />
            </div>
            <p className="flex-1 prose md:pl-4 max-w-none">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
              rerum ea assumenda temporibus incidunt ratione recusandae est
              officiis sapiente, quos quia sint delectus, nobis eum repudiandae
              aliquid reiciendis nam nesciunt?
              <ul>
                <li>...</li>
                <li>...</li>
              </ul>
            </p>
          </div>
        </div>

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
