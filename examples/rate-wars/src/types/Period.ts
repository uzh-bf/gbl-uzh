import { inputObjectType } from 'nexus'
import * as yup from 'yup'

// ---------------------------------------------------------------------------
// Game-master tunables (one set per period = one banking year).
// All rates are percent numbers (2 === 2%).
// ---------------------------------------------------------------------------
export const DEFAULT_SEED = 1
export const DEFAULT_CENTRAL_BANK_RATE = 2
export const DEFAULT_DEPOSIT_POOL = 10000
export const DEFAULT_LOAN_DEMAND = 8000
export const DEFAULT_DEPOSIT_SENSITIVITY = 0.6
export const DEFAULT_LOAN_SENSITIVITY = 0.6
export const DEFAULT_BASE_DEFAULT_RATE = 1.5
export const DEFAULT_SHOCK_SCALE = 1
export const DEFAULT_LOSS_GIVEN_DEFAULT = 0.5
export const DEFAULT_FIXED_COST = 30

export const PeriodFactsSchema = yup.object({
  scenario: yup
    .object({
      seed: yup.number().integer().default(DEFAULT_SEED),
      // policy rate earned on unlent funds parked at the central bank (%)
      centralBankRate: yup
        .number()
        .min(0)
        .max(20)
        .default(DEFAULT_CENTRAL_BANK_RATE),
      // total household savings looking for a bank
      depositPool: yup.number().positive().default(DEFAULT_DEPOSIT_POOL),
      // total borrower demand at stake
      loanDemand: yup.number().positive().default(DEFAULT_LOAN_DEMAND),
      // softmax sensitivities per percentage point of rate difference
      depositSensitivity: yup
        .number()
        .min(0)
        .max(5)
        .default(DEFAULT_DEPOSIT_SENSITIVITY),
      loanSensitivity: yup
        .number()
        .min(0)
        .max(5)
        .default(DEFAULT_LOAN_SENSITIVITY),
      // expected share of loans that default (%), before the seeded shock
      baseDefaultRate: yup
        .number()
        .min(0)
        .max(25)
        .default(DEFAULT_BASE_DEFAULT_RATE),
      // amplitude of the seeded default shock (± percentage points)
      shockScale: yup.number().min(0).max(10).default(DEFAULT_SHOCK_SCALE),
      // fraction of a defaulted loan that is lost (0..1)
      lossGivenDefault: yup
        .number()
        .min(0)
        .max(1)
        .default(DEFAULT_LOSS_GIVEN_DEFAULT),
      // operating cost per period
      fixedCost: yup.number().min(0).default(DEFAULT_FIXED_COST),
    })
    .required(),
})

export interface PeriodFacts extends yup.InferType<typeof PeriodFactsSchema> {}

export const PeriodFactsScenarioInput = inputObjectType({
  name: 'PeriodFactsScenarioInput',
  definition(t) {
    t.int('seed', { default: DEFAULT_SEED })
    t.float('centralBankRate', { default: DEFAULT_CENTRAL_BANK_RATE })
    t.float('depositPool', { default: DEFAULT_DEPOSIT_POOL })
    t.float('loanDemand', { default: DEFAULT_LOAN_DEMAND })
    t.float('depositSensitivity', { default: DEFAULT_DEPOSIT_SENSITIVITY })
    t.float('loanSensitivity', { default: DEFAULT_LOAN_SENSITIVITY })
    t.float('baseDefaultRate', { default: DEFAULT_BASE_DEFAULT_RATE })
    t.float('shockScale', { default: DEFAULT_SHOCK_SCALE })
    t.float('lossGivenDefault', { default: DEFAULT_LOSS_GIVEN_DEFAULT })
    t.float('fixedCost', { default: DEFAULT_FIXED_COST })
  },
})

export const PeriodFactsInput = inputObjectType({
  name: 'PeriodFactsInput',
  definition(t) {
    t.field('scenario', {
      type: PeriodFactsScenarioInput,
      default: {
        seed: DEFAULT_SEED,
        centralBankRate: DEFAULT_CENTRAL_BANK_RATE,
        depositPool: DEFAULT_DEPOSIT_POOL,
        loanDemand: DEFAULT_LOAN_DEMAND,
        depositSensitivity: DEFAULT_DEPOSIT_SENSITIVITY,
        loanSensitivity: DEFAULT_LOAN_SENSITIVITY,
        baseDefaultRate: DEFAULT_BASE_DEFAULT_RATE,
        shockScale: DEFAULT_SHOCK_SCALE,
        lossGivenDefault: DEFAULT_LOSS_GIVEN_DEFAULT,
        fixedCost: DEFAULT_FIXED_COST,
      },
    })
  },
})

// ---------------------------------------------------------------------------
// Segment facts: the precomputed environment (seeded default shock).
// The admin may pass shockOverride to force a specific shock (± pp);
// otherwise Segment.initialize derives it deterministically from the seed.
// ---------------------------------------------------------------------------
export const PeriodSegmentFactsSchema = yup.object({
  shockOverride: yup.number().min(-25).max(25).nullable().optional(),
})

export interface PeriodSegmentFacts extends yup.InferType<
  typeof PeriodSegmentFactsSchema
> {
  // computed at authoring time by Segment.initialize:
  defaultShock: number
  realizedDefaultRate: number
  diceRolls: number[]
}

export const PeriodSegmentFactsInput = inputObjectType({
  name: 'PeriodSegmentFactsInput',
  definition(t) {
    t.nullable.float('shockOverride')
  },
})
