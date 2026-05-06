import { TRPCError, type TRPC_ERROR_CODE_KEY } from '@trpc/server'

const TRPC_CODE_BY_SERVICE_ERROR = {
  INVALID_TOKEN: 'UNAUTHORIZED',
  ACTIONS_NOT_ALLOWED: 'FORBIDDEN',
  INVALID_DECISION: 'BAD_REQUEST',
} as const satisfies Record<string, TRPC_ERROR_CODE_KEY>

type ServiceErrorMessage = keyof typeof TRPC_CODE_BY_SERVICE_ERROR

export function asTRPCCodeFromServiceError(
  error: unknown
): TRPC_ERROR_CODE_KEY {
  if (!(error instanceof Error)) return 'INTERNAL_SERVER_ERROR'

  return (
    TRPC_CODE_BY_SERVICE_ERROR[error.message as ServiceErrorMessage] ??
    'INTERNAL_SERVER_ERROR'
  )
}

export function throwAsTRPCError(error: unknown): never {
  const code = asTRPCCodeFromServiceError(error)
  const message =
    error instanceof Error ? error.message : 'Internal server error'

  throw new TRPCError({
    code,
    message,
  })
}
