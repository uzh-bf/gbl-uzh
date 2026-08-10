import { execFileSync } from 'node:child_process'
import { existsSync, realpathSync, renameSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import {
  assert,
  assertExpectedFiles,
  dependencyName,
  inspectPackedRuntime,
  preparePackedPackage,
} from '../../../scripts/package-verification.mjs'

const packageRoot = dirname(
  fileURLToPath(new URL('../package.json', import.meta.url))
)
const packedPackage = await preparePackedPackage({
  packageRoot,
  temporaryPrefix: 'gbl-ui-package-',
})
const {
  archivePath,
  artifactPreserved,
  extractedPackageRoot,
  packedFiles,
  packResult,
  temporaryRoot,
} = packedPackage
const {
  declaredRuntimePackages,
  nodeBuiltins,
  packageJson,
  runtimeSpecifiers,
  undeclaredRuntimePackages,
} = inspectPackedRuntime({ extractedPackageRoot, packResult })

try {
  assertExpectedFiles(packedFiles, [
    'LICENSE.md',
    'README.md',
    'package.json',
    'dist/index.js',
    'dist/index.d.ts',
    'dist/style.css',
  ])
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

  assert(
    nodeBuiltins.length === 0,
    `Node built-ins are not allowed in browser bundle: ${nodeBuiltins.join(
      ', '
    )}`
  )

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
      artifactPreserved ? ` Artifact: ${archivePath}` : ''
    }`
  )
} finally {
  packedPackage.cleanup()
}
