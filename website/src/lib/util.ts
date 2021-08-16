import fs from 'fs'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'

export function getStaticProps(dir_name) {
  return async ({ params }) => {
    // slugs come in like "portfolio-management-game"
    // but we want to read from files like "Portfolio Management Game.md"
    const filenameTitleCase = params.slug
      .trim()
      .replace(/-/g, ' ')
      .toLowerCase()
      // all independent words should begin with a capital character
      .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))

    const mdxPath = path.join(
      process.cwd(),
      `../kb/${dir_name}/${filenameTitleCase}.md`
    )
    const source = fs.readFileSync(mdxPath)
    const { content, data } = matter(source)
    const mdxSource = await serialize(content, { scope: data })
    return { props: { source: mdxSource, frontMatter: data } }
  }
}

export function getStaticPaths(dir_name) {
  return async () => {
    const paths = fs
      .readdirSync(path.join(process.cwd(), `../kb/${dir_name}/`))
      .filter((p) => /\.md?$/.test(p))
      .map((p) =>
        p
          .replace(/\.md?$/, '')
          .replace(/\s/g, '-')
          .toLowerCase()
      )
      .map((slug) => ({ params: { slug } }))

    return { paths, fallback: false }
  }
}
