import hydrate from 'next-mdx-remote/hydrate'
import Head from 'next/head'
import Image from 'next/image'

import * as Util from '../../lib/util'

const components = {}

export default function Game({ source, frontMatter }) {
  const content = hydrate(source, { components })

  return (
    <div>
      <Head>
        <title>GBL@UZH - {frontMatter.title}</title>
      </Head>

      <main className="p-4">
        <h1>{frontMatter.title}</h1>
        <h2>{frontMatter.subtitle}</h2>
        <Image
          src={frontMatter.thumbnail}
          height="200px"
          width="300px"
          layout="intrinsic"
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
