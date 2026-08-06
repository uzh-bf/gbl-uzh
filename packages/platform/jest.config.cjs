/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: __dirname,
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  // ESM mode (not the plain ts-jest-to-CJS recipe): several transitive deps
  // (superjson, nanoid 5.x, ...) ship ESM-only builds. Under Jest's own CJS
  // module registry those fail with "Cannot use import statement outside a
  // module" because jest-runtime does not go through Node's native
  // require(esm) interop. Running the whole test file graph as real ESM
  // (via --experimental-vm-modules, wired in the `test` script) avoids the
  // CJS/ESM boundary entirely.
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // NodeNext-style relative imports end in `.js` even though the source is
    // `.ts` (`import { x } from '../foo.js'`). Jest's own resolver has to
    // strip the suffix to find the `.ts` file on disk.
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // `PlayService.ts` imports `withRetry` via a bare `src/lib/util.js`
    // specifier (relies on the package tsconfig's `baseUrl: "."`). Map it the
    // same way as the relative imports above.
    '^src/(.*)\\.js$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        // Transpile-only: skip cross-file type-checking so ts-jest does not
        // fall back to TypeScript's own module resolution/diagnostics, which
        // would choke on the `.js`-suffixed imports above.
        isolatedModules: true,
        tsconfig: {
          module: 'esnext',
          moduleResolution: 'bundler',
          target: 'es2022',
          esModuleInterop: true,
          resolveJsonModule: true,
          skipLibCheck: true,
        },
      },
    ],
  },
}
