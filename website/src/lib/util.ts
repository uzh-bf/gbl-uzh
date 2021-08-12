import fs from 'fs'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'

export function getStaticProps(dir_name, components = {}) {
  return async ({ params }) => {
    const mdxPath = path.join(
      process.cwd(),
      `content/${dir_name}/${params.slug}.mdx`
    )
    const source = fs.readFileSync(mdxPath)
    const { content, data } = matter(source)
    const mdxSource = await serialize(content)
    return { props: { source: mdxSource, frontMatter: data } }
  }
}

export function getStaticPaths(dir_name) {
  return async () => {
    const paths = fs
      .readdirSync(path.join(process.cwd(), `content/${dir_name}/`))
      .filter((p) => /\.mdx?$/.test(p))
      .map((p) => p.replace(/\.mdx?$/, ''))
      .map((slug) => ({ params: { slug } }))

    return { paths, fallback: false }
  }
}
