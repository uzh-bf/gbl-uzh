import { execFileSync } from 'node:child_process'
import {
  cpSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { isBuiltin } from 'node:module'
import { tmpdir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'
import ts from 'typescript'

export function assert(condition, message) {
  if (!condition) throw new Error(message)
}

export function dependencyName(specifier) {
  if (specifier.startsWith('@')) {
    return specifier.split('/').slice(0, 2).join('/')
  }
  return specifier.split('/')[0]
}

export function assertExpectedFiles(packedFiles, expectedFiles) {
  for (const expectedFile of expectedFiles) {
    assert(
      packedFiles.has(expectedFile),
      `Packed artifact misses ${expectedFile}`
    )
  }
}

export function inspectPackedRuntime({ extractedPackageRoot, packResult }) {
  const packageJson = JSON.parse(
    readFileSync(join(extractedPackageRoot, 'package.json'), 'utf8')
  )
  const declaredRuntimePackages = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ])
  const javascriptFiles = packResult.files
    .map(({ path }) => path)
    .filter((path) => path.startsWith('dist/') && path.endsWith('.js'))
  const runtimeSpecifiers = javascriptFiles.flatMap((path) =>
    ts
      .preProcessFile(
        readFileSync(join(extractedPackageRoot, path), 'utf8'),
        true,
        true
      )
      .importedFiles.map(({ fileName }) => fileName)
  )
  const nodeBuiltins = runtimeSpecifiers.filter(
    (specifier) => specifier.startsWith('node:') || isBuiltin(specifier)
  )
  const undeclaredRuntimePackages = [
    ...new Set(
      runtimeSpecifiers
        .filter(
          (specifier) =>
            !specifier.startsWith('.') &&
            !specifier.startsWith('node:') &&
            !isBuiltin(specifier)
        )
        .map(dependencyName)
        .filter((name) => !declaredRuntimePackages.has(name))
    ),
  ]

  return {
    declaredRuntimePackages,
    javascriptFiles,
    nodeBuiltins,
    packageJson,
    runtimeSpecifiers,
    undeclaredRuntimePackages,
  }
}

function pathOption(name, { required = false } = {}) {
  const optionIndex = process.argv.indexOf(name)
  const optionValue =
    optionIndex === -1 ? undefined : process.argv[optionIndex + 1]

  if ((required || optionIndex !== -1) && !optionValue) {
    throw new Error(`${name} requires a path`)
  }

  return optionValue
    ? isAbsolute(optionValue)
      ? optionValue
      : resolve(process.cwd(), optionValue)
    : undefined
}

export async function preparePackedPackage({ packageRoot, temporaryPrefix }) {
  const configuredOutputRoot = pathOption('--output')
  const temporaryRoot = await mkdtemp(join(tmpdir(), temporaryPrefix))
  const outputRoot = configuredOutputRoot ?? temporaryRoot
  const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const tarExecutable = process.platform === 'win32' ? 'tar.exe' : 'tar'

  try {
    await mkdir(outputRoot, { recursive: true })
    const packOutput = execFileSync(
      npmExecutable,
      ['pack', '--ignore-scripts', '--json', '--pack-destination', outputRoot],
      {
        cwd: packageRoot,
        encoding: 'utf8',
        env: {
          ...process.env,
          npm_config_cache: join(temporaryRoot, 'npm-cache'),
        },
      }
    )
    const [packResult] = JSON.parse(packOutput)
    const archivePath = join(outputRoot, packResult.filename)
    const extractedRoot = join(temporaryRoot, 'extracted')

    await mkdir(extractedRoot)
    execFileSync(tarExecutable, ['-xzf', archivePath, '-C', extractedRoot])

    return {
      archivePath,
      artifactPreserved: Boolean(configuredOutputRoot),
      cleanup() {
        rmSync(temporaryRoot, { recursive: true, force: true })
      },
      extractedPackageRoot: join(extractedRoot, 'package'),
      packedFiles: new Set(packResult.files.map(({ path }) => path)),
      packResult,
      temporaryRoot,
    }
  } catch (error) {
    rmSync(temporaryRoot, { recursive: true, force: true })
    throw error
  }
}

export async function preparePackedConsumer({
  dependency,
  fixtureRoot,
  temporaryPrefix,
}) {
  const packageArchive = pathOption('--package', { required: true })
  const temporaryRoot = await mkdtemp(join(tmpdir(), temporaryPrefix))
  const consumerRoot = join(temporaryRoot, 'consumer')
  const packageManagerCli = process.env.npm_execpath

  try {
    if (!packageManagerCli || !isAbsolute(packageManagerCli)) {
      throw new Error(
        'Run verify:consumer through pnpm so npm_execpath is an absolute pnpm CLI path'
      )
    }

    const pnpmCli = realpathSync(packageManagerCli)
    cpSync(fixtureRoot, consumerRoot, { recursive: true })

    const manifestPath = join(consumerRoot, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    manifest.dependencies[dependency] = `file:${packageArchive}`
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

    const environment = {
      ...process.env,
      CI: 'true',
      npm_config_cache: join(temporaryRoot, 'npm-cache'),
    }

    return {
      cleanup() {
        rmSync(temporaryRoot, { recursive: true, force: true })
      },
      consumerRoot,
      packageArchive,
      runPnpm(...args) {
        execFileSync(process.execPath, [pnpmCli, ...args], {
          cwd: consumerRoot,
          env: environment,
          stdio: 'inherit',
        })
      },
    }
  } catch (error) {
    rmSync(temporaryRoot, { recursive: true, force: true })
    throw error
  }
}

export async function verifyPackedConsumer({
  commands,
  dependency,
  fixtureRoot,
  successMessage,
  temporaryPrefix,
}) {
  const consumer = await preparePackedConsumer({
    dependency,
    fixtureRoot,
    temporaryPrefix,
  })

  try {
    consumer.runPnpm(
      'install',
      '--lockfile=false',
      '--strict-peer-dependencies'
    )
    for (const command of commands) {
      consumer.runPnpm(...command)
    }
    console.log(`${successMessage} ${consumer.packageArchive}`)
  } finally {
    consumer.cleanup()
  }
}
