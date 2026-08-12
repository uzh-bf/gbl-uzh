import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveAdminOidcConfig } from './auth.js'

const mock: NodeJS.ProcessEnv = {
  NODE_ENV: 'development',
  GBL_MOCK_OIDC_ISSUER: 'http://localhost:8090/default',
  GBL_MOCK_OIDC_CLIENT_ID: 'demo-game-local',
  GBL_MOCK_OIDC_CLIENT_SECRET: 'demo-game-local-secret',
}

test('development defaults to the mock OIDC provider', () => {
  assert.deepEqual(resolveAdminOidcConfig(mock), {
    mode: 'mock',
    issuer: 'http://localhost:8090/default',
    clientId: 'demo-game-local',
    clientSecret: 'demo-game-local-secret',
  })
})

test('stale Auth0 variables do not override the development mock', () => {
  assert.equal(
    resolveAdminOidcConfig({
      ...mock,
      AUTH0_ISSUER: 'https://example.eu.auth0.com/',
      AUTH0_CLIENT_ID: 'real-client',
      AUTH0_CLIENT_SECRET: 'real-secret',
    }).mode,
    'mock',
  )
})

test('explicit Auth0 mode uses the real provider variables', () => {
  assert.deepEqual(
    resolveAdminOidcConfig({
      NODE_ENV: 'development',
      GBL_AUTH_MODE: 'auth0',
      AUTH0_ISSUER: 'https://example.eu.auth0.com/',
      AUTH0_CLIENT_ID: 'real-client',
      AUTH0_CLIENT_SECRET: 'real-secret',
    }),
    {
      mode: 'auth0',
      issuer: 'https://example.eu.auth0.com/',
      clientId: 'real-client',
      clientSecret: 'real-secret',
    },
  )
})

test('auth0 mode rejects cleartext http issuers', () => {
  assert.throws(
    () =>
      resolveAdminOidcConfig({
        NODE_ENV: 'development',
        GBL_AUTH_MODE: 'auth0',
        AUTH0_ISSUER: 'http://example.eu.auth0.com/',
        AUTH0_CLIENT_ID: 'real-client',
        AUTH0_CLIENT_SECRET: 'real-secret',
      }),
    /must use https/,
  )
})

test('production defaults to Auth0', () => {
  assert.equal(
    resolveAdminOidcConfig({
      NODE_ENV: 'production',
      AUTH0_ISSUER: 'https://example.eu.auth0.com/',
      AUTH0_CLIENT_ID: 'real-client',
      AUTH0_CLIENT_SECRET: 'real-secret',
    }).mode,
    'auth0',
  )
})

test('missing provider variables fail without exposing values', () => {
  assert.throws(
    () => resolveAdminOidcConfig({ NODE_ENV: 'development' }),
    /GBL_MOCK_OIDC_ISSUER/,
  )
})

test('invalid mode fails clearly', () => {
  assert.throws(
    () =>
      resolveAdminOidcConfig({
        NODE_ENV: 'development',
        GBL_AUTH_MODE: 'tenant',
      }),
    /GBL_AUTH_MODE must be either/,
  )
})

test('production cannot use the mock provider', () => {
  assert.throws(
    () =>
      resolveAdminOidcConfig({
        NODE_ENV: 'production',
        GBL_AUTH_MODE: 'mock',
        GBL_MOCK_OIDC_ISSUER: mock.GBL_MOCK_OIDC_ISSUER,
        GBL_MOCK_OIDC_CLIENT_ID: mock.GBL_MOCK_OIDC_CLIENT_ID,
        GBL_MOCK_OIDC_CLIENT_SECRET: mock.GBL_MOCK_OIDC_CLIENT_SECRET,
      }),
    /not allowed in production/,
  )
})
