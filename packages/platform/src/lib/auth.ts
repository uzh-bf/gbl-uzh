export type AdminAuthMode = 'mock' | 'auth0'

export interface AdminOidcConfig {
  mode: AdminAuthMode
  clientId: string
  clientSecret: string
  issuer: string
}

function requiredEnvironmentVariable(
  env: NodeJS.ProcessEnv,
  name: string,
): string {
  const value = env[name]?.trim()
  if (!value) {
    throw new Error(
      `Missing required authentication environment variable: ${name}`,
    )
  }

  return value
}

function validateIssuer(issuer: string, variableName: string): string {
  let parsed: URL
  try {
    parsed = new URL(issuer)
  } catch {
    throw new Error(
      `Invalid OIDC issuer in environment variable: ${variableName}`,
    )
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error(
      `Invalid OIDC issuer in environment variable: ${variableName}`,
    )
  }

  return issuer
}

/**
 * Resolve the OIDC provider used for admin login.
 *
 * Development defaults to the local mock so an ignored .env.local cannot
 * silently switch a normal local run to a real Auth0 tenant. Production keeps
 * the existing AUTH0_* behavior unless an explicit mode is supplied.
 */
export function resolveAdminOidcConfig(
  env: NodeJS.ProcessEnv = process.env,
): AdminOidcConfig {
  const modeValue =
    env.GBL_AUTH_MODE?.trim() ||
    (env.NODE_ENV === 'production' ? 'auth0' : 'mock')

  if (modeValue !== 'mock' && modeValue !== 'auth0') {
    throw new Error('GBL_AUTH_MODE must be either "mock" or "auth0"')
  }

  const mode = modeValue
  if (mode === 'mock' && env.NODE_ENV === 'production') {
    throw new Error('Mock OIDC authentication is not allowed in production')
  }

  const prefix = mode === 'mock' ? 'GBL_MOCK_OIDC' : 'AUTH0'
  const issuerVariable = `${prefix}_ISSUER`
  const clientIdVariable = `${prefix}_CLIENT_ID`
  const clientSecretVariable = `${prefix}_CLIENT_SECRET`

  return {
    mode,
    issuer: validateIssuer(
      requiredEnvironmentVariable(env, issuerVariable),
      issuerVariable,
    ),
    clientId: requiredEnvironmentVariable(env, clientIdVariable),
    clientSecret: requiredEnvironmentVariable(env, clientSecretVariable),
  }
}
