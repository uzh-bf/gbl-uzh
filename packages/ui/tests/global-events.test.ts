import { expect, test } from 'vitest'
import { getCountdownNotification } from '../src/lib/global-events'

test('countdown threshold reminders are emitted once and reset with a new countdown', () => {
  const emitted = { '180': false, '60': false }
  const first = getCountdownNotification(180, 181, emitted)
  expect(first?.secondsKey).toBe('180')
  emitted['180'] = true
  expect(getCountdownNotification(179, 180, emitted)).toBe(null)
  expect(getCountdownNotification(180, 181, emitted)).toBe(null)
  const last = getCountdownNotification(60, 61, emitted)
  expect(last?.secondsKey).toBe('60')
  emitted['60'] = true
  expect(getCountdownNotification(59, 60, emitted)).toBe(null)
  expect(
    getCountdownNotification(60, 61, { '180': false, '60': false })?.secondsKey
  ).toBe('60')
})
