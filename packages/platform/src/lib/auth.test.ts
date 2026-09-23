import { expect, test } from 'vitest'

import { resolveAdminOidcConfig } from './auth.js'

const mock: NodeJS.ProcessEnv = {
  NODE_ENV: 'development',
  GBL_MOCK_OIDC_ISSUER: 'http://localhost:8090/default',
  GBL_MOCK_OIDC_CLIENT_ID: 'demo-game-local',
  GBL_MOCK_OIDC_CLIENT_SECRET: 'demo-game-local-secret',
}

test('development defaults to the mock OIDC provider', () => {
  expect(resolveAdminOidcConfig(mock)).toStrictEqual({
    mode: 'mock',
    issuer: 'http://localhost:8090/default',
    clientId: 'demo-game-local',
    clientSecret: 'demo-game-local-secret',
  })
})

test('stale Auth0 variables do not override the development mock', () => {
  expect(
    resolveAdminOidcConfig({
      ...mock,
      AUTH0_ISSUER: 'https://example.eu.auth0.com/',
      AUTH0_CLIENT_ID: 'real-client',
      AUTH0_CLIENT_SECRET: 'real-secret',
    }).mode
  ).toBe('mock')
})

test('explicit Auth0 mode uses the real provider variables', () => {
  expect(
    resolveAdminOidcConfig({
      NODE_ENV: 'development',
      GBL_AUTH_MODE: 'auth0',
      AUTH0_ISSUER: 'https://example.eu.auth0.com/',
      AUTH0_CLIENT_ID: 'real-client',
      AUTH0_CLIENT_SECRET: 'real-secret',
    })
  ).toStrictEqual({
    mode: 'auth0',
    issuer: 'https://example.eu.auth0.com/',
    clientId: 'real-client',
    clientSecret: 'real-secret',
  })
})

test('auth0 mode rejects cleartext http issuers', () => {
  expect(() =>
    resolveAdminOidcConfig({
      NODE_ENV: 'development',
      GBL_AUTH_MODE: 'auth0',
      AUTH0_ISSUER: 'http://example.eu.auth0.com/',
      AUTH0_CLIENT_ID: 'real-client',
      AUTH0_CLIENT_SECRET: 'real-secret',
    })
  ).toThrow(/must use https/)
})

test('production defaults to Auth0', () => {
  expect(
    resolveAdminOidcConfig({
      NODE_ENV: 'production',
      AUTH0_ISSUER: 'https://example.eu.auth0.com/',
      AUTH0_CLIENT_ID: 'real-client',
      AUTH0_CLIENT_SECRET: 'real-secret',
    }).mode
  ).toBe('auth0')
})

test('missing provider variables fail without exposing values', () => {
  expect(() => resolveAdminOidcConfig({ NODE_ENV: 'development' })).toThrow(
    /GBL_MOCK_OIDC_ISSUER/
  )
})

test('invalid mode fails clearly', () => {
  expect(() =>
    resolveAdminOidcConfig({
      NODE_ENV: 'development',
      GBL_AUTH_MODE: 'tenant',
    })
  ).toThrow(/GBL_AUTH_MODE must be either/)
})

test('production cannot use the mock provider', () => {
  expect(() =>
    resolveAdminOidcConfig({
      NODE_ENV: 'production',
      GBL_AUTH_MODE: 'mock',
      GBL_MOCK_OIDC_ISSUER: mock.GBL_MOCK_OIDC_ISSUER,
      GBL_MOCK_OIDC_CLIENT_ID: mock.GBL_MOCK_OIDC_CLIENT_ID,
      GBL_MOCK_OIDC_CLIENT_SECRET: mock.GBL_MOCK_OIDC_CLIENT_SECRET,
    })
  ).toThrow(/not allowed in production/)
})
