import * as yup from 'yup'

import { DEFAULT_SEED } from '../lib/constants'

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

export interface PeriodFacts extends yup.InferType<typeof PeriodFactsSchema> {
  // Operator-set trading toggles, surfaced in the admin game view. Optional:
  // absent on periods created before the toggles existed.
  spotTradingEnabled?: boolean
  futuresTradingEnabled?: boolean
  optionsTradingEnabled?: boolean
}

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
