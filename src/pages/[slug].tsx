import { MDXRemote } from 'next-mdx-remote'
import Head from 'next/head'
import * as Util from '../lib/util'

interface Props {
  source: any
  frontMatter: any
}

const components = {}

export default function Page({ source, frontMatter }: Props) {
  return (
    <div>
      <Head>
        <title>GBL@UZH - {frontMatter.title}</title>
      </Head>

      <main>
        <h1>{frontMatter.title}</h1>
        <MDXRemote {...source} components={components} />
      </main>
    </div>
  )
}

export const getStaticProps = Util.getStaticProps('pages')
export const getStaticPaths = Util.getStaticPaths('pages')
