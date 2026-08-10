import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync, rmSync } from 'node:fs'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { isBuiltin } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const packageRoot = dirname(
  fileURLToPath(new URL('../package.json', import.meta.url))
)
const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const tarExecutable = process.platform === 'win32' ? 'tar.exe' : 'tar'

const temporaryRoot = await mkdtemp(join(tmpdir(), 'gbl-platform-package-'))
const outputOptionIndex = process.argv.indexOf('--output')
const outputOptionValue = process.argv[outputOptionIndex + 1]

if (outputOptionIndex !== -1 && !outputOptionValue) {
  throw new Error('--output requires a directory')
}

const outputRoot =
  outputOptionIndex === -1 ? temporaryRoot : resolve(outputOptionValue)

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function dependencyName(specifier) {
  if (specifier.startsWith('@')) {
    return specifier.split('/').slice(0, 2).join('/')
  }
  return specifier.split('/')[0]
}

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
  const packedFiles = new Set(packResult.files.map(({ path }) => path))

  for (const expectedFile of [
    'LICENSE.md',
    'README.md',
    'package.json',
    'dist/index.js',
    'dist/index.d.ts',
    'dist/trpc/createPlatformRouter.js',
    'dist/trpc/createPlatformRouter.d.ts',
    'dist/trpc/init.js',
    'dist/trpc/init.d.ts',
    'dist/schema.prisma',
  ]) {
    assert(
      packedFiles.has(expectedFile),
      `Packed artifact misses ${expectedFile}`
    )
  }

  const extractedRoot = join(temporaryRoot, 'extracted')
  await mkdir(extractedRoot)
  execFileSync(tarExecutable, ['-xzf', archivePath, '-C', extractedRoot])

  const extractedPackageRoot = join(extractedRoot, 'package')
  const packageJson = JSON.parse(
    readFileSync(join(extractedPackageRoot, 'package.json'), 'utf8')
  )

  assert(packageJson.main === 'dist/index.js', 'main must target dist/index.js')
  assert(
    packageJson.types === 'dist/index.d.ts',
    'types must target dist/index.d.ts'
  )

  for (const dependency of [
    '@apollo/client',
    'graphql',
    'graphql-scalars',
    'graphql-sse',
    'graphql-yoga',
    'nexus',
  ]) {
    assert(
      packageJson.peerDependenciesMeta?.[dependency]?.optional === true,
      `${dependency} must stay optional for tRPC-only consumers`
    )
  }

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

  const missingRelativeImports = javascriptFiles.flatMap((path) => {
    const sourceDirectory = dirname(join(extractedPackageRoot, path))
    return ts
      .preProcessFile(
        readFileSync(join(extractedPackageRoot, path), 'utf8'),
        true,
        true
      )
      .importedFiles.map(({ fileName }) => fileName)
      .filter((specifier) => specifier.startsWith('.'))
      .map((specifier) => resolve(sourceDirectory, specifier))
      .filter((target) => !existsSync(target))
  })

  assert(
    missingRelativeImports.length === 0,
    `Packed runtime misses relative imports: ${missingRelativeImports.join(', ')}`
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

  assert(
    undeclaredRuntimePackages.length === 0,
    `Undeclared runtime packages: ${undeclaredRuntimePackages.join(', ')}`
  )

  const rootDeclaration = readFileSync(
    join(extractedPackageRoot, 'dist/index.d.ts'),
    'utf8'
  )
  assert(
    rootDeclaration.includes('export { createPlatformRouter }'),
    'Root declarations do not export createPlatformRouter'
  )

  const packageRealPath = `${realpathSync(extractedPackageRoot)}/`
  for (const entry of [packageJson.main, packageJson.types]) {
    assert(
      realpathSync(join(extractedPackageRoot, entry)).startsWith(
        packageRealPath
      ),
      `Package entry resolves outside the artifact: ${entry}`
    )
  }

  console.log(
    `Verified ${packageJson.name}@${packageJson.version}: ${
      packedFiles.size
    } packed files, ${runtimeSpecifiers.length} runtime imports, tRPC declarations and dependency closure.${
      outputOptionIndex === -1 ? '' : ` Artifact: ${archivePath}`
    }`
  )
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
