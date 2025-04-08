import { inputObjectType } from 'nexus'
import * as yup from 'yup'

export const GameFactsSchema = yup.object({})

export interface GameFacts extends yup.InferType<typeof GameFactsSchema> {}

export const GameFactsInput = inputObjectType({
  name: 'GameFactsInput',
  definition(t) {},
})
