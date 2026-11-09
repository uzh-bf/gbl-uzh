import { execFileSync, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(
  fileURLToPath(new URL('../package.json', import.meta.url))
)
const fixtureRoot = join(packageRoot, 'fixtures/next-consumer')
function option(name) {
  const index = process.argv.indexOf(name)
  if (index === -1) return undefined
  const value = process.argv[index + 1]
  if (!value || value.startsWith('--'))
    throw new Error(`${name} requires a value`)
  return value
}

const designSystem = option('--design-system')
const expectedSha256 = option('--expected-sha256')
const evidenceRoot = option('--evidence')
const workspaceRoot = option('--workspace')
const browserTest = process.argv.includes('--browser-test')
let designSystemArchive
if (designSystem?.startsWith('file:')) {
  designSystemArchive = resolve(designSystem.slice(5))
  if (!/^[a-f0-9]{64}$/.test(expectedSha256 ?? '')) {
    throw new Error('A design-system archive requires --expected-sha256')
  }
  const actual = createHash('sha256')
    .update(readFileSync(designSystemArchive))
    .digest('hex')
  if (actual !== expectedSha256)
    throw new Error('Design-system archive digest mismatch')
}

const packageOptionIndex = process.argv.indexOf('--package')
const packageOptionValue = process.argv[packageOptionIndex + 1]

if (!workspaceRoot && (packageOptionIndex === -1 || !packageOptionValue)) {
  throw new Error('--package requires a tarball path')
}

const packageArchive = packageOptionValue
  ? resolve(process.cwd(), packageOptionValue)
  : undefined
const temporaryRoot = await mkdtemp(join(tmpdir(), 'gbl-ui-consumer-'))
const consumerRoot = workspaceRoot
  ? resolve(workspaceRoot)
  : join(temporaryRoot, 'consumer')
const packageManagerCli = process.env.npm_execpath

if (!packageManagerCli || !isAbsolute(packageManagerCli)) {
  throw new Error(
    'Run verify:consumer through pnpm so npm_execpath is an absolute pnpm CLI path'
  )
}

const pnpmCli = realpathSync(packageManagerCli)

const environment = {
  ...process.env,
  CI: 'true',
  pnpm_config_verify_deps_before_run: 'false',
  npm_config_cache: join(temporaryRoot, 'npm-cache'),
}

try {
  if (!workspaceRoot) {
    cpSync(fixtureRoot, consumerRoot, { recursive: true })

    const manifestPath = join(consumerRoot, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    manifest.dependencies['@gbl-uzh/ui'] = `file:${packageArchive}`
    if (designSystem) {
      manifest.dependencies['@uzh-bf/design-system'] = designSystemArchive
        ? `file:${designSystemArchive}`
        : designSystem
    }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

    const runPnpm = (args) =>
      execFileSync(process.execPath, [pnpmCli, ...args], {
        cwd: consumerRoot,
        env: environment,
        stdio: 'inherit',
      })
    runPnpm(['install', '--lockfile-only', '--strict-peer-dependencies'])
    if (evidenceRoot) {
      mkdirSync(resolve(evidenceRoot), { recursive: true })
      for (const file of ['package.json', 'pnpm-lock.yaml']) {
        cpSync(join(consumerRoot, file), join(resolve(evidenceRoot), file))
      }
    }
    runPnpm(['install', '--frozen-lockfile', '--strict-peer-dependencies'])
  }

  const consumerRequire = createRequire(join(consumerRoot, 'package.json'))
  const uiRequire = createRequire(consumerRequire.resolve('@gbl-uzh/ui'))
  const packageRootFor = (require) => {
    for (const modules of require.resolve.paths('@uzh-bf/design-system') ??
      []) {
      const root = join(modules, '@uzh-bf/design-system')
      if (existsSync(join(root, 'package.json'))) return realpathSync(root)
    }
    throw new Error('Cannot locate resolved design-system package')
  }
  const dsRoot = packageRootFor(consumerRequire)
  const uiDsRoot = packageRootFor(uiRequire)
  if (
    !designSystemArchive &&
    !workspaceRoot &&
    realpathSync(dsRoot) !== realpathSync(uiDsRoot)
  ) {
    throw new Error(
      'UI and external consumer resolve different design-system packages'
    )
  }
  const version = (root) =>
    JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
  const designSystemVersion = version(dsRoot)
  if (designSystemVersion !== version(uiDsRoot))
    throw new Error('Game and UI design-system versions differ')

  for (const name of ['react', 'react-dom', 'react-hook-form']) {
    const dsRequire = createRequire(join(dsRoot, 'package.json'))
    const uiDsRequire = createRequire(join(uiDsRoot, 'package.json'))
    const resolvers =
      name === 'react-hook-form' && designSystemVersion.startsWith('4.')
        ? workspaceRoot
          ? [uiRequire]
          : [consumerRequire, uiRequire]
        : [consumerRequire, uiRequire, dsRequire, uiDsRequire]
    const paths = resolvers.map((require) =>
      realpathSync(require.resolve(name))
    )
    if (new Set(paths).size !== 1) throw new Error(`Duplicate runtime: ${name}`)
  }

  let matchedFiles = 0
  if (designSystemArchive) {
    const extracted = join(temporaryRoot, 'design-system')
    mkdirSync(extracted)
    execFileSync('/usr/bin/tar', ['-xzf', designSystemArchive, '-C', extracted])
    const compare = (relative = '') => {
      for (const entry of readdirSync(join(extracted, 'package', relative), {
        withFileTypes: true,
      })) {
        const file = join(relative, entry.name)
        if (entry.isDirectory()) compare(file)
        else {
          if (
            !entry.isFile() ||
            ![dsRoot, uiDsRoot].every((root) =>
              readFileSync(join(extracted, 'package', file)).equals(
                readFileSync(join(root, file))
              )
            )
          ) {
            throw new Error(`Installed design-system file differs: ${file}`)
          }
          matchedFiles++
        }
      }
    }
    compare()
    if (matchedFiles === 0)
      throw new Error('Design-system archive contains no files')
  }
  if (evidenceRoot) {
    mkdirSync(resolve(evidenceRoot), { recursive: true })
    writeFileSync(
      join(resolve(evidenceRoot), 'resolution.json'),
      JSON.stringify(
        {
          designSystem: JSON.parse(
            readFileSync(join(dsRoot, 'package.json'), 'utf8')
          ).version,
          archiveSha256: designSystemArchive ? expectedSha256 : null,
          matchedFiles,
          sharedPackageBytes: designSystemArchive ? true : dsRoot === uiDsRoot,
          singlePeerRuntimes: true,
        },
        null,
        2
      ) + '\n'
    )
  }
  if (!workspaceRoot)
    execFileSync(process.execPath, [pnpmCli, 'run', 'build'], {
      cwd: consumerRoot,
      env: environment,
      stdio: 'inherit',
    })

  if (browserTest && !workspaceRoot) {
    const listener = createServer()
    await new Promise((resolve, reject) => {
      listener.once('error', reject)
      listener.listen(0, '127.0.0.1', resolve)
    })
    const port = listener.address().port
    await new Promise((resolve) => listener.close(resolve))
    const url = `http://127.0.0.1:${port}`
    const server = spawn(
      process.execPath,
      [pnpmCli, 'exec', 'next', 'start', '-H', '127.0.0.1', '-p', String(port)],
      {
        cwd: consumerRoot,
        env: environment,
        stdio: 'inherit',
        detached: true,
      }
    )
    try {
      let ready = false
      for (let attempt = 0; attempt < 60; attempt++) {
        if (server.exitCode !== null)
          throw new Error('Packed consumer server exited before readiness')
        try {
          ready = (await fetch(url)).ok
        } catch {}
        if (ready) break
        await delay(500)
      }
      if (!ready) throw new Error('Packed consumer server did not become ready')
      execFileSync(
        process.execPath,
        [
          pnpmCli,
          '--dir',
          join(packageRoot, '../../playwright'),
          'exec',
          'playwright',
          'test',
          '--project=chromium',
          '--no-deps',
          '--retries=0',
          'tests/demo-game-flow.spec.ts',
          '--grep',
          'trading actions',
        ],
        {
          cwd: packageRoot,
          env: { ...environment, GBL_UI_CONSUMER_URL: url },
          stdio: 'inherit',
        }
      )
    } finally {
      if (server.pid) {
        try {
          process.kill(-server.pid, 'SIGTERM')
        } catch {}
      }
    }
  }

  console.log(
    workspaceRoot
      ? `Verified installed graph at ${consumerRoot}: ${matchedFiles} matching candidate files`
      : `External Next consumer built from ${packageArchive}`
  )
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
