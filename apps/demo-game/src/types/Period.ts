import { inputObjectType } from 'nexus'
import * as yup from 'yup'

export const ROLLS_PER_SEGMENT = 3
export const DEFAULT_SEED = 1
export const GAP_STOCKS = 0.025
export const GAP_BONDS = 0.005
export const INTEREST_BANK = 0.002
export const TREND_STOCKS = 0.0065
export const TREND_BONDS = 0.0031

export const PeriodFactsSchema = yup.object({
  rollsPerSegment: yup.number().positive().integer().default(ROLLS_PER_SEGMENT),
  scenario: yup
    .object({
      seed: yup.number().integer().default(DEFAULT_SEED),
      trendStocks: yup.number().required(),
      trendBonds: yup.number().required(),
      gapStocks: yup.number().positive().required(),
      gapBonds: yup.number().positive().required(),
      interestBank: yup.number().required(),
    })
    .required(),
})

export interface PeriodFacts extends yup.InferType<typeof PeriodFactsSchema> {}

export const PeriodFactsScenarioInput = inputObjectType({
  name: 'PeriodFactsScenarioInput',
  definition(t) {
    t.int('seed', { default: DEFAULT_SEED })
    t.float('trendStocks', { default: TREND_STOCKS })
    t.float('trendBonds', { default: TREND_BONDS })
    t.float('gapStocks', { default: GAP_STOCKS })
    t.float('gapBonds', { default: GAP_BONDS })
    t.float('interestBank', { default: INTEREST_BANK })
  },
})

export const PeriodFactsInput = inputObjectType({
  name: 'PeriodFactsInput',
  definition(t) {
    t.int('rollsPerSegment', { default: ROLLS_PER_SEGMENT })
    t.field('scenario', {
      type: PeriodFactsScenarioInput,
      default: {
        seed: DEFAULT_SEED,
        trendStocks: TREND_STOCKS,
        trendBonds: TREND_BONDS,
        gapStocks: GAP_STOCKS,
        gapBonds: GAP_BONDS,
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
