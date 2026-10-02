import * as yup from 'yup'

export const GameFactsSchema = yup.object({
  myInt: yup.number().integer().required().default(0),
  actionCounter: yup.number().integer().optional(),
})

export interface GameFacts extends yup.InferType<typeof GameFactsSchema> {}
