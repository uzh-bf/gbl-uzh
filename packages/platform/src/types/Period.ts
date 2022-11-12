import { inputObjectType } from 'nexus'
import * as yup from 'yup'

export const PeriodFactsSchema = yup.object({
  spotTradingEnabled: yup.boolean().default(true),
  futuresTradingEnabled: yup.boolean().default(false),
  optionsTradingEnabled: yup.boolean().default(false),
  interestRate: yup.number().default(0.01),
  convenienceYield: yup.number().default(0.008),
  storageCostPerItem: yup.number().default(50),
  initialSpotPrice: yup.number(),
  randomSeed: yup.number(),
  trendE: yup.number().default(0.005),
  trendGap: yup.number().default(0.02),
})

export interface PeriodFacts extends yup.InferType<typeof PeriodFactsSchema> {}

export const PeriodFactsInput = inputObjectType({
  name: 'PeriodFactsInput',
  definition(t) {
    t.boolean('spotTradingEnabled')
    t.boolean('futuresTradingEnabled')
    t.boolean('optionsTradingEnabled')
    t.float('interestRate')
    t.float('convenienceYield')
    t.int('storageCostPerItem')
    t.int('initialSpotPrice')
    t.int('randomSeed')
    t.float('trendE')
    t.float('trendGap')
  },
})

export const PeriodSegmentFactsSchema = yup.object({
  trendE: yup.number(),
  trendGap: yup.number(),
})

export interface PeriodSegmentFacts
  extends yup.InferType<typeof PeriodSegmentFactsSchema> {}

export const PeriodSegmentFactsInput = inputObjectType({
  name: 'PeriodSegmentFactsInput',
  definition(t) {
    t.float('trendE')
    t.float('trendGap')
  },
})
