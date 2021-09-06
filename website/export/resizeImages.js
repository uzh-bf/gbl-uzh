const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

//const filenames = ['public/images/zgraggen_anja.jpg']
const filematchRegex = new RegExp('([^/]+).((jpg)|(png)|(jpeg)|(svg))/?$')

// change these numbers in the cleanup function and in the loader as well
const newWidths = [32, 64, 128, 256, 384, 640, 828, 1200, 1920, 3840]

const filterImages = (files) => {
  return files.filter(function (e) {
    return (
      path.extname(e).toLowerCase() === '.jpg' ||
      path.extname(e).toLowerCase() === '.png' ||
      path.extname(e).toLowerCase() === '.jpeg'
    )
  })
}

const resizeImages = (filenames, width, subfolder) => {
  subfolderPath = subfolder ? `${subfolder}/` : ''
  filenames.forEach((file) => {
    const filename = file.match(filematchRegex)
    if (filename) {
      sharp(`./public/images/${subfolderPath}${file}`)
        .resize({ width: parseInt(width) })
        .toFile(
          `./public/images/newWidth${width}/${subfolderPath}${filename[0]}`
        )
    }
  })
}

// delete existing folders, if they exist
newWidths.forEach((width) => {
  if (fs.existsSync(`./public/images/newWidth${width}/`)) {
    fs.rmSync(`./public/images/newWidth${width}/`, { recursive: true })
  }
})

newWidths.forEach((width) => {
  // find all image files, convert them to all specified widths and save them in the corresponding folder
  fs.readdir('public/images/', function (err, files) {
    if (err) {
      throw err
    }

    // get all folder names in order to get also images within subfolders (only one level down)
    const folderNames = files.filter(function (e) {
      return (
        path.extname(e).toLowerCase() !== '.jpg' &&
        path.extname(e).toLowerCase() !== '.png' &&
        path.extname(e).toLowerCase() !== '.jpeg' &&
        path.extname(e).toLowerCase() !== '.svg'
      )
    })

    // create new directories for the images with modified sizes
    fs.mkdir(`./public/images/newWidth${width}/`, (err) => {
      if (err) {
        throw err
      }
    })

    // create resized images for all files on the top-level of the /public/images folder
    resizeImages(filterImages(files), width)

    // create resized images for all files in a subfolder one level deep
    folderNames.forEach((folderName) => {
      fs.readdir(
        `public/images/${folderName}/`,
        function (err, filesSubfolder) {
          if (err) {
            throw err
          }

          fs.mkdir(`./public/images/newWidth${width}/${folderName}/`, (err) => {
            if (err) {
              throw err
            }
          })

          // create resized images for all files on the top-level of the /public/images folder
          resizeImages(filterImages(filesSubfolder), width, folderName)
        }
      )
    })
  })
})
