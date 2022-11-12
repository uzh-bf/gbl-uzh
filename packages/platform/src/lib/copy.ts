const fs = require('fs')
const path = require('path')

fs.copyFileSync(
  path.resolve(__dirname, '../../prisma/schema.prisma'),
  path.resolve(__dirname, '../../dist/schema.prisma')
)
