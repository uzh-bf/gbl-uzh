const fs = require('fs')
const path = require('path')
const newWidths = ['100', '300', '600', '1000']

newWidths.forEach((width) => {
  // delete existing folders, if they exist
  if (fs.existsSync(`./public/images/newWidth${width}/`)) {
    fs.rmSync(`./public/images/newWidth${width}/`, { recursive: true })
  }
})
