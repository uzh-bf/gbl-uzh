import hydrate from 'next-mdx-remote/hydrate'
import Head from 'next/head'
import * as Util from '../../lib/util'

interface Props {
  source: any
  frontMatter: any
}

const components = {}

export default function Game({ source, frontMatter }: Props) {
  const content = hydrate(source, { components })

  return (
    <div>
      <Head>
        <title>GBL@UZH - {frontMatter.title}</title>
      </Head>

      <main className="p-4 prose">
        <h1>{frontMatter.title}</h1>
        <h2>{frontMatter.subtitle}</h2>
        <img
          src={frontMatter.thumbnail}
          height="200px"
          width="300px"
          alt="thumbnail"
        />
        <ul>
          {frontMatter.objectives.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
        <ul>
          {frontMatter.keywords.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
        <ul>
          {frontMatter.language.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
        {content}
        {frontMatter.imprint}
        {frontMatter.contact}
      </main>
    </div>
  )
}

export const getStaticProps = Util.getStaticProps('games')
export const getStaticPaths = Util.getStaticPaths('games')
