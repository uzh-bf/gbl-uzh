import fs from 'fs'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'
import wikiLinkPlugin from 'remark-wiki-link'

const PREFIX = '../quartz/content/'

const isMarkdownFile = (filename: string) => /\.md?$/.test(filename)

const toSlug = (filename: string) =>
  filename
    .replace(/\.md?$/, '')
    .replace(/\s/g, '-')
    .toLowerCase()

const wikiPlugin: any = [
  wikiLinkPlugin,
  {
    aliasDivider: '|',
    permalinks: [],
    hrefTemplate: (permalink: string) =>
      `/kb?initialPath=${encodeURIComponent(permalink)}`,
    pageResolver: (name: string) => [name.replace(' ', '+')],
  },
]

async function serializeMarkdown(source: Buffer | string) {
  const { content, data } = matter(source.toString())
  const mdxSource = await serialize(content, {
    mdxOptions: { remarkPlugins: [wikiPlugin] },
  })

  return {
    ...mdxSource,
    frontmatter: data,
  }
}

export function getStaticProps(dir_name: string) {
  return async ({ params }: any) => {
    const dirPath = path.join(process.cwd(), `${PREFIX}/${dir_name}/`)
    const filename = fs
      .readdirSync(dirPath)
      .find((file) => isMarkdownFile(file) && toSlug(file) === params.slug)

    if (!filename) return { notFound: true }

    const mdxPath = path.join(
      process.cwd(),
      `${PREFIX}/${dir_name}/${filename}`
    )
    const source = fs.readFileSync(mdxPath)
    const mdxSource = await serializeMarkdown(source)
    return {
      props: {
        source: mdxSource,
      },
    }
  }
}

export function getStaticPaths(dir_name: string) {
  return async () => {
    const paths = fs
      .readdirSync(path.join(process.cwd(), `${PREFIX}/${dir_name}/`))
      .filter(isMarkdownFile)
      .map(toSlug)
      .map((slug) => ({ params: { slug } }))

    return { paths, fallback: false }
  }
}

export function getStaticPropsSinglePage(dir_name: string, slug: string) {
  return async () => {
    const mdxPath = path.join(process.cwd(), `${PREFIX}/${dir_name}/${slug}.md`)
    const source = fs.readFileSync(mdxPath)
    const mdxSource = await serializeMarkdown(source)
    return {
      props: {
        source: mdxSource,
      },
    }
  }
}

// getStaticProps function to parse all files within one folder
export function getStaticPropsFolder(
  folder: string,
  parentfile_dir?: string,
  parentfile?: string
) {
  return async () => {
    let mdxSources = new Array()
    let fileMissingArr = new Array()

    let slugArr = []

    // get filenames directly from parent config list (including correct order)
    if (parentfile_dir && parentfile) {
      const mdxPathParent = path.join(
        process.cwd(),
        `${PREFIX}/${parentfile_dir}/${parentfile}.md`
      )
      const sourceParent = fs.readFileSync(mdxPathParent)
      slugArr = matter(sourceParent).data.childrenFiles.map(
        (filename: any) => filename.name
      )
    } else {
      slugArr = fs
        .readdirSync(PREFIX + folder)
        .map((item) => item.split('.')[0])
    }

    for (let i = 0; i < slugArr.length; i++) {
      const mdxPath = path.join(
        process.cwd(),
        `${PREFIX}/${folder}/${slugArr[i]}.md`
      )

      let source: Buffer
      try {
        source = fs.readFileSync(mdxPath)
        fileMissingArr.push(false)
      } catch (e) {
        source = Buffer.from('no data available')
        fileMissingArr.push(true)
      }

      let temp2 = await serializeMarkdown(source)
      mdxSources.push(temp2)
    }

    return {
      props: {
        sourceArr: mdxSources,
        filenames: slugArr,
        fileMissingArr: fileMissingArr,
      },
    }
  }
}

// getStaticPropsFunction to parse the content of multiple folders
export function getStaticPropsFolders(folders: Array<string>) {
  return async () => {
    let mdxSources = new Array()
    let fileMissingArr = new Array()

    const slugArrs = folders.map((folder: string) =>
      fs.readdirSync(PREFIX + folder).map((item) => item.split('.')[0])
    )

    // attention: for loop is required in order to enable async functions such as 'serialize'
    for (let k = 0; k < slugArrs.length; k++) {
      mdxSources[k] = new Array()
      fileMissingArr[k] = new Array()

      for (let i = 0; i < slugArrs[k].length; i++) {
        const mdxPath = path.join(
          process.cwd(),
          `${PREFIX}/${folders[k]}/${slugArrs[k][i]}.md`
        )

        let source: Buffer
        try {
          source = fs.readFileSync(mdxPath)
          fileMissingArr[k].push(false)
        } catch (e) {
          source = Buffer.from('no data available')
          fileMissingArr[k].push(true)
        }

        let temp2 = await serializeMarkdown(source)
        mdxSources[k].push(temp2)
      }
    }

    return {
      props: {
        sourceArr: mdxSources,
        filenames: slugArrs,
        fileMissingArr: fileMissingArr,
      },
    }
  }
}
