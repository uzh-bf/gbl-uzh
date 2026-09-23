import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getCountdownNotification } from '../src/lib/global-events'

test('countdown threshold reminders are emitted once and reset with a new countdown', () => {
  const emitted = { '180': false, '60': false }
  const first = getCountdownNotification(180, 181, emitted)
  assert.equal(first?.secondsKey, '180')
  emitted['180'] = true
  assert.equal(getCountdownNotification(179, 180, emitted), null)
  assert.equal(getCountdownNotification(180, 181, emitted), null)
  const last = getCountdownNotification(60, 61, emitted)
  assert.equal(last?.secondsKey, '60')
  emitted['60'] = true
  assert.equal(getCountdownNotification(59, 60, emitted), null)
  assert.equal(
    getCountdownNotification(60, 61, { '180': false, '60': false })?.secondsKey,
    '60'
  )
})
