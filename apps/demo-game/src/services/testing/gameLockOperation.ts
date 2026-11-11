import type { Prisma } from '../../generated/prisma/client'
import type prisma from '../../lib/prisma'

// Run an operation against real PostgreSQL, optionally pausing it immediately
// after its first game lock. Keep its completion and barriers together so tests
// can always release and drain the operation, including on assertion failures.
export function gameLockOperation(
  client: typeof prisma,
  work: (client: typeof prisma) => Promise<unknown>,
  hold = true
) {
  const attempted = Promise.withResolvers<number>()
  const acquired = Promise.withResolvers<number>()
  const release = Promise.withResolvers<void>()
  const wrapped = new Proxy(client, {
    get(target, property, receiver) {
      if (property !== '$transaction')
        return Reflect.get(target, property, receiver)
      return (
        work: (tx: Prisma.TransactionClient) => Promise<unknown>,
        options?: {
          maxWait?: number
          timeout?: number
          isolationLevel?: Prisma.TransactionIsolationLevel
        }
      ) =>
        target.$transaction(async (tx) => {
          let intercepted = false
          const transaction = new Proxy(tx, {
            get(target, property, receiver) {
              if (property !== '$queryRaw')
                return Reflect.get(target, property, receiver)
              return async (...args: Parameters<typeof tx.$queryRaw>) => {
                const query = args[0]
                if (
                  intercepted ||
                  !Array.isArray(query) ||
                  !query.join(' ').includes('FROM "Game"')
                ) {
                  return tx.$queryRaw(...args)
                }
                intercepted = true
                const [backend] = await tx.$queryRaw<
                  { pid: number }[]
                >`SELECT pg_backend_pid() AS pid`
                attempted.resolve(backend!.pid)
                const rows = await tx.$queryRaw(...args)
                acquired.resolve(backend!.pid)
                if (hold) await release.promise
                return rows
              }
            },
          })
          return work(transaction)
        }, options)
    },
  })
  const result = Promise.allSettled([
    Promise.resolve().then(() => work(wrapped)),
  ]).then(([outcome]) => outcome!)
  // Only create a race when a signal is awaited, avoiding unhandled rejections
  // for signals a test does not use. Fail promptly if the operation exits early.
  const waitFor = (signal: Promise<number>) =>
    Promise.race([
      signal,
      result.then((outcome) => {
        if (outcome.status === 'rejected') throw outcome.reason
        throw new Error('Operation completed without reaching the lock barrier')
      }),
    ])
  return {
    result,
    attempted: () => waitFor(attempted.promise),
    acquired: () => waitFor(acquired.promise),
    release: () => release.resolve(),
  }
}

// Query the lock manager instead of assuming a request has blocked after a sleep.
export async function waitForBlocker(
  client: typeof prisma,
  waiter: number,
  blockers: number[]
) {
  const deadline = Date.now() + 5000
  do {
    const [row] = await client.$queryRaw<{ pids: number[] }[]>`
      SELECT pg_blocking_pids(${waiter}::int) AS pids`
    const blocker = row?.pids.find((pid) => blockers.includes(pid))
    if (blocker !== undefined) return blocker
  } while (Date.now() < deadline)
  throw new Error(`Backend ${waiter} did not wait for backends ${blockers}`)
}
