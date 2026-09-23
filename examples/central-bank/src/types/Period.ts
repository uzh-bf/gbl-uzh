import * as yup from 'yup'

export const PeriodFactsSchema = yup.object({
  rollsPerSegment: yup.number().positive().integer().default(1),
  scenario: yup
    .object({
      seed: yup.number().integer().default(1),
      targetInflation: yup.number().default(2.0),
      naturalUnemployment: yup.number().default(5.0),
      lambda: yup.number().default(1.0),
      initialInflation: yup.number().default(4.0),
      initialUnemployment: yup.number().default(4.0),
      initialGrowth: yup.number().default(3.0),
    })
    .required(),
})

export interface PeriodFacts extends yup.InferType<typeof PeriodFactsSchema> {}

export const PeriodSegmentFactsSchema = yup.object({
  shock: yup.number(),
  roll: yup.number().integer(),
  supplyShock: yup.number(),
  demandShock: yup.number(),
  eventName: yup.string(),
})

export interface PeriodSegmentFacts extends yup.InferType<
  typeof PeriodSegmentFactsSchema
> {}
