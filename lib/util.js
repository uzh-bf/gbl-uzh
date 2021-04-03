import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import renderToString from 'next-mdx-remote/render-to-string'

export function getStaticProps(dir_name, components = {}) {
  return async ({ params }) => {
    const mdxPath = path.join(
      process.cwd(),
      `content/${dir_name}/${params.slug}.mdx`
    )
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
}

export function getStaticPaths(dir_name) {
  return async () => {
    const paths = fs
      .readdirSync(path.join(process.cwd(), `content/${dir_name}/`))
      .filter((path) => /\.mdx?$/.test(path))
      .map((path) => path.replace(/\.mdx?$/, ''))
      .map((slug) => ({ params: { slug } }))

    return { paths, fallback: false }
  }
}
