import type { APIRequestContext, Page, Route } from '@playwright/test'

// The app talks to `/api/trpc` through `httpBatchLink` with the superjson
// transformer: one HTTP request may carry several procedures
// (`/api/trpc/a,b?batch=1`), inputs are `{ json }` envelopes keyed by batch
// index, and the response is an array with one entry per procedure. These
// helpers hide that wire format from the specs.

export type TrpcCall = {
  path: string
  input: unknown
}

/**
 * `undefined` lets the real server answer that procedure. `meta` is the
 * superjson metadata that belongs to `data`, as returned by `call.real()`.
 */
export type TrpcReply =
  { data: unknown; meta?: unknown } | { error: string } | undefined

export type TrpcRouteCall = TrpcCall & {
  /** The server's own answer to this procedure, fetched once per request. */
  real(): Promise<{ data: unknown; meta?: unknown }>
}

export type TrpcHandler = (
  call: TrpcRouteCall,
  route: Route,
) => TrpcReply | Promise<TrpcReply>

export const TRPC_ROUTE = '**/api/trpc/**'

function unwrap(envelope: unknown) {
  return envelope && typeof envelope === 'object' && 'json' in envelope
    ? (envelope as { json: unknown }).json
    : envelope
}

/** Procedures and their inputs carried by one tRPC HTTP request. */
export function readTrpcCalls(request: {
  url(): string
  method(): string
  postData(): string | null
}): TrpcCall[] {
  const url = new URL(request.url())
  const paths = decodeURIComponent(
    url.pathname.replace(/^.*\/api\/trpc\//, ''),
  ).split(',')
  const batched = url.searchParams.get('batch') === '1'
  const raw =
    request.method() === 'GET'
      ? url.searchParams.get('input')
      : request.postData()
  let inputs: unknown = undefined
  try {
    inputs = raw ? JSON.parse(raw) : undefined
  } catch {
    inputs = undefined
  }
  return paths.map((path, index) => ({
    path,
    input: unwrap(
      batched
        ? (inputs as Record<string, unknown> | undefined)?.[String(index)]
        : inputs,
    ),
  }))
}

export function trpcErrorEntry(path: string, message: string) {
  return {
    error: {
      json: {
        message,
        code: -32603,
        data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500, path },
      },
    },
  }
}

export function trpcDataEntry(data: unknown, meta?: unknown) {
  return { result: { data: meta ? { json: data, meta } : { json: data } } }
}

/**
 * Intercepts tRPC requests so a spec can answer or fail individual
 * procedures. Procedures the handler leaves alone are answered by the real
 * server, also when they share a batch with a mocked one. A request nothing
 * mocks falls back to routes registered earlier, so several `routeTrpc` calls
 * can stack; a request that mixes mocked and real procedures is answered here
 * and does not reach earlier routes.
 */
export async function routeTrpc(page: Page, handler: TrpcHandler) {
  const listener = async (route: Route) => {
    const request = route.request()
    if (request.headers().accept?.includes('text/event-stream'))
      return route.fallback()
    const calls = readTrpcCalls(request)
    let serverBody: Promise<unknown> | undefined
    const serverEntry = async (index: number) => {
      serverBody ??= route.fetch().then((response) => response.json())
      const body = await serverBody
      return Array.isArray(body) ? body[index] : body
    }
    const replies: TrpcReply[] = []
    for (const [index, call] of calls.entries())
      replies.push(
        await handler(
          {
            ...call,
            real: async () => {
              const entry = (await serverEntry(index)) as {
                result?: { data?: { json?: unknown; meta?: unknown } }
              }
              if (!entry?.result?.data)
                throw new Error(`The server failed ${call.path}`)
              return {
                data: entry.result.data.json,
                meta: entry.result.data.meta,
              }
            },
          },
          route,
        ),
      )
    if (replies.every((reply) => reply === undefined)) {
      return route.fallback()
    }
    const entries = await Promise.all(
      calls.map(async (call, index) => {
        const reply = replies[index]
        if (reply === undefined) return serverEntry(index)
        return 'error' in reply
          ? trpcErrorEntry(call.path, reply.error)
          : trpcDataEntry(reply.data, reply.meta)
      }),
    )
    const batched = new URL(request.url()).searchParams.get('batch') === '1'
    const failed = entries.some(
      (entry) => entry && typeof entry === 'object' && 'error' in entry,
    )
    await route.fulfill({
      status: failed ? (entries.length > 1 ? 207 : 500) : 200,
      json: batched ? entries : entries[0],
    })
  }
  await page.route(TRPC_ROUTE, listener)
  return () => page.unroute(TRPC_ROUTE, listener)
}

/** Whether a request or response targets the given tRPC procedure. */
export function isTrpcCall(
  request: { url(): string; method(): string; postData(): string | null },
  path: string,
  matchInput?: (input: unknown) => boolean,
) {
  if (!request.url().includes('/api/trpc/')) return false
  return readTrpcCalls(request).some(
    (call) => call.path === path && (!matchInput || matchInput(call.input)),
  )
}

/**
 * Calls one procedure directly with the given request context's cookies.
 * Returns the decoded data, or the error message when the call fails.
 */
export async function callTrpc(
  request: APIRequestContext,
  type: 'query' | 'mutation',
  path: string,
  input?: unknown,
): Promise<{ data?: unknown; error?: string; status: number }> {
  const envelope = JSON.stringify({ json: input ?? null })
  const response =
    type === 'query'
      ? await request.get(
          `/api/trpc/${path}?input=${encodeURIComponent(envelope)}`,
        )
      : await request.post(`/api/trpc/${path}`, {
          data: envelope,
          headers: { 'content-type': 'application/json' },
        })
  const body = (await response.json().catch(() => null)) as {
    result?: { data?: { json?: unknown } }
    error?: { json?: { message?: string } }
  } | null
  return body?.error
    ? {
        error: body.error.json?.message ?? 'tRPC error',
        status: response.status(),
      }
    : { data: body?.result?.data?.json, status: response.status() }
}
