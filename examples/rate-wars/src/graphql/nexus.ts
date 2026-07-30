import { makeSchema } from 'nexus'
import path from 'path'
import * as types from '.'

export const schema = makeSchema({
  types,
  outputs: {
    typegen: path.join(__dirname, 'generated/nexus-typegen.ts'),
    schema: path.join(__dirname, 'generated/schema.graphql'),
  },
})
