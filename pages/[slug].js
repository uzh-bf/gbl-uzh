import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import renderToString from 'next-mdx-remote/render-to-string'
import hydrate from 'next-mdx-remote/hydrate'
import Head from 'next/head'

const components = {}

export default function Page({ source, frontMatter }) {
  const content = hydrate(source, { components })

  return (
    <div>
      <Head>
        <title>Create Next App</title>
      </Head>

      <main>
        <h1>{frontMatter.title}</h1>
        {content}
      </main>
    </div>
  )
}

export async function getStaticProps({ params }) {
  const mdxPath = path.join(process.cwd(), `content/pages/${params.slug}.mdx`)
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

export async function getStaticPaths() {
  const paths = fs
    .readdirSync(path.join(process.cwd(), 'content/pages/'))
    .filter((path) => /\.mdx?$/.test(path))
    .map((path) => path.replace(/\.mdx?$/, ''))
    .map((slug) => ({ params: { slug } }))

  return { paths, fallback: false }
}
