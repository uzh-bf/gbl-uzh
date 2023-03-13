const fs = require('fs')
const path = require('path')

try {
  fs.copyFileSync(
    path.resolve(
      __dirname,
      '../node_modules/@gbl-uzh/platform/dist/schema.prisma'
    ),
    path.resolve(__dirname, './schema.prisma')
  )
} catch {
  fs.copyFileSync(
    path.resolve(
      __dirname,
      '../../../node_modules/@gbl-uzh/platform/dist/schema.prisma'
    ),
    path.resolve(__dirname, './schema.prisma')
  )
}

export {}
