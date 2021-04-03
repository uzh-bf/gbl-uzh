import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import renderToString from 'next-mdx-remote/render-to-string'
import hydrate from 'next-mdx-remote/hydrate'
import Head from 'next/head'

const components = {}

export default function Home({ source, frontMatter }) {
  const content = hydrate(source, { components })

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
      </Head>

      <main>
        <h1>{frontMatter.title}</h1>
        {content}
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const mdxPath = path.resolve('content/pages/home.mdx')
  const source = fs.readFileSync(mdxPath)
  const { content, data } = matter(source)
  const mdxSource = await renderToString(content, {
    components,
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: data,
  })
  return { props: { source: mdxSource, frontMatter: data } }
}
