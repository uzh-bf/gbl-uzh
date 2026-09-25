import { expect, test } from 'vitest'
import { queueRefetch } from './queuedRefetch'

test('events during an in-flight read queue a fresh read after it completes', async () => {
  const finish: Array<() => void> = []
  let calls = 0
  const refresh = queueRefetch(() => {
    calls++
    return new Promise<void>((resolve) => finish.push(resolve))
  })
  const first = refresh()
  const second = refresh()
  refresh()
  expect(calls).toBe(1)
  finish.shift()!()
  await Promise.resolve()
  expect(calls).toBe(2)
  finish.shift()!()
  await Promise.all([first, second])
  const next = refresh()
  expect(calls).toBe(3)
  finish.shift()!()
  await next
})

test('a failed read does not prevent a later retry', async () => {
  let fail = true
  const refresh = queueRefetch(async () => {
    if (fail) throw new Error('Offline')
  })
  await expect(refresh()).rejects.toThrow(/Offline/)
  fail = false
  await refresh()
})

test('a synchronous failure does not prevent a later retry', async () => {
  let fail = true
  const refresh = queueRefetch(() => {
    if (fail) throw new Error('Offline')
    return Promise.resolve()
  })
  await expect(refresh()).rejects.toThrow(/Offline/)
  fail = false
  await refresh()
})
