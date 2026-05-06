import { TRPCError, type TRPC_ERROR_CODE_KEY } from '@trpc/server'

const TRPC_CODE_BY_SERVICE_ERROR: Record<string, TRPC_ERROR_CODE_KEY> = {
  INVALID_TOKEN: 'UNAUTHORIZED',
  ACTIONS_NOT_ALLOWED: 'FORBIDDEN',
  INVALID_DECISION: 'BAD_REQUEST',
} as const

export function asTRPCCodeFromServiceError(error: unknown): TRPC_ERROR_CODE_KEY {
  if (!(error instanceof Error)) return 'INTERNAL_SERVER_ERROR'

  return (
    TRPC_CODE_BY_SERVICE_ERROR[
      error.message as keyof typeof TRPC_CODE_BY_SERVICE_ERROR
    ] ?? 'INTERNAL_SERVER_ERROR'
  )
}

export function throwAsTRPCError(error: unknown): never {
  const code = asTRPCCodeFromServiceError(error)
  const message = error instanceof Error ? error.message : 'Internal server error'

  throw new TRPCError({
    code,
    message,
  })
}
