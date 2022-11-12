const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

//const filenames = ['public/images/zgraggen_anja.jpg']
const filematchRegex = new RegExp('([^/]+).((jpg)|(png)|(jpeg))/?$')

// change these numbers in the cleanup function and in the loader as well
const responsiveSizes = [32, 64, 128, 256, 384, 640, 828, 1200, 1920, 3840]

function isImage(pathName) {
  return (
    path.extname(pathName).toLowerCase() === '.jpg' ||
    path.extname(pathName).toLowerCase() === '.png' ||
    path.extname(pathName).toLowerCase() === '.jpeg'
  )
}

function isDir(pathName) {
  try {
    return fs.lstatSync(pathName).isDirectory()
  } catch {
    return false
  }
}

async function resizeImage(file, newWidth, subfolder) {
  subfolderPath = subfolder ? `${subfolder}/` : ''

  const filename = file.match(filematchRegex)

  if (filename) {
    const source = sharp(`./public/images/${subfolderPath}${file}`)

    return source
      .resize({ width: newWidth, withoutEnlargement: true })
      .toFile(
        `./public/images/responsive_${newWidth}/${subfolderPath}${filename[0]}`
      )
  }

  return Promise.resolve()
}

async function optimize() {
  responsiveSizes.forEach((width) => {
    // delete existing folders, if they exist
    if (fs.existsSync(`./public/images/responsive_${width}/`)) {
      fs.rmSync(`./public/images/responsive_${width}/`, { recursive: true })
    }

    // create new directories for the images with modified sizes
    fs.mkdirSync(`./public/images/responsive_${width}/`)
  })

  // find all image files, convert them to all specified widths and save them in the corresponding folder
  await Promise.all(
    fs.readdirSync('public/images/').flatMap(async (pathName) => {
      if (
        isDir(`./public/images/${pathName}/`) &&
        !pathName.includes('responsive_')
      ) {
        responsiveSizes.forEach((width) =>
          fs.mkdirSync(`./public/images/responsive_${width}/${pathName}/`)
        )

        return fs
          .readdirSync(`public/images/${pathName}/`)
          .map((file) =>
            responsiveSizes.map((width) => resizeImage(file, width, pathName))
          )
      }

      if (isImage(pathName)) {
        return responsiveSizes.map((width) => resizeImage(pathName, width))
      }
    })
  )
}

optimize()
