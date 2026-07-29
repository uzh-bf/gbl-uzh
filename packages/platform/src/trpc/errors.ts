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

  // yup ValidationError (schema-validated facts/payloads) signals bad player
  // input, not a server fault. Duck-typed by name so the trpc layer does not
  // hard-depend on yup.
  if (error.name === 'ValidationError') return 'BAD_REQUEST'

  return (
    TRPC_CODE_BY_SERVICE_ERROR[error.message as ServiceErrorMessage] ??
    'INTERNAL_SERVER_ERROR'
  )
}

export function throwAsTRPCError(error: unknown): never {
  // Preserve already-typed tRPC errors (e.g. BAD_REQUEST/FORBIDDEN thrown by a
  // procedure); re-mapping them by message would downgrade them to 500s.
  if (error instanceof TRPCError) throw error

  const code = asTRPCCodeFromServiceError(error)
  const message =
    error instanceof Error ? error.message : 'Internal server error'

  throw new TRPCError({
    code,
    message,
  })
}
