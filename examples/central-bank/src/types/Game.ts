import { inputObjectType } from 'nexus'
import * as yup from 'yup'

export const GameFactsSchema = yup.object({
  actionCounter: yup.number().integer().optional(),
})

export interface GameFacts extends yup.InferType<typeof GameFactsSchema> {}

export const GameFactsInput = inputObjectType({
  name: 'GameFactsInput',
  definition(t) {
    t.nullable.int('actionCounter', { default: 0 })
  },
})
