const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

//const filenames = ['public/images/zgraggen_anja.jpg']
const filematchRegex = new RegExp('([^/]+).((jpg)|(png)|(jpeg)|(svg))/?$')

const newWidths = ['100', '300', '600', '1000']

newWidths.forEach((width) => {
  // delete existing folders, if they exist
  if (fs.existsSync('./public/images/newWidth' + width + '/')) {
    fs.rmSync('./public/images/newWidth' + width + '/', { recursive: true })
  }

  // create new directories for the images with modified sizes
  fs.mkdir('./public/images/newWidth' + width + '/', (err) => {
    if (err) {
      throw err
    }
  })

  // find all image files, convert them to all specified widths and save them in the corresponding folder
  fs.readdir('public/images/', function (err, files) {
    if (err) {
      throw err
    }
    const filenames = files.filter(function (e) {
      return (
        path.extname(e).toLowerCase() === '.jpg' ||
        path.extname(e).toLowerCase() === '.png' ||
        path.extname(e).toLowerCase() === '.jpeg.'
      )
    })

    filenames.forEach((file) => {
      const filename = file.match(filematchRegex)
      if (filename) {
        sharp('./public/images/' + file)
          .resize({ width: parseInt(width) })
          .toFile('public/images/newWidth' + width + '/' + filename[0])
      }
    })

    // execute this step only once - copy the images in full resolution to a separated folder
    if (newWidths.indexOf(width) == 0) {
      if (fs.existsSync('./public/images/originalSize/')) {
        fs.rmSync('./public/images/originalSize/', { recursive: true })
      }

      fs.mkdir('./public/images/originalSize/', (err) => {
        if (err) {
          throw err
        }
      })
      filenames.forEach((file) => {
        const filename = file.match(filematchRegex)
        if (filename) {
          sharp('./public/images/' + file).toFile(
            'public/images/originalSize/' + filename[0]
          )
        }
      })
    }
  })
})
