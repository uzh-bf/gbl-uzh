import { inputObjectType } from 'nexus'
import * as yup from 'yup'

export const PeriodFactsSchema = yup.object({
  period: yup.number().positive().integer().required().default(1),
})

export interface PeriodFacts extends yup.InferType<typeof PeriodFactsSchema> {}

export const PeriodFactsInput = inputObjectType({
  name: 'PeriodFactsInput',
  definition(t) {
    t.string('name')
  },
})

function generateDiceObject() {
  return yup.number().positive().integer().max(6).required().default(3);
}

function generateDieObject() {
  return yup.object({
    bondsAndStock: generateDiceObject(),
    bonds: generateDiceObject(),
    stock : generateDiceObject(),
  });
}

function generateValuePercentagesObject() {
  return yup.object({
    bank: yup.number().positive().max(1).required().default(0.1),
    bonds: yup.number().positive().max(1).required().default(0.1),
    stock: yup.number().positive().max(1).required().default(0.1),
  });
}

function generateValueObject() {
  return yup.object({
    bank: yup.number().positive().required().default(1000),
    bonds: yup.number().positive().required().default(1000),
    stock: yup.number().positive().required().default(1000),
  });
}

export const PeriodSegmentFactsSchema = yup.object({
  portfolio: generateValueObject(),
  investmentDecision: generateValuePercentagesObject(),
  dieMonth1 : generateDieObject(),
  dieMonth2 : generateDieObject(),
  dieMonth3 : generateDieObject(),
})

export interface PeriodSegmentFacts
  extends yup.InferType<typeof PeriodSegmentFactsSchema>{}

export const PeriodSegmentFactsInput = inputObjectType({
  name: 'PeriodSegmentFactsInput',
  definition(t) {
    t.float('bankPercentage'),
    t.float('bondsPercentage'),
    t.float('stockPercentage')
  },
})
  