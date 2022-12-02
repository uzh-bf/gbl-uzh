import { inputObjectType } from 'nexus'
import * as yup from 'yup'

export const PeriodFactsSchema = yup.object({
  stockTrend: yup.number().required(),
  stockVariance: yup.number().required(),
  stockGap: yup.number().required(),
})

export interface PeriodFacts extends yup.InferType<typeof PeriodFactsSchema> {}

export const PeriodFactsInput = inputObjectType({
  name: 'PeriodFactsInput',
  definition(t) {
    t.nonNull.float('stockTrend')
    t.nonNull.float('stockVariance')
    t.nonNull.float('stockGap')
  },
})

export const PeriodSegmentFactsSchema = yup.object({
  stockForecast: yup.number(),
})

interface valueTypes<T> {
  bank: T,
  bonds: T,
  stock: T
}

export interface PeriodSegmentFacts
  extends yup.InferType<typeof PeriodSegmentFactsSchema> {
    composition: valueTypes<number>,
    investmentDecision: valueTypes<boolean>,
    dieMonth1 : valueTypes<number>,
    dieMonth2 : valueTypes<number>,
    dieMonth3 : valueTypes<number>,
  }

export const PeriodSegmentFactsInput = inputObjectType({
  name: 'PeriodSegmentFactsInput',
  definition(t) {
    t.float('stockForecast')
  },
})
