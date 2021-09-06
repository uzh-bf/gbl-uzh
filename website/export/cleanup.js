const fs = require('fs')
const path = require('path')
const newWidths = [32, 64, 128, 256, 384, 640, 828, 1200, 1920, 3840]

newWidths.forEach((width) => {
  // delete existing folders, if they exist
  if (fs.existsSync(`./public/images/responsive_${width}/`)) {
    fs.rmSync(`./public/images/responsive_${width}/`, { recursive: true })
  }
})
