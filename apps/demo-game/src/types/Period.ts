import { inputObjectType } from 'nexus'
import * as yup from 'yup'

const TREND_STOCKS = 0.0065
const TREND_BONDS = 0.0031
const VARIANCE_STOCKS = 0.0034
const VARIANCE_BONDS = 0.0001
const INTEREST_BANK = 0.002

export const PeriodFactsSchema = yup.object({
  rollsPerSegment: yup.number().positive().integer().default(3),
  scenario: yup
    .object({
      seed: yup.number().integer().default(0),
      trendStocks: yup.number().required(),
      trendBonds: yup.number().required(),
      varianceStocks: yup.number().positive().required(),
      varianceBonds: yup.number().positive().required(),
      interestBank: yup.number().required(),
    })
    .required(),
})

export interface PeriodFacts extends yup.InferType<typeof PeriodFactsSchema> {}

export const PeriodFactsScenarioInput = inputObjectType({
  name: 'PeriodFactsScenarioInput',
  definition(t) {
    t.int('seed', { default: 0 })
    t.float('trendStocks', { default: TREND_STOCKS })
    t.float('trendBonds', { default: TREND_BONDS })
    t.float('varianceStocks', { default: VARIANCE_STOCKS })
    t.float('varianceBonds', { default: VARIANCE_BONDS })
    t.float('interestBank', { default: INTEREST_BANK })
  },
})

export const PeriodFactsInput = inputObjectType({
  name: 'PeriodFactsInput',
  definition(t) {
    t.int('rollsPerSegment', { default: 3 })
    t.field('scenario', {
      type: PeriodFactsScenarioInput,
      default: {
        seed: 0,
        trendStocks: TREND_STOCKS,
        trendBonds: TREND_BONDS,
        varianceStocks: VARIANCE_STOCKS,
        varianceBonds: VARIANCE_BONDS,
        interestBank: INTEREST_BANK,
      },
    })
  },
})

// function generateDiceObject() {
//   return yup.number().positive().integer().max(6).required()
// }

// function generateDieObject() {
//   return yup.object({
//     bondsAndStock: generateDiceObject(),
//     bonds: generateDiceObject(),
//     stock: generateDiceObject(),
//   })
// }

// function generateValuePercentagesObject() {
//   return yup.object({
//     bank: yup.number().positive().max(1).required(),
//     bonds: yup.number().positive().max(1).required(),
//     stock: yup.number().positive().max(1).required(),
//   })
// }

// function generateValueObject() {
//   return yup.object({
//     bank: yup.number().positive().required(),
//     bonds: yup.number().positive().required(),
//     stock: yup.number().positive().required(),
//   })
// }

export const PeriodSegmentFactsSchema = yup.object({})

export interface PeriodSegmentFacts
  extends yup.InferType<typeof PeriodSegmentFactsSchema> {
  returns: { bank: number; bonds: number; stocks: number }[]
  diceRolls: { bonds: number; stocks: number }[]
}

export const PeriodSegmentFactsInput = inputObjectType({
  name: 'PeriodSegmentFactsInput',
  definition(t) {
    t.float('bankPercentage')
    t.float('bondsPercentage')
    t.float('stockPercentage')
  },
})
