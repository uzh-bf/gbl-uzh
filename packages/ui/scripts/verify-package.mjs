import { execFileSync } from 'node:child_process'
import {
  existsSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
} from 'node:fs'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { isBuiltin } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const packageRoot = dirname(
  fileURLToPath(new URL('../package.json', import.meta.url))
)
const npmCliCandidates = [
  join(
    dirname(process.execPath),
    '..',
    'lib',
    'node_modules',
    'npm',
    'bin',
    'npm-cli.js'
  ),
  join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
]
const npmCli = npmCliCandidates.find(existsSync)
const tarExecutable = '/usr/bin/tar'

if (!npmCli) {
  throw new Error(`Cannot find npm CLI beside Node: ${process.execPath}`)
}
if (!existsSync(tarExecutable)) {
  throw new Error(`Cannot find tar at ${tarExecutable}`)
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'gbl-ui-package-'))
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
  if (specifier.startsWith('@'))
    return specifier.split('/').slice(0, 2).join('/')
  return specifier.split('/')[0]
}

try {
  await mkdir(outputRoot, { recursive: true })
  const packOutput = execFileSync(
    process.execPath,
    [
      npmCli,
      'pack',
      '--ignore-scripts',
      '--json',
      '--pack-destination',
      outputRoot,
    ],
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
    'dist/style.css',
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
  const rootExport = packageJson.exports?.['.']

  assert(
    packageJson.main === './dist/index.js',
    'main must target dist/index.js'
  )
  assert(
    packageJson.types === './dist/index.d.ts',
    'types must target declarations'
  )
  assert(
    rootExport?.import === './dist/index.js',
    'root import export is invalid'
  )
  assert(
    rootExport?.types === './dist/index.d.ts',
    'root types export is invalid'
  )
  assert(
    packageJson.exports?.['./style.css'] === './dist/style.css',
    'stable CSS export is invalid'
  )
  for (const relativePath of [
    rootExport.import,
    rootExport.types,
    packageJson.exports['./style.css'],
  ]) {
    assert(
      existsSync(join(extractedPackageRoot, relativePath)),
      `Export target does not exist: ${relativePath}`
    )
  }

  const declaredRuntimePackages = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ])
  const runtimeSpecifiers = packResult.files
    .map(({ path }) => path)
    .filter((path) => path.startsWith('dist/') && path.endsWith('.js'))
    .flatMap((path) =>
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

  assert(
    nodeBuiltins.length === 0,
    `Node built-ins are not allowed in browser bundle: ${nodeBuiltins.join(
      ', '
    )}`
  )

  const undeclaredRuntimePackages = [
    ...new Set(
      runtimeSpecifiers
        .filter((specifier) => !specifier.startsWith('.'))
        .map(dependencyName)
        .filter((name) => !declaredRuntimePackages.has(name))
    ),
  ]

  assert(
    undeclaredRuntimePackages.length === 0,
    `Undeclared runtime packages: ${undeclaredRuntimePackages.join(', ')}`
  )

  const runtimePackages = new Set(runtimeSpecifiers.map(dependencyName))
  const allowedRuntimeCompanions = new Set(['react-dom'])
  const staleRuntimeDeclarations = [...declaredRuntimePackages].filter(
    (name) => !runtimePackages.has(name) && !allowedRuntimeCompanions.has(name)
  )

  assert(
    staleRuntimeDeclarations.length === 0,
    `Declared runtime packages are unused: ${staleRuntimeDeclarations.join(
      ', '
    )}`
  )

  const consumerRoot = join(temporaryRoot, 'consumer')
  const installedPackageRoot = join(consumerRoot, 'node_modules/@gbl-uzh/ui')
  await mkdir(dirname(installedPackageRoot), { recursive: true })
  renameSync(extractedPackageRoot, installedPackageRoot)

  const resolvedExports = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      [
        "console.log(import.meta.resolve('@gbl-uzh/ui'))",
        "console.log(import.meta.resolve('@gbl-uzh/ui/style.css'))",
      ].join(';'),
    ],
    { cwd: consumerRoot, encoding: 'utf8' }
  )
    .trim()
    .split('\n')

  const installedPackageRealPath = `${realpathSync(installedPackageRoot)}/`

  assert(
    resolvedExports.every((resolved) =>
      realpathSync(fileURLToPath(resolved)).startsWith(installedPackageRealPath)
    ),
    'Consumer exports resolved outside temporary installed package'
  )

  const consumerSource = join(consumerRoot, 'index.ts')
  /** @type {ReadonlyArray<[string, ts.CompilerOptions]>} */
  const resolutionModes = [
    [
      'Bundler',
      {
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
      },
    ],
    [
      'NodeNext',
      {
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
    ],
  ]

  for (const [name, options] of resolutionModes) {
    const typeResolution = ts.resolveModuleName(
      '@gbl-uzh/ui',
      consumerSource,
      options,
      ts.sys
    ).resolvedModule
    const normalizedTypePath = typeResolution?.resolvedFileName.replaceAll(
      /\\/g,
      '/'
    )

    assert(
      normalizedTypePath?.endsWith('/dist/index.d.ts'),
      `${name} resolved an unexpected declaration: ${
        normalizedTypePath ?? 'none'
      }`
    )
  }

  console.log(
    `Verified ${packageJson.name}@${packageJson.version}: ${
      packedFiles.size
    } packed files, ${
      runtimeSpecifiers.length
    } runtime imports, root/CSS/types resolve.${
      outputOptionIndex === -1 ? '' : ` Artifact: ${archivePath}`
    }`
  )
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
