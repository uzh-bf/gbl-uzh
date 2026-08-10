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
