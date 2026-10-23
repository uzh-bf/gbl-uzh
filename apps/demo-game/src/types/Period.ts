import { inputObjectType } from 'nexus'
import * as yup from 'yup'

import {
  DEFAULT_SEED,
  GAP_BONDS,
  GAP_STOCKS,
  INTEREST_BANK,
  TREND_BONDS,
  TREND_STOCKS,
} from '../lib/constants'

export const PeriodFactsSchema = yup.object({
  // Ignore legacy JSON overrides; duration is a demo-game rule.
  rollsPerSegment: yup.mixed().strip(),
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

export const PeriodSegmentFactsSchema = yup.object({
  revealedRollIndices: yup
    .array()
    .of(yup.number().integer().min(0).required())
    .optional(),
})

export interface PeriodSegmentFacts extends yup.InferType<
  typeof PeriodSegmentFactsSchema
> {
  returns: { bank: number; bonds: number; stocks: number }[]
  diceRolls: { shared: number; bonds: number; stocks: number }[]
}

export const PeriodSegmentFactsInput = inputObjectType({
  name: 'PeriodSegmentFactsInput',
  definition(t) {
    t.float('bankPercentage')
    t.float('bondsPercentage')
    t.float('stockPercentage')
  },
})
