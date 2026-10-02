import { verifyPackedConsumer } from '../../../scripts/package-verification.mjs'

await verifyPackedConsumer({
  commands: [['run', 'build']],
  dependency: '@gbl-uzh/ui',
  fixtureRoot: new URL('../fixtures/next-consumer', import.meta.url),
  successMessage: 'External Next consumer built from',
  temporaryPrefix: 'gbl-ui-consumer-',
})
