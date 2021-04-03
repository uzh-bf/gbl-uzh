import hydrate from 'next-mdx-remote/hydrate'
import Head from 'next/head'
import * as Util from '../lib/util'

interface Props {
  source: any
  frontMatter: any
}

const components = {}

export default function Page({ source, frontMatter }: Props) {
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
