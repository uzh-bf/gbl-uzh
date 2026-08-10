import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import {
  assert,
  assertExpectedFiles,
  inspectPackedRuntime,
  preparePackedPackage,
} from '../../../scripts/package-verification.mjs'

const packageRoot = dirname(
  fileURLToPath(new URL('../package.json', import.meta.url))
)
const packedPackage = await preparePackedPackage({
  packageRoot,
  temporaryPrefix: 'gbl-platform-package-',
})
const {
  archivePath,
  artifactPreserved,
  extractedPackageRoot,
  packedFiles,
  packResult,
} = packedPackage
const {
  javascriptFiles,
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
    'dist/trpc/createPlatformRouter.js',
    'dist/trpc/createPlatformRouter.d.ts',
    'dist/trpc/init.js',
    'dist/trpc/init.d.ts',
    'dist/schema.prisma',
  ])

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
      artifactPreserved ? ` Artifact: ${archivePath}` : ''
    }`
  )
} finally {
  packedPackage.cleanup()
}
