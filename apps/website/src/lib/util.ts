import fs from 'fs'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'
import wikiLinkPlugin from 'remark-wiki-link'

const PREFIX = '../quartz/content/'

function markdownFilenameToSlug(filename: string) {
  return filename
    .replace(/\.md?$/, '')
    .replace(/\s/g, '-')
    .toLowerCase()
}

function getMarkdownFilenames(dirName: string) {
  return fs
    .readdirSync(path.join(process.cwd(), `${PREFIX}/${dirName}/`))
    .filter((filename) => /\.md?$/.test(filename))
}

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

export function getStaticProps(dir_name: string) {
  return async ({ params }: any) => {
    const filename = getMarkdownFilenames(dir_name).find(
      (candidate) => markdownFilenameToSlug(candidate) === params.slug
    )

    if (!filename) {
      throw new Error(`No markdown file found for ${dir_name}/${params.slug}`)
    }

    const mdxPath = path.join(
      process.cwd(),
      `${PREFIX}/${dir_name}/${filename}`
    )
    const source = fs.readFileSync(mdxPath)
    const mdxSource = await serialize(source, {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [wikiPlugin] },
    })
    return {
      props: {
        source: mdxSource,
      },
    }
  }
}

export function getStaticPaths(dir_name: string) {
  return async () => {
    const paths = getMarkdownFilenames(dir_name)
      .map(markdownFilenameToSlug)
      .map((slug) => ({ params: { slug } }))

    return { paths, fallback: false }
  }
}

export function getStaticPropsSinglePage(dir_name: string, slug: string) {
  return async () => {
    const mdxPath = path.join(process.cwd(), `${PREFIX}/${dir_name}/${slug}.md`)
    const source = fs.readFileSync(mdxPath)
    const mdxSource = await serialize(source, {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [wikiPlugin] },
    })
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

      let temp2 = await serialize(source, {
        parseFrontmatter: true,
        mdxOptions: { remarkPlugins: [wikiPlugin] },
      })
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

        let temp2 = await serialize(source, {
          parseFrontmatter: true,
          mdxOptions: { remarkPlugins: [wikiPlugin] },
        })
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
