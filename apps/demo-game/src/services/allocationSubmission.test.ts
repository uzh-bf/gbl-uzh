import assert from 'node:assert/strict'
import { test } from 'node:test'
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
  assert.equal(result.isDirty, true)
  assert.equal(result.result.allocationSubmitted, true)
  assert.deepEqual(result.result.decisions, decisions)
  assert.equal('allocationSubmitted' in state, false)
  assert.equal(submit(result.result).result.allocationSubmitted, true)
})

test('first and subsequent segments reset submission without discarding the mix', () => {
  const facts = { decisions, allocationSubmitted: true } as ResultFacts
  const initialized = initialize(facts, {} as Parameters<typeof initialize>[1])
  const started = start(facts, {} as Parameters<typeof start>[1])
  for (const result of [initialized, started]) {
    assert.equal(result.resultFacts.allocationSubmitted, false)
    assert.deepEqual(result.resultFacts.decisions, decisions)
  }
  assert.equal(facts.allocationSubmitted, true)
})
