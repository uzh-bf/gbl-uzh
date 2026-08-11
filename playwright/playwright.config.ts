import { defineConfig, devices } from '@playwright/test'

const isCI = Boolean(process.env.CI)
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? 'https://demo-game.localhost'
const parsedBaseURL = new URL(baseURL)
const baseHostname = parsedBaseURL.hostname
const ignoreHTTPSErrors =
  baseHostname === 'localhost' || baseHostname.endsWith('.localhost')
// Chromium resolves *.localhost to its own container. Send routed local hosts
// to Traefik instead so the browser can complete the OIDC callback.
const routedHostResolverRules =
  parsedBaseURL.protocol === 'https:' && baseHostname.endsWith('.localhost')
    ? [baseHostname, `oidc.${baseHostname}`]
        .map((hostname) => `MAP ${hostname} devrouter-traefik`)
        .join(',')
    : undefined
const adminStorageState = '.auth/admin.json'

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [
        ['list'],
        ['github'],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['blob', { outputDir: 'blob-report' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ],
  use: {
    baseURL,
    ignoreHTTPSErrors,
    launchOptions: routedHostResolverRules
      ? { args: [`--host-resolver-rules=${routedHostResolverRules}`] }
      : undefined,
    testIdAttribute: 'data-cy',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: adminStorageState,
      },
    },
  ],
})
