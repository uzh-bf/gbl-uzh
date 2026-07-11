import { execFileSync } from 'node:child_process'
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(
  fileURLToPath(new URL('../package.json', import.meta.url))
)
const fixtureRoot = join(packageRoot, 'fixtures/next-consumer')
const packageOptionIndex = process.argv.indexOf('--package')
const packageOptionValue = process.argv[packageOptionIndex + 1]

if (packageOptionIndex === -1 || !packageOptionValue) {
  throw new Error('--package requires a tarball path')
}

const packageArchive = isAbsolute(packageOptionValue)
  ? packageOptionValue
  : resolve(process.cwd(), packageOptionValue)
const temporaryRoot = await mkdtemp(join(tmpdir(), 'gbl-ui-consumer-'))
const consumerRoot = join(temporaryRoot, 'consumer')

try {
  cpSync(fixtureRoot, consumerRoot, { recursive: true })

  const manifestPath = join(consumerRoot, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  manifest.dependencies['@gbl-uzh/ui'] = `file:${packageArchive}`
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  const environment = {
    ...process.env,
    CI: 'true',
    npm_config_cache: join(temporaryRoot, 'npm-cache'),
  }

  execFileSync(
    'pnpm',
    ['install', '--lockfile=false', '--strict-peer-dependencies'],
    { cwd: consumerRoot, env: environment, stdio: 'inherit' }
  )
  execFileSync('pnpm', ['run', 'build'], {
    cwd: consumerRoot,
    env: environment,
    stdio: 'inherit',
  })

  console.log(`External Next consumer built from ${packageArchive}`)
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
