import { verifyPackedConsumer } from '../../../scripts/package-verification.mjs'

await verifyPackedConsumer({
  commands: [
    ['run', 'check'],
    ['run', 'smoke'],
  ],
  dependency: '@gbl-uzh/platform',
  fixtureRoot: new URL('../fixtures/trpc-consumer', import.meta.url),
  successMessage: 'External tRPC consumer verified from',
  temporaryPrefix: 'gbl-platform-consumer-',
})
