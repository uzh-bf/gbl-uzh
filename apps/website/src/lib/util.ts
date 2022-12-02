import fs from 'fs'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'

export function getStaticProps(dir_name: string) {
  return async ({ params }: any) => {
    // slugs come in like "portfolio-management-game"
    // but we want to read from files like "Portfolio Management Game.md"
    const filenameTitleCase = params.slug
      .trim()
      .replace(/-/g, ' ')
      .toLowerCase()
      // all independent words should begin with a capital character
      .replace(/\w\S*/g, (w: any) =>
        w.replace(/^\w/, (c: any) => c.toUpperCase())
      )

    const mdxPath = path.join(
      process.cwd(),
      `../kb/${dir_name}/${filenameTitleCase}.md`
    )
    const source = fs.readFileSync(mdxPath)
    const { content, data } = matter(source)
    const mdxSource = await serialize(content)
    return {
      props: {
        source: mdxSource,
        frontMatter: data,
      },
    }
  };
}

export function getStaticPaths(dir_name: string) {
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
  };
}

export function getStaticPropsSinglePage(dir_name: string, slug: string) {
  return async () => {
    const mdxPath = path.join(process.cwd(), `../kb/${dir_name}/${slug}.md`)
    const source = fs.readFileSync(mdxPath)
    const { content, data } = matter(source)
    const mdxSource = await serialize(content)
    return {
      props: {
        source: mdxSource,
        frontMatter: data,
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
    let dataHandles = new Array()
    let fileMissingArr = new Array()

    let slugArr = []

    // get filenames directly from parent config list (including correct order)
    if (parentfile_dir && parentfile) {
      const mdxPathParent = path.join(
        process.cwd(),
        `../kb/${parentfile_dir}/${parentfile}.md`
      )
      const sourceParent = fs.readFileSync(mdxPathParent)
      slugArr = matter(sourceParent).data.childrenFiles.map(
        (filename: any) => filename.name
      )
    } else {
      slugArr = fs
        .readdirSync('../kb/' + folder)
        .map((item) => item.split('.')[0])
    }

    for (let i = 0; i < slugArr.length; i++) {
      const mdxPath = path.join(
        process.cwd(),
        `../kb/${folder}/${slugArr[i]}.md`
      )

      let source: Buffer
      try {
        source = fs.readFileSync(mdxPath)
        fileMissingArr.push(false)
      } catch (e) {
        source = Buffer.from('no data available')
        fileMissingArr.push(true)
      }

      const { content, data } = matter(source)
      dataHandles.push(data)
      let temp2 = await serialize(content)
      mdxSources.push(temp2)
    }

    // order based on ordering attribute, if one is available
    let outputArr = new Array(dataHandles.length)
    if (dataHandles[0].order) {
      dataHandles.forEach((element: any) =>
        outputArr.splice(element.order, 1, element)
      )
    } else {
      outputArr = [...dataHandles]
    }

    return {
      props: {
        sourceArr: mdxSources,
        frontMatterArr: parentfile_dir && parentfile ? dataHandles : outputArr,
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
    let dataHandlesArr = new Array()
    let fileMissingArr = new Array()

    const slugArrs = folders.map((folder: string) =>
      fs.readdirSync('../kb/' + folder).map((item) => item.split('.')[0])
    )

    // attention: for loop is required in order to enable async functions such as 'serialize'
    for (let k = 0; k < slugArrs.length; k++) {
      mdxSources[k] = new Array()
      dataHandlesArr[k] = new Array()
      fileMissingArr[k] = new Array()

      for (let i = 0; i < slugArrs[k].length; i++) {
        const mdxPath = path.join(
          process.cwd(),
          `../kb/${folders[k]}/${slugArrs[k][i]}.md`
        )

        let source: Buffer
        try {
          source = fs.readFileSync(mdxPath)
          fileMissingArr[k].push(false)
        } catch (e) {
          source = Buffer.from('no data available')
          fileMissingArr[k].push(true)
        }

        const { content, data } = matter(source)
        dataHandlesArr[k].push(data)
        let temp2 = await serialize(content)
        mdxSources[k].push(temp2)
      }
    }

    // order based on ordering attribute, if one is available (is decided separately for each folder)
    let outputArr = new Array()
    dataHandlesArr.forEach((dataHandles: any) => {
      const index = dataHandlesArr.indexOf(dataHandles)
      outputArr[index] = new Array(dataHandles.length)
      if (dataHandles[0].order) {
        dataHandles.forEach((element: any) => {
          outputArr[index].splice(element.order, 1, element)
        })
      } else {
        outputArr[index] = [...dataHandlesArr[index]]
      }
    })

    return {
      props: {
        sourceArr: mdxSources,
        frontMatterArr: outputArr,
        filenames: slugArrs,
        fileMissingArr: fileMissingArr,
      },
    }
  }
}
