import { inputObjectType } from 'nexus'
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

export const PeriodFactsScenarioInput = inputObjectType({
  name: 'PeriodFactsScenarioInput',
  definition(t) {
    t.int('seed', { default: 1 })
    t.float('targetInflation', { default: 2.0 })
    t.float('naturalUnemployment', { default: 5.0 })
    t.float('lambda', { default: 1.0 })
    t.float('initialInflation', { default: 4.0 })
    t.float('initialUnemployment', { default: 4.0 })
    t.float('initialGrowth', { default: 3.0 })
  },
})

export const PeriodFactsInput = inputObjectType({
  name: 'PeriodFactsInput',
  definition(t) {
    t.int('rollsPerSegment', { default: 1 })
    t.field('scenario', {
      type: PeriodFactsScenarioInput,
      default: {
        seed: 1,
        targetInflation: 2.0,
        naturalUnemployment: 5.0,
        lambda: 1.0,
        initialInflation: 4.0,
        initialUnemployment: 4.0,
        initialGrowth: 3.0,
      },
    })
  },
})

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

export const PeriodSegmentFactsInput = inputObjectType({
  name: 'PeriodSegmentFactsInput',
  definition(t) {
    t.float('shock')
    t.int('roll')
    t.float('supplyShock')
    t.float('demandShock')
    t.string('eventName')
  },
})
