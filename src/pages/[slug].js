import hydrate from 'next-mdx-remote/hydrate'
import Head from 'next/head'

import * as Util from '../lib/util'

const components = {}

export default function Page({ source, frontMatter }) {
  const content = hydrate(source, { components })

  return (
    <div>
      <Head>
        <title>GBL@UZH - {frontMatter.title}</title>
      </Head>

      <main>
        <h1>{frontMatter.title}</h1>
        {content}
      </main>
    </div>
  )
}

export const getStaticProps = Util.getStaticProps('pages')
export const getStaticPaths = Util.getStaticPaths('pages')
