import { expect, test } from 'vitest'
import type { ResultFacts } from '../types/facts'
import { ActionTypes, apply } from './ActionsReducer'
import { initialize, start } from './SegmentResultService'

const decisions = { bank: 100, bonds: 0, stocks: 0 }
const submit = (state: Parameters<typeof apply>[0]) =>
  apply(state, {
    type: ActionTypes.NONE,
    payload: { playerArgs: { ...decisions } },
  } as Parameters<typeof apply>[1])

test('submitting the default mix persists an explicit marker without changing percentages', () => {
  const state = { decisions }
  const result = submit(state)
  expect(result.isDirty).toBe(true)
  expect(result.result.allocationSubmitted).toBe(true)
  expect(result.result.decisions).toStrictEqual(decisions)
  expect('allocationSubmitted' in state).toBe(false)
  expect(submit(result.result).result.allocationSubmitted).toBe(true)
})

test('first and subsequent segments reset submission without discarding the mix', () => {
  const facts = { decisions, allocationSubmitted: true } as ResultFacts
  const initialized = initialize(facts, {} as Parameters<typeof initialize>[1])
  const started = start(facts, {} as Parameters<typeof start>[1])
  for (const result of [initialized, started]) {
    expect(result.resultFacts.allocationSubmitted).toBe(false)
    expect(result.resultFacts.decisions).toStrictEqual(decisions)
  }
  expect(facts.allocationSubmitted).toBe(true)
})
