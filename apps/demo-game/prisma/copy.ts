const fs = require('fs')
const path = require('path')

const workspaceSchema = path.resolve(
  __dirname,
  '../node_modules/@gbl-uzh/platform/dist/schema.prisma'
)
const rootSchema = path.resolve(
  __dirname,
  '../../../node_modules/@gbl-uzh/platform/dist/schema.prisma'
)
const source = fs.existsSync(workspaceSchema) ? workspaceSchema : rootSchema
const destination = path.resolve(__dirname, './schema/platform.prisma')

const platformOutput = 'output   = "../src/generated/prisma"'
const sourceSchema = fs.readFileSync(source, 'utf8')

if (!sourceSchema.includes(platformOutput)) {
  throw new Error(`Expected Prisma Client output not found in ${source}`)
}

const schema = sourceSchema.replace(
  platformOutput,
  'output   = "../../src/generated/prisma"'
)

fs.writeFileSync(destination, schema)

export {}
