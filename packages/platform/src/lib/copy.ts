const fs = require('fs-extra')
const path = require('path')

fs.copy(
  path.resolve(__dirname, '../../prisma/schema.prisma'),
  path.resolve(__dirname, '../../dist/schema.prisma')
)

fs.copy(
  path.resolve(__dirname, '../../src/ops'),
  path.resolve(__dirname, '../../dist/ops')
)
