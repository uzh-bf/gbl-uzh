import * as yup from 'yup'

export const PlayerFactsSchema = yup.object({
  location: yup.string().default('ZH'),
  color: yup.string().default('White'),
  avatar: yup.string().default(''),
})

export interface PlayerFacts extends yup.InferType<typeof PlayerFactsSchema> {}
